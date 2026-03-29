import * as vscode from 'vscode';
import { SarvamService } from '../sarvam/SarvamService';
import { LLMRouter } from '../llm/LLMRouter';
import { getVoiceHTML } from '../webviews/voiceHTML';

export class VoiceViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _sarvam: SarvamService,
    private readonly _llmRouter: LLMRouter
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = getVoiceHTML();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'audioData':
          await this._processAudio(message.audioBase64, message.language);
          break;
        case 'textCommand':
          await this._processTextCommand(message.text, message.language);
          break;
      }
    });
  }

  startListening() {
    this._view?.webview.postMessage({ command: 'startRecording' });
  }

  private async _processAudio(audioBase64: string, language: string) {
    this._view?.webview.postMessage({ command: 'setStatus', status: 'Transcribing...' });
    try {
      const transcript = await this._sarvam.speechToText(audioBase64, language);
      this._view?.webview.postMessage({ command: 'setTranscript', text: transcript });
      await this._processTextCommand(transcript, language);
    } catch (err: any) {
      this._view?.webview.postMessage({ command: 'setStatus', status: `Error: ${err.message}` });
    }
  }

  private async _processTextCommand(text: string, language: string) {
    this._view?.webview.postMessage({ command: 'setStatus', status: 'Translating...' });
    try {
      const englishPrompt = language === 'en-IN' ? text : await this._sarvam.translate(text, language);
      this._view?.webview.postMessage({ command: 'setStatus', status: 'Generating code...' });
      const editor = vscode.window.activeTextEditor;
      const context = editor ? editor.document.getText() : '';
      const code = await this._llmRouter.generateCode(englishPrompt, context);
      this._view?.webview.postMessage({ command: 'setResult', code, prompt: englishPrompt });
      // Insert code into editor
      if (editor) {
        editor.edit(editBuilder => editBuilder.replace(editor.selection, code));
        vscode.window.showInformationMessage(`Voice command executed: "${text}"`);
      }
      this._view?.webview.postMessage({ command: 'setStatus', status: 'Done!' });
    } catch (err: any) {
      this._view?.webview.postMessage({ command: 'setStatus', status: `Error: ${err.message}` });
    }
  }
}
