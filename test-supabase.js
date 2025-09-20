#!/usr/bin/env node

// Test Supabase connection and authentication
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

console.log('🗄️ Testing Supabase Connection');
console.log('==============================');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment Status:');
console.log('- Supabase URL:', supabaseUrl || 'MISSING');
console.log('- Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 25)}... (${supabaseAnonKey.length} chars)` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    console.log('\n🧪 Testing connection...');
    
    // Test basic connection by trying to query a table
    // Note: This might fail if the decks table doesn't exist or has RLS enabled
    const { data, error, count } = await supabase
      .from('decks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST106') {
        console.log('⚠️  Decks table does not exist or is not accessible');
        console.log('This is expected if the database schema is not set up yet');
      } else if (error.code === '42P01') {
        console.log('⚠️  Decks table does not exist');
        console.log('You need to create the database schema');
      } else {
        console.log('❌ Query error:', error);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log(`📊 Found ${count} decks in the database`);
    }

    // Test auth status
    console.log('\n🔐 Testing authentication status...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  No authenticated user (this is normal for server-side testing)');
    } else if (authData.user) {
      console.log('✅ Authenticated user found:', authData.user.email);
    } else {
      console.log('ℹ️  No authenticated user');
    }

    console.log('\n✅ Supabase connection test completed successfully');
    
  } catch (error) {
    console.error('💥 Supabase test failed:', error);
  }
}

testSupabaseConnection();