let mediaRecorder;
let isrecording = false;
let audioChunks = [];

// let messagesA = ["message A", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor ligula vitae lectus ultrices, eget vestibulum libero malesuada. Donec semper lacus ante, dictum viverra neque varius finibus. Donec eget viverra mauris. Maecenas mattis odio eget sapien interdum tristique. Maecenas orci nisl, vulputate nec tincidunt vel, ullamcorper a mi. Vivamus congue commodo sapien, vulputate ullamcorper felis ullamcorper ac. Vestibulum sollicitudin felis et tempus pretium. Praesent ante dui, egestas eget lorem non, aliquet sollicitudin erat. Duis vitae mauris at nisi ultrices dignissim ac tincidunt felis. Donec tempus porta metus. Vestibulum rutrum nisi id nibh pellentesque, at congue justo tincidunt. Sed laoreet lacus a bibendum ultricies. Phasellus commodo luctus libero eu imperdiet. Morbi commodo finibus nibh eget tempus. Etiam ultrices ac risus quis ullamcorper."];
// let messagesB = ["message B", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor ligula vitae lectus ultrices, eget vestibulum libero malesuada. Donec semper lacus ante, dictum viverra neque varius finibus. Donec eget viverra mauris. Maecenas mattis odio eget sapien interdum tristique. Maecenas orci nisl, vulputate nec tincidunt vel, ullamcorper a mi. Vivamus congue commodo sapien, vulputate ullamcorper felis ullamcorper ac. Vestibulum sollicitudin felis et tempus pretium. Praesent ante dui, egestas eget lorem non, aliquet sollicitudin erat. Duis vitae mauris at nisi ultrices dignissim ac tincidunt felis. Donec tempus porta metus. Vestibulum rutrum nisi id nibh pellentesque, at congue justo tincidunt. Sed laoreet lacus a bibendum ultricies. Phasellus commodo luctus libero eu imperdiet. Morbi commodo finibus nibh eget tempus. Etiam ultrices ac risus quis ullamcorper."];

let messagesA = []
let messagesB = []

let loading = createLoadingElement("a")
let recording = createRecordingElement()


document.getElementById('startBtn').onclick = async () => {
    isrecording = !isrecording;
    if (isrecording == true) {
        document.getElementById('recording_btn_text').textContent = "Stop Recording"
        document.getElementById('startBtn').classList.add('btn-danger')

        addRecording()

        console.log('Recording...')
        let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            recording.remove()

            addLoading("a")

            let audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            let formData = new FormData();
            formData.append('audio_data', audioBlob);

            await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            audioChunks = [];

            console.log('Generating text...')
            let text = await fetch('/audioToText', {
                method: 'GET'
            }).then(response => response.json())
            .then(data => {
                console.log('Transcription genereated:')
                console.log(data.transcription)

                removeLoading()

                return data.transcription
            })

            messagesA.push(text)
            addMessage(text, "a")

            await genereateResponse(text)

        };

        mediaRecorder.start();

    }
    else {
        document.getElementById('recording_btn_text').textContent = "Start Recording"
        document.getElementById('startBtn').classList.remove('btn-danger')

        console.log('Stoped recording')
        mediaRecorder.stop();

    }
};

async function genereateResponse(text) {
    addLoading("b")
    let response = await fetch(`/generateResponse?prompt=${encodeURIComponent(text)}`)
        .then(response => response.json())
        .then(data => {
            console.log("GPT Response:", data.response);
            return data.response
        })
        .catch(error => {
            console.error("Error:", error);
        });

    messagesB.push(response)

    removeLoading();
    addMessage(response, "b")
}


