from fastapi import FastAPI

from api.application import router as ApplicationRouter

app = FastAPI()

app.include_router(ApplicationRouter)
