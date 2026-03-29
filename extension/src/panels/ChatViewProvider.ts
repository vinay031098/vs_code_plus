import * as vscode from 'vscode';
import { LLMRouter } from '../llm/LLMRouter';
import { SarvamService } from '../sarvam/SarvamService';
import { getChatHTML } from '../webviews/chatHTML';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _messages: Array<{role: string, content: string}> = [];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _llmRouter: LLMRouter,
    private readonly _sarvam: SarvamService
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = getChatHTML();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'sendMessage':
          await this._handleUserMessage(message.text);
          break;
        case 'clearChat':
          this._messages = [];
          this._postToWebview({ command: 'clearChat' });
          break;
        case 'insertCode':
          this._insertCodeIntoEditor(message.code);
          break;
        case 'copyCode':
          vscode.env.clipboard.writeText(message.code);
          vscode.window.showInformationMessage('Code copied!');
          break;
      }
    });
  }

  async _handleUserMessage(text: string) {
    this._messages.push({ role: 'user', content: text });
    this._postToWebview({ command: 'addMessage', role: 'user', content: text });
    this._postToWebview({ command: 'setLoading', loading: true });

    try {
      const editor = vscode.window.activeTextEditor;
      const codeContext = editor ? editor.document.getText() : '';
      const fileName = editor ? editor.document.fileName : '';
      const response = await this._llmRouter.chat(text, this._messages, codeContext, fileName);
      this._messages.push({ role: 'assistant', content: response });
      this._postToWebview({ command: 'addMessage', role: 'assistant', content: response });
    } catch (err: any) {
      this._postToWebview({ command: 'addMessage', role: 'error', content: `Error: ${err.message}` });
    } finally {
      this._postToWebview({ command: 'setLoading', loading: false });
    }
  }

  addMessage(role: string, content: string) {
    this._messages.push({ role, content });
    this._postToWebview({ command: 'addMessage', role, content });
  }

  private _insertCodeIntoEditor(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { vscode.window.showWarningMessage('No active editor!'); return; }
    editor.edit(editBuilder => editBuilder.replace(editor.selection, code));
  }

  private _postToWebview(message: any) {
    this._view?.webview.postMessage(message);
  }
}
