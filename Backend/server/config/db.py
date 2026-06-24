from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.env import settings
import pandas as pd

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_forecast_data_from_csv(csv_file_path):
    # 1. Read ONLY the first 200 records from the CSV
    df = pd.read_csv(csv_file_path, nrows=200)
    print(f"Loaded {len(df)} records from CSV.")

    # 2. Create a database session
    db = SessionLocal()
    
    try:
        # Import Transaction inside the function to avoid circular imports
        from models import Transaction 

        # Check if data already exists
        count = db.query(Transaction).count()
        if count > 0:
            print("Data already exists. Skipping seed.")
            return

        # 3. Loop through the 200 records and insert them
        for index, row in df.iterrows():
            # Mapping CSV columns to your Database Model
            # Adjust the field names below to match your Transaction model exactly
            new_transaction = Transaction(
                customer_id=row.get('customer_id'),
                store_name=row.get('store_name'),
                transaction_date=row.get('transaction_date'),
                aisle=row.get('aisle'),  # This is your category
                product_name=row.get('product_name'),
                quantity=row.get('quantity'),
                unit_price=row.get('unit_price'),
                total_amount=row.get('total_amount'),
                discount_amount=row.get('discount_amount'),
                final_amount=row.get('final_amount'),
                loyalty_points=row.get('loyalty_points'),
            )
            db.add(new_transaction)
            
        # 4. Commit all 200 records at once
        db.commit()
        print("✅ Successfully seeded 200 records into the database!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # 5. Always close the session
        db.close()
