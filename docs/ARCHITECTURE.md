# VS Code Plus — Architecture

## Overview

VS Code Plus is a fork of the open-source VS Code (Code-OSS) with a native Indian language voice command layer powered by Sarvam AI.

## Voice Pipeline Flow

```
[Microphone Input]
      ↓
[Sarvam Saaras V3] — Speech to Text (22 Indian languages)
      ↓
[Sarvam Translate] — Indic language → English instruction
      ↓
[LLM Router] — Routes to cheapest capable model:
    • Simple tasks  → DeepSeek Coder (cheapest)
    • Medium tasks  → DeepSeek Chat
    • Complex tasks → Claude 3.5 Sonnet
      ↓
[Code Response] — Inserted inline into VS Code editor
      ↓
[Sarvam Bulbul V3] — Optional TTS readback in user's language
```

## Key Modules

### `src/sarvam/`
- `stt.py` — Wraps Sarvam Saaras V3 Speech-to-Text API
- `translate.py` — Wraps Sarvam Translation API (Indic → English)
- `tts.py` — Wraps Sarvam Bulbul V3 Text-to-Speech API

### `src/llm_router/`
- `router.py` — Estimates task complexity and routes to optimal LLM

### `src/voice_pipeline/`
- `pipeline.py` — Orchestrates the full STT → Translate → LLM → TTS flow

### `config/models.json`
- Central config for all models, cost thresholds, and Sarvam settings

## Future Modules (Roadmap)
- `src/screenshot_to_code/` — Drag image → generate UI component
- `src/persistent_memory/` — Project-level memory that persists across sessions
- `src/offline_mode/` — Ollama integration for zero-internet coding
- `src/beginner_mode/` — Explain code in user's regional language
