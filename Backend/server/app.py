from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.env import settings
from config.db import Base, engine
from routes import auth, users, employees

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "EEMS API is running"}