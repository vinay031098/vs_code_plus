import axios from 'axios';

const BASE_URL = 'https://api.sarvam.ai';

export class SarvamService {
  constructor(private apiKey: string) {}

  async speechToText(audioBase64: string, languageCode: string = 'hi-IN'): Promise<string> {
    if (!this.apiKey) throw new Error('Sarvam API key not set. Go to Settings > VS Code Plus > Sarvam API Key');

    // Convert base64 to blob and send
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', audioBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
    form.append('language_code', languageCode);
    form.append('model', 'saaras:v3');
    form.append('with_timestamps', 'false');

    const res = await axios.post(`${BASE_URL}/speech-to-text`, form, {
      headers: { ...form.getHeaders(), 'api-subscription-key': this.apiKey }
    });
    return res.data.transcript || '';
  }

  async translate(text: string, sourceLanguage: string): Promise<string> {
    if (!this.apiKey) throw new Error('Sarvam API key not set.');
    if (sourceLanguage === 'en-IN') return text;

    const res = await axios.post(`${BASE_URL}/translate`, {
      input: text,
      source_language_code: sourceLanguage,
      target_language_code: 'en-IN',
      mode: 'code-mixed',
      enable_preprocessing: true
    }, {
      headers: { 'api-subscription-key': this.apiKey, 'Content-Type': 'application/json' }
    });
    return res.data.translated_text || text;
  }

  async textToSpeech(text: string, languageCode: string = 'hi-IN'): Promise<string> {
    if (!this.apiKey) throw new Error('Sarvam API key not set.');

    const res = await axios.post(`${BASE_URL}/text-to-speech`, {
      inputs: [text],
      target_language_code: languageCode,
      speaker: 'meera',
      model: 'bulbul:v3',
      enable_preprocessing: true
    }, {
      headers: { 'api-subscription-key': this.apiKey, 'Content-Type': 'application/json' }
    });
    return res.data.audios[0]; // base64 audio
  }
}
