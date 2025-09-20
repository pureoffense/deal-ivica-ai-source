#!/usr/bin/env python3
"""
Deal Ivica AI - Database Manager
================================

This script provides database management utilities for your Deal Ivica AI application.
It can help with data analysis, user management, and deck analytics.

Prerequisites:
1. Update db.env with your Supabase database password
2. Run: source python-db-env/bin/activate && pip install psycopg2-binary python-dotenv pandas

Usage:
    python database_manager.py
"""

import psycopg2
from dotenv import load_dotenv
import os
from datetime import datetime
import json

class DealivicaDBManager:
    def __init__(self):
        # Load environment variables
        load_dotenv('db.env')
        self.connection = None
        self.cursor = None
        
    def connect(self):
        """Connect to the Supabase database"""
        try:
            database_url = os.getenv("DATABASE_URL")
            
            if database_url and "[YOUR-PASSWORD]" not in database_url:
                print("🔗 Connecting with DATABASE_URL...")
                self.connection = psycopg2.connect(database_url)
            else:
                print("🔗 Connecting with individual parameters...")
                self.connection = psycopg2.connect(
                    user=os.getenv("user"),
                    password=os.getenv("password"),
                    host=os.getenv("host"),
                    port=os.getenv("port"),
                    dbname=os.getenv("dbname")
                )
            
            self.cursor = self.connection.cursor()
            print("✅ Database connected successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
        print("🔐 Database disconnected")
    
    def get_user_stats(self):
        """Get user statistics"""
        try:
            self.cursor.execute("SELECT COUNT(*) FROM auth.users;")
            total_users = self.cursor.fetchone()[0]
            
            self.cursor.execute("""
                SELECT COUNT(*) FROM auth.users 
                WHERE created_at >= NOW() - INTERVAL '7 days';
            """)
            recent_users = self.cursor.fetchone()[0]
            
            print(f"\n👥 USER STATISTICS")
            print(f"   Total users: {total_users}")
            print(f"   New users (last 7 days): {recent_users}")
            
            return {"total": total_users, "recent": recent_users}
        except Exception as e:
            print(f"❌ Error getting user stats: {e}")
            return None
    
    def get_deck_stats(self):
        """Get deck statistics"""
        try:
            # Check if decks table exists
            self.cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'decks'
                );
            """)
            
            if not self.cursor.fetchone()[0]:
                print("⚠️  Decks table not found. Run the database schema first!")
                return None
            
            # Get deck statistics
            self.cursor.execute("SELECT COUNT(*) FROM public.decks;")
            total_decks = self.cursor.fetchone()[0]
            
            self.cursor.execute("""
                SELECT COUNT(*) FROM public.decks 
                WHERE created_at >= NOW() - INTERVAL '7 days';
            """)
            recent_decks = self.cursor.fetchone()[0]
            
            # Get most active creators
            self.cursor.execute("""
                SELECT 
                    creator_id, 
                    COUNT(*) as deck_count,
                    MAX(created_at) as last_created
                FROM public.decks 
                GROUP BY creator_id 
                ORDER BY deck_count DESC 
                LIMIT 5;
            """)
            top_creators = self.cursor.fetchall()
            
            print(f"\n📊 DECK STATISTICS")
            print(f"   Total decks: {total_decks}")
            print(f"   New decks (last 7 days): {recent_decks}")
            print(f"   Top creators: {len(top_creators)} active")
            
            return {
                "total": total_decks, 
                "recent": recent_decks, 
                "top_creators": top_creators
            }
            
        except Exception as e:
            print(f"❌ Error getting deck stats: {e}")
            return None
    
    def list_recent_decks(self, limit=5):
        """List recent decks"""
        try:
            self.cursor.execute("""
                SELECT 
                    id, 
                    title, 
                    creator_id,
                    created_at,
                    view_count
                FROM public.decks 
                ORDER BY created_at DESC 
                LIMIT %s;
            """, (limit,))
            
            decks = self.cursor.fetchall()
            
            print(f"\n📋 RECENT DECKS (Last {limit})")
            if decks:
                for deck in decks:
                    print(f"   • {deck[1][:40]}... (Views: {deck[4]}, Created: {deck[3].strftime('%Y-%m-%d %H:%M')})")
            else:
                print("   No decks found")
                
            return decks
            
        except Exception as e:
            print(f"❌ Error listing decks: {e}")
            return []
    
    def export_user_emails(self):
        """Export user emails (for marketing/communication)"""
        try:
            self.cursor.execute("""
                SELECT email, created_at 
                FROM auth.users 
                ORDER BY created_at DESC;
            """)
            
            users = self.cursor.fetchall()
            
            if users:
                filename = f"users_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
                with open(filename, 'w') as f:
                    f.write("# Deal Ivica AI Users Export\\n")
                    f.write(f"# Generated: {datetime.now()}\\n")
                    f.write(f"# Total users: {len(users)}\\n\\n")
                    
                    for user in users:
                        f.write(f"{user[0]}\\t{user[1]}\\n")
                
                print(f"📤 User emails exported to: {filename}")
                print(f"   Total users exported: {len(users)}")
            else:
                print("   No users found to export")
                
            return users
            
        except Exception as e:
            print(f"❌ Error exporting users: {e}")
            return []
    
    def cleanup_old_data(self, days=30):
        """Clean up old data (be careful with this!)"""
        try:
            # This is just an example - be very careful with delete operations
            print(f"⚠️  This would delete data older than {days} days")
            print("   (Currently disabled for safety)")
            
            # Uncomment these lines if you really want to delete old data
            # self.cursor.execute("""
            #     DELETE FROM public.access_logs 
            #     WHERE access_timestamp < NOW() - INTERVAL '%s days';
            # """, (days,))
            # 
            # deleted_logs = self.cursor.rowcount
            # self.connection.commit()
            # print(f"🗑️  Deleted {deleted_logs} old access logs")
            
        except Exception as e:
            print(f"❌ Error during cleanup: {e}")

def main():
    """Main interactive menu"""
    db = DealivicaDBManager()
    
    if not db.connect():
        return
    
    try:
        while True:
            print("\\n" + "="*50)
            print("🚀 DEAL IVICA AI - DATABASE MANAGER")
            print("="*50)
            print("1. 📊 View Statistics")
            print("2. 📋 List Recent Decks")  
            print("3. 📤 Export User Emails")
            print("4. 🧪 Test Connection")
            print("5. 🚪 Exit")
            print("-"*50)
            
            choice = input("Select an option (1-5): ").strip()
            
            if choice == "1":
                db.get_user_stats()
                db.get_deck_stats()
                
            elif choice == "2":
                limit = input("How many decks to show? (default 5): ").strip()
                limit = int(limit) if limit.isdigit() else 5
                db.list_recent_decks(limit)
                
            elif choice == "3":
                confirm = input("Export all user emails? (yes/no): ").strip().lower()
                if confirm in ['yes', 'y']:
                    db.export_user_emails()
                else:
                    print("Export cancelled")
                    
            elif choice == "4":
                print("✅ Connection is working!")
                
            elif choice == "5":
                break
                
            else:
                print("❌ Invalid option. Please choose 1-5.")
                
            input("\\nPress Enter to continue...")
            
    except KeyboardInterrupt:
        print("\\n👋 Goodbye!")
    
    finally:
        db.disconnect()

if __name__ == "__main__":
    main()