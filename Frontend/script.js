const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const recordingsList = document.getElementById('recordingsList');
const responseDiv = document.getElementById('response');

let recognition;
let recognitionIsRunning = false;
let conversationContext = ''; // Define conversationContext here

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = event => {
    const lastResultIndex = event.results.length - 1;
    const transcript = event.results[lastResultIndex][0].transcript;

    if (event.results[lastResultIndex].isFinal) {
      const response = getResponseFromOpenAI(transcript);
      speakResponse(response);

      const recording = document.createElement('p');
      recording.textContent = transcript;
      recordingsList.appendChild(recording);
    }
  };
} else {
  startButton.disabled = true;
  startButton.textContent = 'Speech Recognition not supported';
}

startButton.addEventListener('click', async () => {
    if (recognition && !recognitionIsRunning) {
      recognition.start();
      recognitionIsRunning = true;
      startButton.disabled = true;
      stopButton.disabled = false;
      startButton.textContent = 'Listening...';
    }
  });
  
  stopButton.addEventListener('click', () => {
    if (recognitionIsRunning) {
      recognition.stop();
      recognitionIsRunning = false;
      startButton.disabled = false;
      stopButton.disabled = true;
      startButton.textContent = 'Start Recording';
    }
  });

  async function processSpeech(transcript) {
    conversationContext += `User: ${transcript}\nAI: `;
    
    const response = await getResponseFromOpenAI(conversationContext);
    speakResponse(response);
  
    const recording = document.createElement('p');
    recording.textContent = transcript;
    recordingsList.appendChild(recording);
  
    stopButton.disabled = true;
    startButton.disabled = false;
    startButton.textContent = 'Start Recording';
  }
  
  recognition.onresult = event => {
    const lastResultIndex = event.results.length - 1;
    const transcript = event.results[lastResultIndex][0].transcript;
  
    if (event.results[lastResultIndex].isFinal) {
      processSpeech(transcript);
    }
  };

async function getResponseFromOpenAI(input) {
    const openAiApiKey = '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'; // Replace with your OpenAI API key
    const prompt = `User: ${input}\nAI:`; // Set up the conversation prompt
  
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: input }],
      }),
    });
  
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }
  
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
  
    return aiResponse;
  }
  

function speakResponse(response) {
  const utterance = new SpeechSynthesisUtterance(response);
  speechSynthesis.speak(utterance);
  responseDiv.textContent = 'Response: ' + response;
}