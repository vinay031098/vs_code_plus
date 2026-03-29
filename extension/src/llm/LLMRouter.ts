import * as vscode from 'vscode';
import axios from 'axios';

type Complexity = 'simple' | 'medium' | 'complex';

export class LLMRouter {
  private deepseekKey: string;
  private anthropicKey: string;

  constructor(private config: vscode.WorkspaceConfiguration) {
    this.deepseekKey = config.get('deepseekApiKey') || '';
    this.anthropicKey = config.get('anthropicApiKey') || '';
  }

  private estimateComplexity(prompt: string): Complexity {
    const p = prompt.toLowerCase();
    if (/refactor|architect|redesign|migrate|entire|whole/.test(p)) return 'complex';
    if (/autocomplete|next line|finish|complete this/.test(p)) return 'simple';
    return 'medium';
  }

  private async callDeepSeek(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-coder',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 4096
    }, {
      headers: { 'Authorization': `Bearer ${this.deepseekKey}`, 'Content-Type': 'application/json' }
    });
    return res.data.choices[0].message.content;
  }

  private async callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
    const res = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    }, {
      headers: {
        'x-api-key': this.anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    });
    return res.data.content[0].text;
  }

  private async route(systemPrompt: string, userPrompt: string, forcedModel?: string): Promise<string> {
    const preferred = this.config.get<string>('preferredModel') || 'auto';
    const model = forcedModel || preferred;
    if (model === 'claude-3-5-sonnet' || this.estimateComplexity(userPrompt) === 'complex') {
      return this.callClaude(systemPrompt, userPrompt);
    }
    return this.callDeepSeek(systemPrompt, userPrompt);
  }

  async chat(userMessage: string, history: Array<{role:string,content:string}>, codeContext: string, fileName: string): Promise<string> {
    const system = `You are an expert AI coding assistant built into VS Code Plus, an Indian-language-first code editor.
Current file: ${fileName}
Always respond in the same language the user writes in (Hindi, Tamil, Telugu, English, etc).
When providing code, wrap it in triple backticks with the language name.
Current file context (first 3000 chars):
${codeContext.substring(0, 3000)}`;

    const historyText = history.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `${historyText}\nuser: ${userMessage}`;
    return this.route(system, prompt);
  }

  async generateCode(instruction: string, context: string): Promise<string> {
    const system = `You are an expert coding assistant. Generate ONLY clean code, no explanations unless asked.
Return only the code block, no markdown fences.`;
    const prompt = `File context:\n${context.substring(0, 2000)}\n\nInstruction: ${instruction}\n\nGenerate the code:`;
    return this.route(system, prompt);
  }

  async editCode(code: string, instruction: string, language: string, fileContext: string): Promise<string> {
    const system = `You are an expert ${language} developer. Edit the given code based on the instruction.
Return ONLY the modified code, no explanations, no markdown fences.`;
    const prompt = `Instruction: ${instruction}\n\nCode to edit:\n${code}\n\nModified code:`;
    return this.route(system, prompt);
  }

  async generateAtCursor(instruction: string, currentLine: string, language: string, fileContext: string): Promise<string> {
    const system = `You are an expert ${language} developer. Generate code based on instruction.
Return ONLY the code to insert, no explanations, no markdown fences.`;
    const prompt = `Current line: ${currentLine}\nInstruction: ${instruction}\nFile context (partial):\n${fileContext.substring(0, 1500)}\n\nCode to insert:`;
    return this.route(system, prompt);
  }

  async explainCode(code: string, language: string): Promise<string> {
    const langMap: Record<string,string> = {
      'hi-IN': 'Hindi', 'ta-IN': 'Tamil', 'te-IN': 'Telugu',
      'kn-IN': 'Kannada', 'bn-IN': 'Bengali', 'en-IN': 'English'
    };
    const langName = langMap[language] || 'English';
    const system = `You are a helpful coding tutor. Explain code clearly in ${langName}. Be beginner-friendly.`;
    const prompt = `Explain this code in ${langName}:\n\n${code}`;
    return this.route(system, prompt);
  }

  async fixBug(code: string): Promise<string> {
    const system = `You are an expert debugger. Fix the bug in the given code.
Return ONLY the fixed code, no explanations, no markdown fences.`;
    const prompt = `Fix the bug in this code:\n\n${code}\n\nFixed code:`;
    return this.route(system, prompt);
  }

  async generateTests(code: string): Promise<string> {
    const system = `You are an expert at writing tests. Generate comprehensive unit tests for the given code.
Use appropriate testing framework based on the language detected.`;
    const prompt = `Generate unit tests for:\n\n${code}`;
    return this.route(system, prompt, 'claude-3-5-sonnet');
  }
}
