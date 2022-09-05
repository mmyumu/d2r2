import os
from flask import Flask, request
from chatbot import ChatBot
import hashlib

app = Flask(__name__, static_url_path='')
DEBUG = os.getenv('DEBUG')

BOT_PASSWORD = os.getenv('CHATBOT_PASSWORD')
DEBUG_PASSWORD = os.getenv('DEBUG_PASSWORD')

if not DEBUG:
    DEBUG = 'false'


chatbot = ChatBot(debug=DEBUG.lower() == 'true')


@app.route("/ping")
def ping():
    return "Pong"


@app.route('/bot', methods=['POST'])
def bot():
    md5_password = request.json.get('password')
    user = request.json.get('user')
    sentence = request.json.get('sentence')

    if md5_password != hashlib.md5(BOT_PASSWORD.encode('utf-8')).hexdigest():
        return "Password incorrect", 403

    bot_response = chatbot.tell(user, sentence)

    return bot_response, 200

@app.route('/frequency_penalty', methods=['POST'])
def frequency_penalty():
    password = request.json.get('password')
    frequency_penalty = float(request.json.get('frequency_penalty'))

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    chatbot.frequency_penalty(frequency_penalty)

    return f"Frequency penalty set to {frequency_penalty}", 200


@app.route('/presence_penalty', methods=['POST'])
def presence_penalty():
    password = request.json.get('password')
    presence_penalty = float(request.json.get('presence_penalty'))

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    chatbot.presence_penalty(presence_penalty)

    return f"Presence penalty set to {presence_penalty}", 200


@app.route('/temperature', methods=['POST'])
def temperature():
    password = request.json.get('password')
    temperature = float(request.json.get('temperature'))

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    chatbot.temperature(temperature)

    return f"Temperature set to {temperature}", 200


@app.route('/mood', methods=['POST'])
def mood():
    password = request.json.get('password')
    mood = request.json.get('mood')
    topic = request.json.get('topic')

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    chatbot.set_mood(key_mood=mood, key_topic=topic)

    return f"Mood set to {chatbot.mood}", 200


@app.route('/erase_memory', methods=['POST'])
def erase_memory():
    password = request.json.get('password')

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    chatbot.erase_memory()

    return "Memory erased", 200


@app.route('/dummy_memory', methods=['POST'])
def dummy_memory():
    password = request.json.get('password')

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    chatbot.dummy_memory()

    return "Created dummy memory", 200


@app.route('/debug', methods=['POST'])
def debug():
    password = request.json.get('password')

    if password != DEBUG_PASSWORD:
        return "Password incorrect", 403

    debug_str = chatbot.debug_str()

    return debug_str, 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10002)
