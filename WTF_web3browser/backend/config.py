import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret-default')
    
    # Fix for SQLAlchemy 1.4+ (Standardizes postgres:// to postgresql://)
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Robust Sanitization: Handle "psql 'postgresql://...'" formatting
        cleaned_url = database_url.strip()
        if cleaned_url.startswith("psql "):
            # Strip psql and any surrounding quotes
            cleaned_url = cleaned_url.replace("psql ", "").strip("'\" ")
        
        if cleaned_url.startswith("postgres://"):
            cleaned_url = cleaned_url.replace("postgres://", "postgresql://", 1)
        SQLALCHEMY_DATABASE_URI = cleaned_url
    else:
        # Fallback to local sqlite in /tmp to prevent app crash on Vercel
        SQLALCHEMY_DATABASE_URI = 'sqlite:////tmp/fallback.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PORT = int(os.getenv('PORT', 5000))
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
