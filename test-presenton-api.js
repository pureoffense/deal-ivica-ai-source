// Test script to verify Presenton API configuration
// Run with: node test-presenton-api.js

require('dotenv').config();

async function testPresentonAPI() {
  const apiKey = process.env.PRESENTON_API_KEY;
  const apiUrl = process.env.PRESENTON_API_URL || 'https://api.presenton.ai';
  
  console.log('Testing Presenton API configuration...');
  console.log('API URL:', apiUrl);
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT SET');
  
  if (!apiKey || apiKey === 'sk-presenton-xxxxx') {
    console.error('❌ PRESENTON_API_KEY is not set or still using placeholder value');
    console.log('Please update your .env file with your actual Presenton API key');
    console.log('Get your API key from: https://presenton.ai/account');
    return;
  }
  
  try {
    const response = await fetch(`${apiUrl}/api/v1/ppt/presentation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        content: 'Test presentation about AI technology',
        n_slides: 3,
        language: 'English',
        template: 'professional',
        export_as: 'pdf',
        tone: 'professional'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API test successful!');
      console.log('Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.error('❌ API test failed');
      console.error('Error:', errorText);
      
      if (response.status === 401) {
        console.log('This likely means your API key is invalid or expired.');
        console.log('Please check your API key at: https://presenton.ai/account');
      } else if (response.status === 403) {
        console.log('Your API key does not have permission to access this resource.');
      } else if (response.status === 429) {
        console.log('Rate limit exceeded. Please try again later.');
      }
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('This might indicate:');
    console.log('- Network connectivity issues');
    console.log('- Incorrect API URL');
    console.log('- CORS issues (if running in browser)');
  }
}

testPresentonAPI();