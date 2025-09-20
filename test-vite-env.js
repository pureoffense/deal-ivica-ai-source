#!/usr/bin/env node

// Test script to check if the API key from .env works exactly as the app would use it
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Vite Environment Variables');
console.log('=====================================');

// Simulate how Vite loads env vars (VITE_ prefix only)
const apiKey = process.env.VITE_PRESENTON_API_KEY;
const apiUrl = process.env.VITE_PRESENTON_API_URL;
const baseUrl = process.env.VITE_PRESENTON_BASE_URL;

console.log('Environment Status:');
console.log('- API Key:', apiKey ? `${apiKey.substring(0, 25)}... (${apiKey.length} chars)` : 'MISSING');
console.log('- API URL:', apiUrl || 'MISSING');
console.log('- Base URL:', baseUrl || 'MISSING');

if (!apiKey) {
  console.log('❌ No VITE_PRESENTON_API_KEY found');
  process.exit(1);
}

if (apiKey === 'sk-presenton-xxxxx' || apiKey.includes('xxxxx')) {
  console.log('❌ API key is still placeholder');
  process.exit(1);
}

console.log('\n🚀 Testing API call with exact same format as React app...');

const testBody = {
  content: 'Test presentation about artificial intelligence',
  n_slides: 1,
  language: 'English',
  template: 'general',
  export_as: 'pptx',
  tone: 'professional',
  web_search: false
};

console.log('Request body:', JSON.stringify(testBody, null, 2));

try {
  const response = await fetch('https://api.presenton.ai/api/v1/ppt/presentation/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(testBody)
  });

  console.log('\n📡 Response Status:', response.status);
  console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

  const responseText = await response.text();
  console.log('\n📄 Response Body:', responseText);

  if (response.status === 200) {
    console.log('\n✅ SUCCESS! API key is working with exact app format');
    const data = JSON.parse(responseText);
    console.log('Presentation ID:', data.presentation_id);
    console.log('Credits consumed:', data.credits_consumed);
  } else if (response.status === 401) {
    console.log('\n❌ AUTHENTICATION FAILED');
    console.log('The API key is being rejected by Presenton.');
    console.log('Please check your Presenton account at https://presenton.ai/account');
  } else if (response.status === 400) {
    console.log('\n❌ BAD REQUEST');
    console.log('There is an issue with the request format or template.');
  } else {
    console.log(`\n⚠️ UNEXPECTED STATUS: ${response.status}`);
  }

} catch (error) {
  console.error('\n💥 Network Error:', error.message);
}