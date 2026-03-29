# VS Code Plus — Setup Guide

## Prerequisites
- Node.js v18+
- npm v9+
- VS Code v1.85+

## Step 1: Install Dependencies
```bash
cd extension
npm install
```

## Step 2: Compile TypeScript
```bash
npm run compile
```

## Step 3: Set API Keys
Open VS Code Settings (Ctrl+,) and search for "VS Code Plus":
- `vscplus.sarvamApiKey` — Get from https://sarvam.ai (free tier available)
- `vscplus.deepseekApiKey` — Get from https://platform.deepseek.com (very cheap)
- `vscplus.anthropicApiKey` — Get from https://console.anthropic.com

## Step 4: Run in VS Code
1. Open the `extension/` folder in VS Code
2. Press **F5** to launch Extension Development Host
3. A new VS Code window opens with VS Code Plus active!

## Step 5: Use It!
- **Ctrl+Shift+L** — Open AI Chat sidebar
- **Ctrl+K** — Inline edit at cursor
- **Ctrl+Shift+V** — Voice command (Hindi/Tamil/Telugu etc.)
- **Right-click selected code** → Explain / Fix Bug / Generate Tests

## Packaging as .vsix (distributable)
```bash
npm install -g vsce
vsce package
# Creates vs-code-plus-0.1.0.vsix
```

## Install the .vsix in any VS Code
```bash
code --install-extension vs-code-plus-0.1.0.vsix
```
