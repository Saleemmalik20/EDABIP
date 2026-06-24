from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.db import get_db
from middleware.authMiddleware import get_current_user
from models.User import User
from services.forecastService import ForecastService

router = APIRouter(prefix="/forecast", tags=["Forecast"])

@router.get("/summary")
def get_forecast_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get forecast summary statistics"""
    return ForecastService.get_summary_stats(db)

@router.get("/trends")
def get_demand_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get demand trends (historical + forecast)"""
    return ForecastService.get_demand_trends(db)

@router.get("/categories")
def get_demand_by_category(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get demand aggregated by category"""
    return ForecastService.get_demand_by_category(db)

@router.get("/top-products")
def get_top_products(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top products by forecasted demand"""
    return ForecastService.get_top_products(db, limit)

@router.get("/details")
def get_forecast_details(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed forecast data"""
    return ForecastService.get_forecast_details(db, limit)