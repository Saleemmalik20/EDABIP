from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.env import settings
from config.db import engine, Base
from routes import auth, users, employees, security

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EEMS API", version="1.0.0")

# CORS middleware - UPDATED TO ALLOW FRONTEND ORIGIN
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Your frontend
        "http://localhost:3000",  # Alternative frontend port
        "http://127.0.0.1:5173",  # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "EEMS API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}