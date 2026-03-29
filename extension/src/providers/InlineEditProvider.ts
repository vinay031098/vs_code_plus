import * as vscode from 'vscode';
import { LLMRouter } from '../llm/LLMRouter';

export class InlineEditProvider {
  constructor(private readonly _llmRouter: LLMRouter) {}

  async trigger() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const lineText = editor.document.lineAt(selection.active.line).text;

    // Show input box like Cursor's Ctrl+K
    const instruction = await vscode.window.showInputBox({
      placeHolder: 'What do you want to do? (e.g. "add error handling" / "yahan error handling add karo")',
      prompt: selectedText
        ? `Editing selected code: "${selectedText.substring(0, 60)}..."`
        : `At line ${selection.active.line + 1}: "${lineText.trim().substring(0, 60)}"`,
      ignoreFocusOut: true
    });

    if (!instruction) return;

    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'VS Code Plus: Generating...',
      cancellable: false
    }, async () => {
      try {
        const fileContent = editor.document.getText();
        const language = editor.document.languageId;

        let result: string;
        if (selectedText) {
          result = await this._llmRouter.editCode(selectedText, instruction, language, fileContent);
          await editor.edit(editBuilder => editBuilder.replace(selection, result));
        } else {
          result = await this._llmRouter.generateAtCursor(instruction, lineText, language, fileContent);
          const position = selection.active;
          await editor.edit(editBuilder => editBuilder.insert(position, '\n' + result));
        }
        vscode.window.showInformationMessage('VS Code Plus: Done!');
      } catch (err: any) {
        vscode.window.showErrorMessage(`VS Code Plus Error: ${err.message}`);
      }
    });
  }
}
