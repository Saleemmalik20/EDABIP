from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from config.db import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Customer Information
    customer_id = Column(Integer, nullable=True, index=True)
    
    # Store Information
    store_name = Column(String(255), nullable=True, index=True)
    
    # Transaction Details
    transaction_date = Column(Date, nullable=True, index=True)
    
    # Product Information
    aisle = Column(String(100), nullable=True, index=True)  # Category
    product_name = Column(String(255), nullable=True, index=True)
    
    # Pricing & Quantity
    quantity = Column(Integer, nullable=True)
    unit_price = Column(Float, nullable=True)
    total_amount = Column(Float, nullable=True)
    discount_amount = Column(Float, default=0)
    final_amount = Column(Float, nullable=True)
    
    # Loyalty Program
    loyalty_points = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Transaction(id={self.id}, product={self.product_name}, date={self.transaction_date})>"