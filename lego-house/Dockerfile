FROM python:3.10.0-slim-bullseye

WORKDIR /root
RUN mkdir /root/logs

RUN pip install --upgrade "setuptools>=78.1.1" "wheel>=0.38.1" "certifi>=2026.10.23" "urllib3>=2.8.0"
RUN pip install "flask>=3.0.3" "werkzeug>=3.0.3"
RUN pip install "gunicorn>=22.0.0"
RUN READTHEDOCS=True pip install picamera

RUN apt update -y && apt install -y gcc libjpeg-dev
RUN pip install pillow  --global-option="build_ext" --global-option="--disable-zlib"

COPY . .

CMD ["gunicorn", "-w", "3", "--bind", "0.0.0.0:10001", "--access-logfile", "/root/logs/access.log", "--error-logfile", "/root/logs/error.log", "--log-level", "debug", "wsgi:app"]
