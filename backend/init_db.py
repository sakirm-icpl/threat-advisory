#!/usr/bin/env python3
"""
Database initialization script for VersionIntel
"""
import os
import sys
import time
from sqlalchemy import create_engine, text

def wait_for_database():
    """Wait for database to be ready"""
    max_retries = 30
    for i in range(max_retries):
        try:
            # Connect to default postgres database first
            postgres_url = f"postgresql://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}@{os.environ['POSTGRES_HOST']}:{os.environ.get('POSTGRES_PORT', '5432')}/postgres"
            engine = create_engine(postgres_url)
            
            with engine.connect() as conn:
                conn.execute(text('SELECT 1'))
                print('Database server is ready')
                break
        except Exception as e:
            print(f'Waiting for database server... {i+1}/{max_retries}: {e}')
            time.sleep(2)
            if i == max_retries - 1:
                print('Database server connection failed')
                sys.exit(1)

def create_database_if_not_exists():
    """Create production database if it doesn't exist"""
    try:
        # Connect to postgres database to create our target database
        postgres_url = f"postgresql://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}@{os.environ['POSTGRES_HOST']}:{os.environ.get('POSTGRES_PORT', '5432')}/postgres"
        engine = create_engine(postgres_url)
        
        db_name = os.environ['POSTGRES_DB']
        
        with engine.connect() as conn:
            # Check if database exists
            result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname = :db_name"), {"db_name": db_name})
            if result.fetchone():
                print(f'Database {db_name} already exists')
            else:
                # Create database
                conn.commit()  # End any transaction
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                print(f'Database {db_name} created successfully')
                
    except Exception as e:
        print(f'Database creation error: {e}')
        # Continue anyway - the database might already exist

def initialize_app_database():
    """Initialize application database and create tables"""
    try:
        # Now connect to our application database
        app_url = f"postgresql://{os.environ['POSTGRES_USER']}:{os.environ['POSTGRES_PASSWORD']}@{os.environ['POSTGRES_HOST']}:{os.environ.get('POSTGRES_PORT', '5432')}/{os.environ['POSTGRES_DB']}"
        
        # Add the app directory to Python path
        sys.path.insert(0, '/app')
        
        from app import create_app, db
        
        app = create_app()
        with app.app_context():
            # Test connection
            db.session.execute(text('SELECT 1'))
            print('Application database connection verified')
            
            # Create tables
            db.create_all()
            print('Database tables created/verified')
            
            # Create default admin user
            from app.models.user import User
            if not User.query.filter_by(username='admin').first():
                admin = User(username='admin', email='admin@versionintel.com', role='admin')
                admin.set_password('Admin@123')
                db.session.add(admin)
                db.session.commit()
                print('Default admin user created: admin / Admin@123')
            else:
                print('Admin user already exists')
            
            print('Database initialization complete')
            
    except Exception as e:
        print(f'Application database initialization failed: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print('=== Database Initialization ===')
    wait_for_database()
    create_database_if_not_exists()
    initialize_app_database()
    print('=== Database Ready ===')