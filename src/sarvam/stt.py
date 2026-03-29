import requests
import json

SARVAM_API_KEY = "YOUR_SARVAM_API_KEY"  # Replace with your key from sarvam.ai
STT_URL = "https://api.sarvam.ai/speech-to-text"

def transcribe_audio(audio_file_path: str, language_code: str = "hi-IN") -> str:
    """
    Transcribe audio file to text using Sarvam Saaras V3.
    Supported languages: hi-IN, ta-IN, te-IN, kn-IN, bn-IN, mr-IN, gu-IN, ml-IN, pa-IN, od-IN, ur-IN
    """
    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }

    with open(audio_file_path, "rb") as audio_file:
        files = {
            "file": (audio_file_path, audio_file, "audio/wav")
        }
        data = {
            "language_code": language_code,
            "model": "saaras:v3",
            "with_timestamps": False
        }
        response = requests.post(STT_URL, headers=headers, files=files, data=data)

    if response.status_code == 200:
        result = response.json()
        return result.get("transcript", "")
    else:
        raise Exception(f"Sarvam STT Error: {response.status_code} - {response.text}")


if __name__ == "__main__":
    # Test with a sample audio file
    transcript = transcribe_audio("test_audio.wav", language_code="hi-IN")
    print(f"Transcript: {transcript}")
