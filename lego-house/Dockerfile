FROM python:3.10.0-slim-bullseye

WORKDIR /root
RUN mkdir /root/logs

RUN pip install flask
RUN pip install gunicorn
COPY picamera /usr/local/lib/python3.10/site-packages/
COPY . .

CMD ["gunicorn", "-w", "3", "--bind", "0.0.0.0:10001", "--access-logfile", "/root/logs/access.log", "--error-logfile", "/root/logs/error.log", "--log-level", "debug", "wsgi:app"]
