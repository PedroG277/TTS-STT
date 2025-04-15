from flask import Flask, render_template, request
import os
from datetime import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'audio-chat/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
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

if __name__ == '__main__':
    app.run(debug=True)
