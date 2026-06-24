from sqlalchemy.orm import Session
from sqlalchemy import func
from models.Transaction import Transaction
from datetime import datetime, timedelta
from collections import defaultdict
import statistics

class ForecastService:
    @staticmethod
    def calculate_confidence(recent_std: float, recent_mean: float) -> float:
        """
        Calculate confidence based on data variability
        Formula: 0.7 + 0.2 * (1 - min(1, recent_std / (recent_mean + 1)))
        Range: 70% to 90%
        """
        # Avoid division by zero
        ratio = recent_std / (recent_mean + 1)
        confidence = 0.7 + 0.2 * (1 - min(1, ratio))
        return float(round(confidence, 2)) * 100  # Convert to percentage

    @staticmethod
    def get_demand_trends(db: Session):
        """Get historical demand trends by date"""
        results = (
            db.query(
                Transaction.transaction_date,
                func.sum(Transaction.quantity).label('total_quantity')
            )
            .filter(Transaction.transaction_date.isnot(None))
            .group_by(Transaction.transaction_date)
            .order_by(Transaction.transaction_date)
            .all()
        )
        
        trends = []
        for row in results:
            trends.append({
                "date": row.transaction_date.strftime("%Y-%m-%d"),
                "historical": int(row.total_quantity or 0),
                "forecast": None
            })
        
        # Generate forecast for next 30 days
        if trends:
            recent_values = [t['historical'] for t in trends[-7:]]
            
            if len(recent_values) >= 2:
                recent_mean = statistics.mean(recent_values)
                recent_std = statistics.stdev(recent_values) if len(recent_values) > 1 else 0
            else:
                recent_mean = recent_values[0] if recent_values else 5
                recent_std = 0
            
            last_date = datetime.strptime(trends[-1]['date'], "%Y-%m-%d")
            for i in range(1, 31):
                forecast_date = last_date + timedelta(days=i)
                day_of_week = forecast_date.weekday()
                
                # Add seasonality (day of week effect)
                seasonality = 1.0 + 0.1 * statistics.sin(2 * statistics.pi * day_of_week / 7)
                
                # Add some random variation
                import random
                pred = recent_mean * seasonality + random.gauss(0, recent_std * 0.2)
                forecast_value = max(1, int(round(pred)))
                
                trends.append({
                    "date": forecast_date.strftime("%Y-%m-%d"),
                    "historical": None,
                    "forecast": forecast_value
                })
        
        return trends

    @staticmethod
    def get_demand_by_category(db: Session):
        """Get demand aggregated by category (aisle)"""
        results = (
            db.query(
                Transaction.aisle,
                func.sum(Transaction.quantity).label('total_quantity')
            )
            .filter(Transaction.aisle.isnot(None))
            .group_by(Transaction.aisle)
            .order_by(func.sum(Transaction.quantity).desc())
            .all()
        )
        
        colors = ["#8b5cf6", "#06b6d4", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"]
        
        categories = []
        for idx, row in enumerate(results):
            categories.append({
                "name": row.aisle,
                "value": int(row.total_quantity or 0),
                "color": colors[idx % len(colors)]
            })
        
        return categories

    @staticmethod
    def get_top_products(db: Session, limit: int = 10):
        """Get top products by forecasted demand with confidence scores"""
        results = (
            db.query(
                Transaction.product_name,
                Transaction.aisle,
                func.sum(Transaction.quantity).label('total_quantity'),
                func.count(Transaction.id).label('transaction_count'),
                func.avg(Transaction.quantity).label('avg_quantity'),
            )
            .filter(Transaction.product_name.isnot(None))
            .group_by(Transaction.product_name, Transaction.aisle)
            .order_by(func.sum(Transaction.quantity).desc())
            .limit(limit)
            .all()
        )
        
        products = []
        for row in results:
            # Calculate forecast (average per transaction * projected transactions)
            avg_per_transaction = float(row.avg_quantity or 0)
            forecasted_demand = int(avg_per_transaction * 30)  # Project for 30 days
            
            # Calculate confidence using the formula
            # Get standard deviation for this product
            product_quantities = db.query(Transaction.quantity).filter(
                Transaction.product_name == row.product_name
            ).all()
            
            if len(product_quantities) > 1:
                quantities_list = [q[0] for q in product_quantities if q[0] is not None]
                if len(quantities_list) > 1:
                    recent_std = statistics.stdev(quantities_list)
                    recent_mean = statistics.mean(quantities_list)
                else:
                    recent_std = 0
                    recent_mean = quantities_list[0] if quantities_list else 0
            else:
                recent_std = 0
                recent_mean = avg_per_transaction or 0
            
            confidence = ForecastService.calculate_confidence(recent_std, recent_mean)
            
            products.append({
                "name": row.product_name,
                "category": row.aisle or "Unknown",
                "demand": forecasted_demand,
                "historical": int(row.total_quantity or 0),
                "confidence": confidence
            })
        
        return products

    @staticmethod
    def get_forecast_details(db: Session, limit: int = 50):
        """Get detailed forecast data for table"""
        results = (
            db.query(
                Transaction.transaction_date,
                Transaction.product_name,
                Transaction.aisle,
                Transaction.quantity,
                Transaction.unit_price,
                Transaction.total_amount
            )
            .filter(
                Transaction.transaction_date.isnot(None),
                Transaction.product_name.isnot(None)
            )
            .order_by(Transaction.transaction_date.desc())
            .limit(limit)
            .all()
        )
        
        details = []
        for row in results:
            # Calculate confidence for this product using the formula
            product_quantities = db.query(Transaction.quantity).filter(
                Transaction.product_name == row.product_name
            ).all()
            
            if len(product_quantities) > 1:
                quantities_list = [q[0] for q in product_quantities if q[0] is not None]
                if len(quantities_list) > 1:
                    recent_std = statistics.stdev(quantities_list)
                    recent_mean = statistics.mean(quantities_list)
                else:
                    recent_std = 0
                    recent_mean = quantities_list[0] if quantities_list else 5
            else:
                recent_std = 0
                recent_mean = 5
            
            confidence = ForecastService.calculate_confidence(recent_std, recent_mean)
            
            details.append({
                "date": row.transaction_date.strftime("%Y-%m-%d"),
                "product": row.product_name,
                "category": row.aisle or "Unknown",
                "predictedDemand": int(row.quantity or 0),
                "confidence": confidence,
                "unitPrice": float(row.unit_price or 0),
                "totalAmount": float(row.total_amount or 0)
            })
        
        return details

    @staticmethod
    def get_summary_stats(db: Session):
        """Get summary statistics for the dashboard"""
        # Total products tracked
        total_products = db.query(func.count(func.distinct(Transaction.product_name))).scalar() or 0
        
        # Total categories
        total_categories = db.query(func.count(func.distinct(Transaction.aisle))).scalar() or 0
        
        # Total quantity sold
        total_quantity = db.query(func.sum(Transaction.quantity)).scalar() or 0
        
        # Calculate average confidence across all products
        all_quantities = db.query(Transaction.quantity).filter(
            Transaction.quantity.isnot(None)
        ).all()
        
        if len(all_quantities) > 1:
            quantities_list = [q[0] for q in all_quantities]
            if len(quantities_list) > 1:
                overall_std = statistics.stdev(quantities_list)
                overall_mean = statistics.mean(quantities_list)
            else:
                overall_std = 0
                overall_mean = quantities_list[0] if quantities_list else 5
        else:
            overall_std = 0
            overall_mean = 5
        
        avg_confidence = ForecastService.calculate_confidence(overall_std, overall_mean)
        
        # Forecast for next 30 days
        days_in_data = db.query(func.count(func.distinct(Transaction.transaction_date))).scalar() or 1
        daily_avg = total_quantity / days_in_data if days_in_data > 0 else 0
        next_30_days_forecast = int(daily_avg * 30)
        
        return {
            "totalForecast": next_30_days_forecast,
            "avgConfidence": round(avg_confidence),  # Already in percentage
            "productsTracked": total_products,
            "categories": total_categories,
            "totalTransactions": db.query(func.count(Transaction.id)).scalar() or 0,
            "totalRevenue": float(db.query(func.sum(Transaction.total_amount)).scalar() or 0)
        }