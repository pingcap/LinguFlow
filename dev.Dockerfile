FROM python:3.9

WORKDIR /usr/src/app

COPY . .
RUN find . -name "requirements.txt" -type f -exec pip install -r '{}' ';'
RUN pip install isort black

# init database
RUN pip install alembic
RUN alembic init alembic
RUN sed -i '1s|^|import model\n|' alembic/env.py
RUN sed -i "s|target_metadata =.*|target_metadata = model.Base.metadata|" alembic/env.py
RUN sed -i "s|sqlalchemy.url =.*|sqlalchemy.url = sqlite:////tmp/linguflow.db|" alembic.ini
RUN alembic revision --autogenerate -m "init"
RUN alembic upgrade head

ENV DATABASE_URL=sqlite:////tmp/linguflow.db

CMD [ "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]