#!/usr/bin/env python3
"""
Supabase Database Connection Test Script
========================================

This script tests the connection to your Supabase PostgreSQL database
and can be used to run queries, manage data, or perform database operations.

Prerequisites:
1. Update db.env with your actual Supabase database credentials
2. Install dependencies: pip install psycopg2-binary python-dotenv

Usage:
    python test_db_connection.py
"""

import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime

def main():
    # Load environment variables from db.env
    load_dotenv('db.env')

    # Try to use DATABASE_URL first (recommended)
    database_url = os.getenv("DATABASE_URL")
    
    print("🔗 Connecting to Supabase Database...")
    
    # Connect to the database
    try:
        if database_url and database_url != "postgresql://postgres:[YOUR-PASSWORD]@db.smlzaavdiwhpifnhhjhf.supabase.co:5432/postgres":
            print("   Using DATABASE_URL connection...")
            connection = psycopg2.connect(database_url)
        else:
            # Fallback to individual parameters
            USER = os.getenv("user")
            PASSWORD = os.getenv("password")
            HOST = os.getenv("host")
            PORT = os.getenv("port")
            DBNAME = os.getenv("dbname")
            
            print(f"   Host: {HOST}")
            print(f"   Database: {DBNAME}")
            print(f"   User: {USER}")
            print(f"   Port: {PORT}")
            print()
            
            connection = psycopg2.connect(
                user=USER,
                password=PASSWORD,
                host=HOST,
                port=PORT,
                dbname=DBNAME
            )
        print("✅ Connection successful!")
        
        # Create a cursor to execute SQL queries
        cursor = connection.cursor()
        
        # Test Query 1: Get current timestamp
        print("\n📅 Testing basic query...")
        cursor.execute("SELECT NOW();")
        current_time = cursor.fetchone()
        print(f"   Current Database Time: {current_time[0]}")

        # Test Query 2: Check if our tables exist
        print("\n🗂️  Checking Deal Ivica AI tables...")
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('decks', 'access_logs')
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        if tables:
            print("   Found tables:")
            for table in tables:
                print(f"   ✅ {table[0]}")
        else:
            print("   ⚠️  No Deal Ivica AI tables found. Run the database schema first!")

        # Test Query 3: Count users (if any)
        print("\n👥 Checking authenticated users...")
        cursor.execute("SELECT COUNT(*) FROM auth.users;")
        user_count = cursor.fetchone()
        print(f"   Total users: {user_count[0]}")

        # Test Query 4: Check decks (if table exists)
        try:
            cursor.execute("SELECT COUNT(*) FROM public.decks;")
            deck_count = cursor.fetchone()
            print(f"   Total decks: {deck_count[0]}")
        except psycopg2.ProgrammingError:
            print("   ⚠️  Decks table not found - make sure to run the database schema!")

        # Close the cursor and connection
        cursor.close()
        connection.close()
        print("\n🔐 Connection closed successfully.")
        print("\n🎉 Database connection test completed!")

    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your database password in db.env")
        print("2. Verify your Supabase project is active")
        print("3. Make sure your IP is allowed (Supabase → Settings → Database → Network)")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()