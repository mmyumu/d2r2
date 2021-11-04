import os
from random import randrange
from time import sleep
from picamera import PiCamera
import base64

from flask import Flask, send_file, send_from_directory, request

app = Flask(__name__, static_url_path='')


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route('/coucou')
def get_image():
    if os.path.exists("download.jpg"):
        os.remove("download.jpg")
    with PiCamera() as camera:
    #camera = PiCamera()
        camera.resolution = (1024, 768)
    #camera.start_preview()
    # Camera warm-up time
        sleep(2)
        camera.capture('download.jpg')
    
    return send_from_directory('./', "download.jpg")

   #  filename = 'r2d2.jpg'
    #index = randrange(4) + 1
    #return send_from_directory('./', f"r2d2-{index}.jpg")
    #return send_from_directory('./', f"r2d2-{index}.jpg", as_attachment=True)
    #with open(f"r2d2-{index}.jpg", "rb") as image_file:
    #    encoded_string = base64.b64encode(image_file.read())
    #    # print(encoded_string)

    # 1298: OK
    # 1299: KO
    #html = 'x' * 1299
    #return f"<p>{html}</p>", 200
    #return {"image": encoded_string.decode("utf8")}, 200
    #  return send_file(filename, mimetype='image/gif')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10001)
