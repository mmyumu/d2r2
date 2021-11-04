gunicorn -w 1 --bind 0.0.0.0:10001 --access-logfile /root/logs/logs --error-logfile /root/logs/logs wsgi:app | tail -f /root/logs/logs
