import speech_recognition as sr
from gtts import gTTS
import os
import openai

# Set your OpenAI API key
openai.api_key = "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"

# Helper function to speak text using gTTS
def speak(text):
    tts = gTTS(text)
    tts.save("output.mp3")
    os.system("mpg321 output.mp3")

# Helper function to transcribe speech to text
def transcribe_input():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Speak Now...")
        audio = r.listen(source)
    try:
        input_text = r.recognize_google(audio)
        print(f"You said: {input_text}")
        return input_text
    except sr.UnknownValueError:
        print("Sorry, I could not understand your speech.")
        return None

# Initialize conversation messages
messages = []
system_msg = "Interviewer"
messages.append({"role": "system", "content": system_msg})

intro_msg = "I want you to act as an interviewer..."
messages.append({"role": "user", "content": intro_msg})

# Main conversation loop
while True:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    reply = response["choices"][0]["message"]["content"]
    messages.append({"role": "assistant", "content": reply})
    
    speak(reply)
    print("\nAssistant:", reply, "\n")
    
    user_input = transcribe_input()
    
    if user_input and user_input.lower() == "quit()":
        break
    
    messages.append({"role": "user", "content": user_input})
