FROM python:3.7.1

WORKDIR '/data'

COPY ReminderConsent.py ReminderConsent.py

COPY config.py config.py

RUN pip install pymysql

CMD ["python3", "./ReminderConsent.py"]
