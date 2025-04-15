let mediaRecorder;
let audioChunks = [];

document.getElementById('startBtn').onclick = async () => {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
        let audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        let formData = new FormData();
        formData.append('audio_data', audioBlob);

        await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        audioChunks = [];
        alert("Audio uploaded!");
    };

    mediaRecorder.start();
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
};

document.getElementById('stopBtn').onclick = () => {
    mediaRecorder.stop();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
};
