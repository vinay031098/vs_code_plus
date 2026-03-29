import requests
import base64

SARVAM_API_KEY = "YOUR_SARVAM_API_KEY"
TTS_URL = "https://api.sarvam.ai/text-to-speech"

def speak_text(text: str, language_code: str = "hi-IN", output_file: str = "output.wav"):
    """
    Convert text to speech using Sarvam Bulbul V3.
    Used to read back code explanations in user's language.
    """
    headers = {
        "api-subscription-key": SARVAM_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "inputs": [text],
        "target_language_code": language_code,
        "speaker": "meera",  # Options: meera, pavithra, maitreyi, arvind, amol, amartya
        "model": "bulbul:v3",
        "enable_preprocessing": True
    }

    response = requests.post(TTS_URL, headers=headers, json=payload)

    if response.status_code == 200:
        audio_data = response.json()["audios"][0]
        audio_bytes = base64.b64decode(audio_data)
        with open(output_file, "wb") as f:
            f.write(audio_bytes)
        print(f"Audio saved to {output_file}")
    else:
        raise Exception(f"Sarvam TTS Error: {response.status_code} - {response.text}")


if __name__ == "__main__":
    speak_text("Aapka code successfully generate ho gaya!", language_code="hi-IN")
