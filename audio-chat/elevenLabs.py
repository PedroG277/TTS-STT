from elevenlabs import ElevenLabs
from flask import send_file
import io

def elevenLabs_synthesize(text, voice):

    client = ElevenLabs(
        api_key="sk_d7a702dc58972581e933a1d1a895926545387cc77887558d",
    )

    voices = {
        "Paulo": "aLFUti4k8YKvtQGXv0UO"
    }

    audio_stream = client.text_to_speech.convert(
        voice_id=voices[voice],
        output_format="mp3_44100_128",
        text=text,
        model_id="eleven_multilingual_v2",
    )

    # Read all chunks once
    audio_data = b''.join(chunk for chunk in audio_stream)

    # Save to file (optional)
    with open("static/uploads/output.mp3", "wb") as f:
        f.write(audio_data)
        print("Audio Saved (elevenlabs)")

    # Return as streaming response
    return send_file(
        io.BytesIO(audio_data),
        mimetype="audio/mpeg",
        as_attachment=False,
        download_name="speech.mp3"
    )