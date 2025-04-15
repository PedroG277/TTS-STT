import requests
from azure.identity import AzureCliCredential


endpoint = "https://isctesintra-alunos.openai.azure.com/openai/deployments/tts-hd/audio/speech?api-version=2024-05-01-preview"

# Get Azure AD token
def get_token():
    credential = AzureCliCredential()
    token = credential.get_token("https://cognitiveservices.azure.com/.default")
    return token.token

def synthesize(text):
    token = get_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    body = {
        "input": text,
        "voice": "onyx",
        "response_format": "mp3"
    }

    response = requests.post(endpoint, headers=headers, json=body)

    if response.status_code == 200:
        with open("C:\\Users\\pgril\\Documents\\gpt\\output.mp3", "wb") as f:
            f.write(response.content)
        print("✅ Audio saved to output.mp3")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")


# Example usage
synthesize("Do not go gentle into that good night. Old age should burn and rave at close of day; Rage, rage against the dying of the light. Though wise men at their end know dark is right, Because their words had forked no lightning they Do not go gentle into that good night. Rage, rage against the dying of the light.")
