import os
from openai import AzureOpenAI
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

def whisper():
    # --- Azure Config ---
    AUDIO_FILE = "static/uploads/voice.webm"
    endpoint = os.getenv("ENDPOINT_URL", "https://isctesintra-alunos.openai.azure.com/")
    deployment = os.getenv("WHISPER_DEPLOYMENT", "whisper")

    # --- Auth via Entra ID ---
    token_provider = get_bearer_token_provider(
        DefaultAzureCredential(),
        "https://cognitiveservices.azure.com/.default"
    )

    client = AzureOpenAI(
        azure_endpoint=endpoint,
        azure_ad_token_provider=token_provider,
        api_version="2024-05-01-preview"
    )

    # --- Transcribe ---
    with open(AUDIO_FILE, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model=deployment,
            #language="pt",  # Optional, auto-detect if omitted
            response_format="text",
        )

    print("📝 Transcription result:\n", transcription)
    return transcription
