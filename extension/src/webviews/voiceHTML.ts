export function getVoiceHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Voice Commands</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: var(--vscode-font-family);
    background: var(--vscode-sideBar-background);
    color: var(--vscode-foreground);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  h3 { font-size: 13px; font-weight: 600; }
  .lang-select {
    width: 100%;
    padding: 6px 10px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 6px;
    font-size: 12px;
  }
  #mic-btn {
    width: 100%;
    padding: 14px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 10px;
    font-size: 28px;
    cursor: pointer;
    transition: all 0.2s;
  }
  #mic-btn.recording {
    background: #c00000;
    animation: pulse 1s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  #status {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    text-align: center;
    min-height: 18px;
  }
  #transcript {
    background: var(--vscode-editor-inactiveSelectionBackground);
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
    min-height: 40px;
    line-height: 1.4;
  }
  #transcript label { font-size: 11px; opacity: 0.7; display: block; margin-bottom: 4px; }
  #result {
    background: var(--vscode-editor-background);
    border: 1px solid var(--vscode-panel-border);
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
    font-family: var(--vscode-editor-font-family);
    min-height: 60px;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
  }
  #result label { font-size: 11px; opacity: 0.7; display: block; margin-bottom: 4px; font-family: var(--vscode-font-family); }
  .text-input-area { display: flex; gap: 6px; }
  #text-cmd {
    flex: 1;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    border-radius: 6px;
    padding: 6px 10px;
    font-size: 12px;
    outline: none;
  }
  #text-send {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none; border-radius: 6px;
    padding: 6px 12px; cursor: pointer; font-size: 12px;
  }
  .shortcuts { font-size: 11px; opacity: 0.6; line-height: 1.6; }
</style>
</head>
<body>
<h3>🎙️ Voice Commands</h3>

<div>
  <label style="font-size:11px;opacity:0.7;display:block;margin-bottom:4px;">Language</label>
  <select class="lang-select" id="lang-select">
    <option value="hi-IN">हिंदी (Hindi)</option>
    <option value="ta-IN">தமிழ் (Tamil)</option>
    <option value="te-IN">తెలుగు (Telugu)</option>
    <option value="kn-IN">ಕನ್ನಡ (Kannada)</option>
    <option value="bn-IN">বাংলা (Bengali)</option>
    <option value="mr-IN">मराठी (Marathi)</option>
    <option value="gu-IN">ગુજરાતી (Gujarati)</option>
    <option value="ml-IN">മലയാളം (Malayalam)</option>
    <option value="en-IN" selected>English (India)</option>
  </select>
</div>

<button id="mic-btn" onclick="toggleRecording()">🎤</button>
<div id="status">Press to speak</div>

<div class="text-input-area">
  <input id="text-cmd" type="text" placeholder="Or type command here..." />
  <button id="text-send" onclick="sendTextCommand()">Go</button>
</div>

<div id="transcript">
  <label>Transcript</label>
  <span id="transcript-text">—</span>
</div>

<div id="result">
  <label>Generated Code</label>
  <span id="result-text">—</span>
</div>

<div class="shortcuts">
  <strong>Shortcuts</strong><br>
  Ctrl+Shift+V — Start voice<br>
  Ctrl+K — Inline edit<br>
  Ctrl+Shift+L — Open chat
</div>

<script>
  const vscode = acquireVsCodeApi();
  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;

  async function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = processAudio;
      mediaRecorder.start();
      isRecording = true;
      document.getElementById('mic-btn').className = 'recording';
      document.getElementById('mic-btn').textContent = '⏹️';
      document.getElementById('status').textContent = '🔴 Recording... (click to stop)';
    } catch (err) {
      document.getElementById('status').textContent = 'Microphone access denied!';
    }
  }

  function stopRecording() {
    if (mediaRecorder) mediaRecorder.stop();
    isRecording = false;
    document.getElementById('mic-btn').className = '';
    document.getElementById('mic-btn').textContent = '🎤';
    document.getElementById('status').textContent = 'Processing...';
  }

  async function processAudio() {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      const lang = document.getElementById('lang-select').value;
      vscode.postMessage({ command: 'audioData', audioBase64: base64, language: lang });
    };
    reader.readAsDataURL(blob);
  }

  function sendTextCommand() {
    const text = document.getElementById('text-cmd').value.trim();
    if (!text) return;
    const lang = document.getElementById('lang-select').value;
    document.getElementById('text-cmd').value = '';
    document.getElementById('transcript-text').textContent = text;
    vscode.postMessage({ command: 'textCommand', text, language: lang });
  }

  document.getElementById('text-cmd').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendTextCommand();
  });

  window.addEventListener('message', (event) => {
    const msg = event.data;
    switch(msg.command) {
      case 'startRecording': startRecording(); break;
      case 'setStatus': document.getElementById('status').textContent = msg.status; break;
      case 'setTranscript': document.getElementById('transcript-text').textContent = msg.text; break;
      case 'setResult': document.getElementById('result-text').textContent = msg.code; break;
    }
  });
</script>
</body>
</html>`;
}
