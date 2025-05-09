from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime
from whisper import whisper
from gpt import gpt
from gpt import clearHistory
from tts import synthesize
from elevenLabs import elevenLabs_synthesize

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    clearHistory()
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    if 'audio_data' in request.files:
        audio = request.files['audio_data']
        filename ='voice.webm'
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        audio.save(filepath)
        return 'Audio saved successfully'
    return 'No audio uploaded', 400


@app.route('/audioToText', methods=['GET'])
def audioToText():
    result = whisper()
    return jsonify({"transcription": result})

@app.route('/generateResponse', methods=['GET'])
def generateResponse():
    prompt = request.args.get('prompt')
    result = gpt(prompt)
    return jsonify({"response": result})


    

@app.route('/textToAudio', methods=['POST'])
def textToAudio():
    data = request.get_json()
    text = data.get('text')
    model = data.get('model')
    voice = data.get('voice', 'onyx') #defaut to onyx if error or omitted

    if (model == "azure") :
        return synthesize(text, voice)  
    elif (model == "elevenlabs"):
        return elevenLabs_synthesize(text, voice)  

    print(text)






if __name__ == '__main__':
    app.run(debug=True)
