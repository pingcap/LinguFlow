FROM python:3.9

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install isort black

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]