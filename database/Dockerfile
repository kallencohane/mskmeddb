FROM python:3.7.1

WORKDIR '/data'

COPY ./database/ReminderConsent.py ./database/ReminderConsent.py

COPY ./database/config.py ./database/config.py

RUN pip install pymysql

EXPOSE 80

CMD ["python3", "./database/ReminderConsent.py"]
