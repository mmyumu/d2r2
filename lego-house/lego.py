import os
from time import sleep
from picamera import PiCamera

from flask import Flask, send_from_directory

app = Flask(__name__, static_url_path='')


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route('/coucou')
def get_image():
    if os.path.exists("download.jpg"):
        os.remove("download.jpg")
    with PiCamera() as camera:
        camera.resolution = (1024, 768)
        sleep(2)
        camera.capture('download.jpg')
    
    return send_from_directory('./', "download.jpg")


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10001)
