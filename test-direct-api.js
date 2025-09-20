// Direct test of Presenton API with the actual key format
// This will help us understand if the key format is correct

import dotenv from 'dotenv';
dotenv.config();

// Use the API key from environment variables
const testApiKey = process.env.PRESENTON_API_KEY;

async function testDirectAPI() {
  console.log('\n🔍 Testing API endpoint accessibility...');
  
  // Check if API key exists and is not a placeholder
  if (!testApiKey) {
    console.log('❌ No API key found in environment variables');
    console.log('Please set PRESENTON_API_KEY in your .env file');
    return;
  }
  
  if (testApiKey === 'sk-presenton-xxxxx' || testApiKey.includes('xxxxx')) {
    console.log('❌ API key appears to be a placeholder');
    console.log('Please replace PRESENTON_API_KEY in your .env file with your actual API key');
    return;
  }
  
  console.log('Testing Presenton API with provided key format...');
  console.log('API Key format check:');
  console.log('- Length:', testApiKey.length);
  console.log('- Starts with sk-presenton-:', testApiKey.startsWith('sk-presenton-'));
  console.log('- Key preview:', testApiKey.substring(0, 25) + '...');
  
  const apiUrl = 'https://api.presenton.ai';
  
  console.log('\nTesting API call...');
  
  try {
    const response = await fetch(`${apiUrl}/api/v1/ppt/presentation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testApiKey}`
      },
      body: JSON.stringify({
        content: 'Test presentation about artificial intelligence',
        n_slides: 3,
        language: 'English',
        template: 'professional',
        export_as: 'pdf',
        tone: 'professional'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! API key format is correct');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error');
      console.log('Status:', response.status);
      console.log('Error:', errorText);
      
      // Try alternative authentication methods
      console.log('\n🔄 Trying alternative auth formats...');
      
      // Test with X-API-Key header
      const altResponse = await fetch(`${apiUrl}/api/v1/ppt/presentation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': testApiKey
        },
        body: JSON.stringify({
          content: 'Test presentation',
          n_slides: 3
        })
      });
      
      console.log('Alternative auth status:', altResponse.status);
      if (altResponse.ok) {
        console.log('✅ Alternative auth method works!');
        const altData = await altResponse.json();
        console.log('Response:', JSON.stringify(altData, null, 2));
      } else {
        const altErrorText = await altResponse.text();
        console.log('Alternative auth error:', altErrorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Network/Connection Error:', error.message);
    console.log('This could indicate:');
    console.log('- Network connectivity issues');
    console.log('- Incorrect API endpoint');
    console.log('- DNS resolution problems');
  }
}

// Also test if the API endpoint exists
async function testEndpoint() {
  console.log('\n🔍 Testing API endpoint accessibility...');
  try {
    const response = await fetch('https://api.presenton.ai/api/v1/ppt/presentation/generate', {
      method: 'OPTIONS'
    });
    console.log('Endpoint OPTIONS status:', response.status);
    console.log('CORS headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log('Endpoint test error:', error.message);
  }
}

testEndpoint();
testDirectAPI();