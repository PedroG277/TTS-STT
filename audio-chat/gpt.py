import os  
import base64
from openai import AzureOpenAI  
from azure.identity import DefaultAzureCredential, get_bearer_token_provider  
import json

conversation_history = [
    {"role": "system", "content": "You are a helpful assistant. Respond only to the last user prompt, using information from other prompts if relevant."}
]

def clearHistory():
    conversation_history.clear()
    conversation_history.append(
        {"role": "system", "content": "You are a helpful assistant. Respond only to the last user prompt, using information from other prompts if relevant."}
    )

def gpt(prompt):
    endpoint = os.getenv("ENDPOINT_URL", "https://isctesintra-alunos.openai.azure.com/")  
    deployment = os.getenv("DEPLOYMENT_NAME", "gpt-4o")  
        
    # Inicializar o cliente do Azure OpenAI Service com autenticação do Entra ID
    token_provider = get_bearer_token_provider(  
        DefaultAzureCredential(),  
        "https://cognitiveservices.azure.com/.default"  
    )  
    
    client = AzureOpenAI(  
        azure_endpoint=endpoint,  
        azure_ad_token_provider=token_provider,  
        api_version="2024-05-01-preview",  
    )  
    
    conversation_history.append({"role": "user", "content": prompt})


    # chat_prompt = [
    #     {"role": "system", "content": "You are a helpful assistant."},
    #     {"role": "user", "content": prompt}
    # ]
    
    # Incluir resultado da voz se a voz estiver ativada
    messages = conversation_history 

    completion = client.chat.completions.create(  
        model=deployment,  
        messages=messages,
        max_tokens=800,  
        temperature=0.7,  
        top_p=0.95,  
        frequency_penalty=0,  
        presence_penalty=0,
        stop=None,  
        stream=False  
    )  

    data = json.loads(completion.to_json())
    content = data['choices'][0]['message']['content']
    conversation_history.append({"role": "assistant", "content": content})

    print(content)
    return content