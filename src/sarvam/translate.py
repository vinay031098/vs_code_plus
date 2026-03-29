import requests

SARVAM_API_KEY = "YOUR_SARVAM_API_KEY"  # Replace with your key
TRANSLATE_URL = "https://api.sarvam.ai/translate"

def translate_to_english(text: str, source_language: str = "hi-IN") -> str:
    """
    Translate Indic language text to English using Sarvam.
    Used to convert voice commands into English before passing to LLM.
    """
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "input": text,
        "source_language_code": source_language,
        "target_language_code": "en-IN",
        "speaker_gender": "Male",
        "mode": "code-mixed",  # Handles Hinglish etc.
        "enable_preprocessing": True
    }

    response = requests.post(TRANSLATE_URL, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json().get("translated_text", "")
    else:
        raise Exception(f"Sarvam Translate Error: {response.status_code} - {response.text}")


if __name__ == "__main__":
    hindi_command = "ek login function banao jo email aur password le"
    english = translate_to_english(hindi_command, source_language="hi-IN")
    print(f"Translated: {english}")
