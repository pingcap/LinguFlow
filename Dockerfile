FROM python:3.9

WORKDIR /usr/src/app

COPY . .
RUN pip install --no-cache-dir -r requirements.txt

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000" ]