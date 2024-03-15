import logging

from fastapi import FastAPI

from api.application import router as ApplicationRouter
from auth import AuthMiddleware
from exceptions import register_exception_handlers

# config the default logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)

app = FastAPI()

app.add_middleware(
    AuthMiddleware,
    login_path="/login",
    white_list=["/ping"],
)

app.include_router(ApplicationRouter)
register_exception_handlers(app)