function addLoading(side) {
    loading = createLoadingElement(side)
    chatBox.appendChild(loading)
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoading() {
    loading.remove()
}


function addRecording(side) {
    chatBox.appendChild(recording)
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeRecording() {
    recording.remove()
}


function addMessage(text, sender) {
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper", sender === "a" ? "a" : "b")

    const messageElement = createMessageElement(text, sender);

    messageWrapper.appendChild(messageElement)

    // If sender is B, add button
    if (sender === "b") {
        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.classList.add("d-flex", "align-items-center", "gap-2");

        // === LISTEN BUTTON ===
        const btn = document.createElement("button");
        btn.classList.add("btn", "btn-sm", "btn-outline-secondary", "d-flex", "align-items-center", "listen-btn");

        const svg = document.createElement("img");
        svg.src = "/static/icons/audio.svg";
        svg.alt = "Listen";
        svg.style.width = "24px";
        svg.style.height = "24px";
        svg.classList.add("me-1");

        btn.appendChild(svg);
        btn.appendChild(document.createTextNode("Listen"));

        // === MODEL SELECT ===
        const modelSelect = document.createElement('select');
        modelSelect.classList.add('form-select', 'form-select-sm', 'voice-dropdown');
        modelSelect.style.width = "auto";
        modelSelect.innerHTML = `
            <option value="azure">Azure</option>
            <option value="elevenlabs">ElevenLabs</option>
        `;


        // === VOICE SELECT ===
        const voiceSelect = document.createElement('select');
        voiceSelect.classList.add('form-select', 'form-select-sm', 'voice-dropdown');
        voiceSelect.style.width = "auto";

        const voiceOptions = {
            azure: ['onyx', 'nova', 'echo', 'fable', 'shimmer', 'alloy'],
            elevenlabs: ['Paulo']
        };

        // Function to update voice options
        function updateVoiceOptions(model) {
            voiceSelect.innerHTML = '';
            voiceOptions[model].forEach(voice => {
                const opt = document.createElement("option");
                opt.value = voice;
                opt.textContent = voice;
                voiceSelect.appendChild(opt);
            });
        }

        // Initial voice options
        updateVoiceOptions(modelSelect.value);

        // Change voice options when model changes
        modelSelect.addEventListener('change', () => {
            updateVoiceOptions(modelSelect.value);
        });

        // === LISTEN LOGIC ===
        btn.onclick = async () => {
            btn.classList.add("d-none");
            modelSelect.classList.add("d-none");
            voiceSelect.classList.add("d-none");

            loadingListen = createLoadingListenElement();
            messageWrapper.appendChild(loadingListen);

            const selectedVoice = voiceSelect.value;
            const selectedModel = modelSelect.value;

            await fetch("/textToAudio", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: text, model: selectedModel, voice: selectedVoice })
            })
            .then(response => response.blob())
            .then(blob => {
                const audioURL = URL.createObjectURL(blob);
                const audio = new Audio(audioURL);
                audio.play();
            })
            .catch(err => console.error("❌ Error playing audio:", err));

            loadingListen.remove();
            btn.classList.remove("d-none");
            modelSelect.classList.remove("d-none");
            voiceSelect.classList.remove("d-none");
        };

        buttonsWrapper.appendChild(btn);
        buttonsWrapper.appendChild(modelSelect);
        buttonsWrapper.appendChild(voiceSelect);
        messageWrapper.appendChild(buttonsWrapper);
    }   

    chatBox.appendChild(messageWrapper);
    chatBox.scrollTop = chatBox.scrollHeight
}


function createMessageElement(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender === "a" ? "message-a" : "message-b");
    msg.innerText = text;
    return msg;
  }



function renderAllMessages() {
    chatBox.innerHTML = "";
  
    let i = 0, j = 0;
  
    while (i < messagesA.length || j < messagesB.length) {
      if (i < messagesA.length) {
        addMessage(messagesA[i], "a")
        i++;
      }
      if (j < messagesB.length) {
        addMessage(messagesB[j], "b")
        j++;
      }
    }
  
    chatBox.scrollTop = chatBox.scrollHeight;
  }



function createLoadingElement(side) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message loading d-flex align-items-center gap-2';
    loadingDiv.className += (side === "a" ? " message-a a" : " message-b b")

    const spinner = document.createElement('div');
    spinner.className = 'spinner-border';
    spinner.setAttribute('role', 'status');

    const paragraph = document.createElement('p');
    paragraph.className = 'mb-0';
    paragraph.textContent = 'Loading...';

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(paragraph);

    return loadingDiv;
}

function createRecordingElement() {
    const recordingDiv = document.createElement('div');
    recordingDiv.className = 'message message-a loading recording d-flex a align-items-center gap-2';

    const svg = document.createElement("img");
    svg.src = "/static/icons/microphone.svg";
    svg.alt = "Loading...";
    svg.style.width = "2rem";
    svg.style.height = "2rem";



    const paragraph = document.createElement('p');
    paragraph.className = 'mb-0';
    paragraph.textContent = 'Listening...';

    recordingDiv.appendChild(svg);
    recordingDiv.appendChild(paragraph);

    return recordingDiv;
}

function createLoadingListenElement() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading d-flex align-items-center gap-2';

    const spinner = document.createElement('div');
    spinner.className = 'spinner-border';
    spinner.setAttribute('role', 'status');

    const paragraph = document.createElement('p');
    paragraph.className = 'mb-0';
    paragraph.textContent = 'Loading...';

    loadingDiv.appendChild(spinner);
    loadingDiv.appendChild(paragraph);

    return loadingDiv;
}

document.getElementById('messageInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      const messageText = document.getElementById('messageInput').value.trim();
  
      if (messageText !== "") {
        addMessage(messageText, 'a');
  
        document.getElementById('messageInput').value = '';

        genereateResponse(messageText)
      }
    }
});
  

renderAllMessages()