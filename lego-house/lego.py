import os
import time
from picamera import PiCamera
from flask import Flask, send_from_directory, request
from post_process import post_process

app = Flask(__name__, static_url_path='')


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route('/coucou')
def get_image():
    resolution_x = int(request.args.get('resolution_x', 2592))
    resolution_y = int(request.args.get('resolution_y', 1944))
    rotate = float(request.args.get('rotate', 0))
    crop_left = float(request.args.get('crop_left', 0))
    crop_right = float(request.args.get('crop_right', 1))
    crop_top = float(request.args.get('crop_top', 0))
    crop_bottom = float(request.args.get('crop_bottom', 1))

    if os.path.exists("download.jpg"):
        os.remove("download.jpg")

    with PiCamera(resolution=(resolution_x, resolution_y)) as camera:
        camera.sensor_mode = 3
        camera.iso = 0
        camera.framerate_range = (0.167, 6)
        camera.exposure_mode = 'nightpreview'
        camera.image_effect = 'saturation'
        time.sleep(10)
        camera.capture('download.jpg')

        post_process('./download.jpg', './download.jpg', rotate=rotate, crop_ratio=(crop_left, crop_top, crop_right, crop_bottom))

    return send_from_directory('./', "download.jpg")


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10001)

