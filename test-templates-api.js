#!/usr/bin/env node

// Test the Presenton templates API to see what data is actually returned
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.VITE_PRESENTON_API_KEY;

console.log('🎨 Testing Presenton Templates API');
console.log('================================');

if (!apiKey) {
  console.log('❌ No API key found');
  process.exit(1);
}

console.log('API Key:', `${apiKey.substring(0, 25)}...`);

async function testTemplatesAPI() {
  try {
    console.log('\n📡 Testing GET /api/v1/ppt/template/all');
    
    const response = await fetch('https://api.presenton.ai/api/v1/ppt/template/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ Templates API Response:');
      console.log('Type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('Length/Keys:', Array.isArray(data) ? data.length : Object.keys(data));
      console.log('Full response:', JSON.stringify(data, null, 2));
      
      if (Array.isArray(data)) {
        console.log('\n📋 Templates Summary:');
        data.forEach((template, index) => {
          console.log(`${index + 1}. ${typeof template === 'string' ? template : JSON.stringify(template)}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log('\n❌ API Error:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Request failed:', error.message);
  }
}

testTemplatesAPI();