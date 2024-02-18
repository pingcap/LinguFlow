from fastapi import FastAPI

from api.application import router as ApplicationRouter
from exceptions import register_exception_handlers

app = FastAPI()

app.include_router(ApplicationRouter)
register_exception_handlers(app)
