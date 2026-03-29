export function getChatHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>VS Code Plus Chat</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    background: var(--vscode-sideBar-background);
    color: var(--vscode-foreground);
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  #header {
    padding: 10px 12px;
    background: var(--vscode-titleBar-activeBackground);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--vscode-panel-border);
  }
  #header h3 { font-size: 13px; font-weight: 600; }
  #clear-btn {
    background: none; border: none;
    color: var(--vscode-foreground); cursor: pointer; font-size: 12px;
    opacity: 0.7;
  }
  #clear-btn:hover { opacity: 1; }
  #messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .message {
    max-width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    word-break: break-word;
  }
  .message.user {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    align-self: flex-end;
    border-bottom-right-radius: 2px;
  }
  .message.assistant {
    background: var(--vscode-editor-inactiveSelectionBackground);
    border-bottom-left-radius: 2px;
  }
  .message.error { background: #c00000; color: #fff; }
  .code-block {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    margin: 8px 0;
    overflow: hidden;
  }
  .code-header {
    background: var(--vscode-titleBar-activeBackground);
    padding: 4px 10px;
    font-size: 11px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .code-header button {
    background: none; border: 1px solid var(--vscode-panel-border);
    color: var(--vscode-foreground); cursor: pointer;
    font-size: 11px; padding: 2px 8px; border-radius: 3px; margin-left: 4px;
  }
  .code-header button:hover { background: var(--vscode-button-background); }
  pre {
    padding: 12px;
    overflow-x: auto;
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
    line-height: 1.4;
    margin: 0;
  }
  #loading {
    display: none;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }
  #input-area {
    padding: 10px;
    border-top: 1px solid var(--vscode-panel-border);
    display: flex;
    gap: 6px;
    align-items: flex-end;
  }
  #user-input {
    flex: 1;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 6px;
    padding: 8px 10px;
    font-size: 13px;
    font-family: var(--vscode-font-family);
    resize: none;
    min-height: 38px;
    max-height: 120px;
    outline: none;
  }
  #user-input:focus { border-color: var(--vscode-focusBorder); }
  #send-btn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none; border-radius: 6px;
    padding: 8px 14px; cursor: pointer;
    font-size: 13px; white-space: nowrap;
  }
  #send-btn:hover { background: var(--vscode-button-hoverBackground); }
  .welcome {
    text-align: center;
    padding: 30px 16px;
    color: var(--vscode-descriptionForeground);
    font-size: 13px;
    line-height: 1.6;
  }
  .welcome h2 { font-size: 16px; margin-bottom: 8px; color: var(--vscode-foreground); }
  .tip { font-size: 11px; margin-top: 12px; opacity: 0.7; }
</style>
</head>
<body>
<div id="header">
  <h3>🤖 VS Code Plus AI</h3>
  <button id="clear-btn" onclick="clearChat()">Clear</button>
</div>
<div id="messages">
  <div class="welcome">
    <h2>Namaste! 🙏</h2>
    <p>Ask me anything in <strong>Hindi, Tamil, Telugu, English</strong> or any Indian language.</p>
    <p class="tip">💡 Tip: Select code and right-click → Explain / Fix Bug<br>Press <kbd>Ctrl+K</kbd> for inline edit</p>
  </div>
</div>
<div id="loading">⏳ Thinking...</div>
<div id="input-area">
  <textarea id="user-input" placeholder="Type in any language... (Hindi, Tamil, English)" rows="1"></textarea>
  <button id="send-btn" onclick="sendMessage()">Send ↵</button>
</div>

<script>
  const vscode = acquireVsCodeApi();
  const messagesDiv = document.getElementById('messages');
  const input = document.getElementById('user-input');
  const loading = document.getElementById('loading');

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    // Auto-resize
    setTimeout(() => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    }, 0);
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = '38px';
    vscode.postMessage({ command: 'sendMessage', text });
  }

  function clearChat() {
    vscode.postMessage({ command: 'clearChat' });
  }

  function formatContent(content) {
    // Parse code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map(part => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const lang = lines[0].replace('```', '').trim() || 'code';
        const code = lines.slice(1, -1).join('\n');
        const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const encodedCode = btoa(unescape(encodeURIComponent(code)));
        return '<div class="code-block"><div class="code-header"><span>' + lang + '</span><div>' +
          '<button onclick="insertCode(\'' + encodedCode + '\')">Insert</button>' +
          '<button onclick="copyCode(\'' + encodedCode + '\')">Copy</button>' +
          '</div></div><pre>' + escapedCode + '</pre></div>';
      }
      return '<span>' + part.replace(/\n/g, '<br>') + '</span>';
    }).join('');
  }

  function insertCode(encodedCode) {
    const code = decodeURIComponent(escape(atob(encodedCode)));
    vscode.postMessage({ command: 'insertCode', code });
  }

  function copyCode(encodedCode) {
    const code = decodeURIComponent(escape(atob(encodedCode)));
    vscode.postMessage({ command: 'copyCode', code });
  }

  function addMessage(role, content) {
    // Remove welcome message
    const welcome = messagesDiv.querySelector('.welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = 'message ' + role;
    div.innerHTML = formatContent(content);
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    switch (msg.command) {
      case 'addMessage': addMessage(msg.role, msg.content); break;
      case 'setLoading': loading.style.display = msg.loading ? 'block' : 'none'; break;
      case 'clearChat':
        messagesDiv.innerHTML = '<div class="welcome"><h2>Namaste! 🙏</h2><p>Chat cleared. Ask anything!</p></div>';
        break;
    }
  });
</script>
</body>
</html>`;
}
