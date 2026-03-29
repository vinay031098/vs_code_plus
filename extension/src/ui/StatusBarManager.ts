import * as vscode from 'vscode';

export class StatusBarManager {
  private _item: vscode.StatusBarItem;

  constructor() {
    this._item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this._item.command = 'vscplus.openChat';
    this._item.tooltip = 'Open VS Code Plus AI Chat';
  }

  show(text: string) {
    this._item.text = text;
    this._item.show();
  }

  update(text: string) {
    this._item.text = text;
  }

  dispose() {
    this._item.dispose();
  }
}
