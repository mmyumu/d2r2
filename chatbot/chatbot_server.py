import os
from flask import Flask, request
from chatbot import ChatBot
import hashlib

app = Flask(__name__, static_url_path='')
PASSWORD = os.getenv('CHATBOT_PASSWORD')


@app.route("/ping")
def ping():
    return "Pong"


@app.route('/bot', methods=['POST'])
def bot():
    md5_password = request.json.get('password')
    sentence = request.json.get('sentence')

    if md5_password != hashlib.md5(PASSWORD.encode('utf-8')).hexdigest():
        return "Password incorrect", 403

    chatbot = ChatBot()
    bot_response = chatbot.tell(sentence)

    return bot_response, 200


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10002)

