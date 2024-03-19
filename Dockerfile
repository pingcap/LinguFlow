FROM python:3.9

WORKDIR /usr/src/app

COPY . .
RUN find . -name "requirements.txt" -type f -exec pip install -r '{}' ';'

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000" ]