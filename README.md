# VS Code Plus 🇮🇳

> An AI-powered code editor built on VS Code — speak in **Hindi, Tamil, Telugu, Kannada, Bengali** and more to write code.

## 🚀 What Makes This Different

| Feature | Cursor/Windsurf | VS Code Plus |
|---|---|---|
| Indian language voice commands | ❌ | ✅ Sarvam AI |
| Multi-model routing | Basic | ✅ Smart + cost-aware |
| Offline mode | ❌ | ✅ Ollama support |
| Beginner explanation mode | ❌ | ✅ In your language |
| Screenshot to code | Basic | ✅ First-class |

## 🏗️ Architecture

```
User Voice (Any Indian Language)
        ↓
Sarvam Saaras V3 (STT)
        ↓
Sarvam Translation Model (→ English)
        ↓
LLM Router (DeepSeek / Claude / GPT-4)
        ↓
Code inserted inline into editor
        ↓
[Optional] Sarvam Bulbul V3 (TTS readback)
```

## 📁 Project Structure

```
vs_code_plus/
├── src/
│   ├── vs_code_fork/        # Forked VS Code source
│   ├── sarvam/              # Sarvam API integration
│   │   ├── stt.py           # Speech to Text
│   │   ├── translate.py     # Indic → English
│   │   └── tts.py           # Text to Speech readback
│   ├── llm_router/          # Smart model routing
│   │   └── router.py
│   └── voice_pipeline/      # Full pipeline orchestrator
│       └── pipeline.py
├── config/
│   └── models.json          # Model config & cost thresholds
├── docs/
│   └── ARCHITECTURE.md
└── README.md
```

## 🛠️ Setup (Coming Soon)

Detailed setup instructions will be added as development progresses.

## 📍 Roadmap

- [ ] Week 1–2: Fork VS Code, build locally
- [ ] Week 3–4: Integrate Sarvam STT into command bar
- [ ] Month 2: Connect LLM router (DeepSeek first)
- [ ] Month 3: Full voice → translate → code pipeline
- [ ] Month 4: Beta launch for Indian CS students

## 🔑 APIs Used

- [Sarvam AI](https://www.sarvam.ai) — Indian language STT, Translation, TTS
- [DeepSeek Coder](https://deepseek.com) — Primary coding LLM (cost-efficient)
- [Anthropic Claude](https://anthropic.com) — Complex refactoring tasks

## 👤 Author

Built by [@vinay031098](https://github.com/vinay031098)
