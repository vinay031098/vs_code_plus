import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from src.sarvam.stt import transcribe_audio
from src.sarvam.translate import translate_to_english
from src.sarvam.tts import speak_text
from src.llm_router.router import route_to_model

def run_voice_pipeline(audio_file: str, source_language: str = "hi-IN", speak_back: bool = True):
    """
    Full pipeline:
    1. Transcribe audio (Sarvam STT)
    2. Translate to English (Sarvam Translate)
    3. Route to best LLM
    4. (Optional) Speak back result in user's language
    """

    print("[Pipeline] Step 1: Transcribing audio...")
    transcript = transcribe_audio(audio_file, language_code=source_language)
    print(f"[Pipeline] Transcript: {transcript}")

    print("[Pipeline] Step 2: Translating to English...")
    english_prompt = translate_to_english(transcript, source_language=source_language)
    print(f"[Pipeline] English Prompt: {english_prompt}")

    print("[Pipeline] Step 3: Routing to best LLM...")
    model_config = route_to_model(english_prompt)
    print(f"[Pipeline] Selected Model: {model_config['model']} ({model_config['provider']})")

    # TODO: Call the selected LLM API and get code response
    # code_response = call_llm(english_prompt, model_config)

    if speak_back:
        print("[Pipeline] Step 4: Speaking back confirmation...")
        speak_text("Aapka code generate ho raha hai!", language_code=source_language)

    return {
        "transcript": transcript,
        "english_prompt": english_prompt,
        "model_used": model_config["model"],
        "provider": model_config["provider"]
    }


if __name__ == "__main__":
    # Test the full pipeline
    result = run_voice_pipeline("test_audio.wav", source_language="hi-IN")
    print("\n[Pipeline] Result:")
    print(result)
