import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.env import settings
from config.db import engine, Base, seed_forecast_data_from_csv
from routes import auth, users, employees, security
from routes import auth, users, employees, security, forecast

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EEMS API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "EEMS API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup_event():
    print("🚀 Starting application...")
    
    try:
        print("📊 Checking database seed...")
        csv_path = os.path.join(os.path.dirname(__file__), "grocery_chain_data.csv")
        
        # Check if file exists
        if not os.path.exists(csv_path):
            print(f"⚠️  CSV file not found at: {csv_path}")
            print("   Skipping database seeding.")
            return
        
        # Run seeding with error handling
        seed_forecast_data_from_csv(csv_path)
        print("✅ Database seeding completed!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        print("   Application will continue without seeding.")
        import traceback
        traceback.print_exc()