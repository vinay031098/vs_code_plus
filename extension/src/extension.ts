import * as vscode from 'vscode';
import { ChatViewProvider } from './panels/ChatViewProvider';
import { VoiceViewProvider } from './panels/VoiceViewProvider';
import { InlineEditProvider } from './providers/InlineEditProvider';
import { StatusBarManager } from './ui/StatusBarManager';
import { LLMRouter } from './llm/LLMRouter';
import { SarvamService } from './sarvam/SarvamService';

export function activate(context: vscode.ExtensionContext) {
  console.log('VS Code Plus is now active!');

  const config = vscode.workspace.getConfiguration('vscplus');
  const sarvamService = new SarvamService(config.get('sarvamApiKey') || '');
  const llmRouter = new LLMRouter(config);
  const statusBar = new StatusBarManager();

  // Register Chat Sidebar
  const chatProvider = new ChatViewProvider(context.extensionUri, llmRouter, sarvamService);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscplus.chatView', chatProvider)
  );

  // Register Voice Sidebar
  const voiceProvider = new VoiceViewProvider(context.extensionUri, sarvamService, llmRouter);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscplus.voiceView', voiceProvider)
  );

  // Inline Edit (Ctrl+K)
  const inlineEdit = new InlineEditProvider(llmRouter);
  context.subscriptions.push(
    vscode.commands.registerCommand('vscplus.inlineEdit', () => inlineEdit.trigger())
  );

  // Open Chat
  context.subscriptions.push(
    vscode.commands.registerCommand('vscplus.openChat', () => {
      vscode.commands.executeCommand('vscplus.chatView.focus');
    })
  );

  // Voice Command
  context.subscriptions.push(
    vscode.commands.registerCommand('vscplus.voiceCommand', () => {
      vscode.commands.executeCommand('vscplus.voiceView.focus');
      voiceProvider.startListening();
    })
  );

  // Explain Code
  context.subscriptions.push(
    vscode.commands.registerCommand('vscplus.explainCode', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) { vscode.window.showWarningMessage('Select code first!'); return; }
      const lang = config.get<string>('defaultLanguage') || 'hi-IN';
      const explanation = await llmRouter.explainCode(selection, lang);
      chatProvider.addMessage('assistant', explanation);
      vscode.commands.executeCommand('vscplus.chatView.focus');
    })
  );

  // Fix Bug
  context.subscriptions.push(
    vscode.commands.registerCommand('vscplus.fixBug', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      if (!selection) { vscode.window.showWarningMessage('Select buggy code first!'); return; }
      const fixed = await llmRouter.fixBug(selection);
      editor.edit(editBuilder => editBuilder.replace(editor.selection, fixed));
      vscode.window.showInformationMessage('Bug fixed by VS Code Plus!');
    })
  );

  // Generate Tests
  context.subscriptions.push(
    vscode.commands.registerCommand('vscplus.generateTests', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const selection = editor.document.getText(editor.selection);
      const tests = await llmRouter.generateTests(selection);
      const doc = await vscode.workspace.openTextDocument({ content: tests, language: 'python' });
      vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    })
  );

  statusBar.show('VS Code Plus Ready $(hubot)');
  vscode.window.showInformationMessage('VS Code Plus activated! Press Ctrl+Shift+L to open AI Chat.');
}

export function deactivate() {}
