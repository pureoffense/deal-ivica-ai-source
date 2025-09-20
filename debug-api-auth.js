import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.PRESENTON_API_KEY;
const baseUrl = 'https://api.presenton.ai';

async function debugAuthentication() {
  console.log('🔍 Presenton API Authentication Debug\n');
  
  // 1. Validate API key format
  console.log('1. API Key Validation:');
  if (!apiKey) {
    console.log('❌ No API key found in environment');
    return;
  }
  
  console.log(`✅ API Key exists`);
  console.log(`- Length: ${apiKey.length}`);
  console.log(`- Format: ${apiKey.substring(0, 20)}...`);
  console.log(`- Starts with sk-presenton-: ${apiKey.startsWith('sk-presenton-')}`);
  
  // 2. Test different endpoints
  const endpoints = [
    '/api/v1/ppt/presentation/generate',
    '/v1/ppt/presentation/generate',
    '/api/presentation/generate',
    '/presentation/generate',
    '/', // Root endpoint
    '/health', // Health check
    '/status' // Status check
  ];
  
  console.log('\n2. Testing different endpoints:');
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      
      if (response.status !== 404 && response.status !== 405) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.text();
            console.log(`  Response: ${data.substring(0, 100)}...`);
          } catch (e) {
            console.log(`  Could not parse response`);
          }
        }
      }
    } catch (error) {
      console.log(`${endpoint}: Error - ${error.message}`);
    }
  }
  
  // 3. Test different authentication methods
  console.log('\n3. Testing different authentication methods:');
  const authMethods = [
    { name: 'Bearer Token', headers: { 'Authorization': `Bearer ${apiKey}` } },
    { name: 'API Key Header', headers: { 'X-API-Key': apiKey } },
    { name: 'Simple Auth', headers: { 'Authorization': apiKey } },
    { name: 'Token Header', headers: { 'Token': apiKey } },
    { name: 'Presenton-Key', headers: { 'Presenton-Key': apiKey } },
  ];
  
  for (const method of authMethods) {
    try {
      const response = await fetch(`${baseUrl}/api/v1/ppt/presentation/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...method.headers
        },
        body: JSON.stringify({
          content: 'Test',
          n_slides: 1
        })
      });
      
      console.log(`${method.name}: ${response.status} ${response.statusText}`);
      
      if (response.status !== 401 && response.status !== 403) {
        const text = await response.text();
        console.log(`  Success! Response: ${text.substring(0, 100)}...`);
        break; // Found working method
      }
    } catch (error) {
      console.log(`${method.name}: Error - ${error.message}`);
    }
  }
  
  // 4. Check if we can reach any public endpoint
  console.log('\n4. Testing public endpoints:');
  try {
    const response = await fetch(`${baseUrl}`, { method: 'GET' });
    console.log(`Root endpoint: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    if (text.includes('presenton') || text.includes('api') || text.includes('documentation')) {
      console.log('✅ API server is reachable');
    } else {
      console.log('❓ Unexpected response from API server');
    }
  } catch (error) {
    console.log(`❌ Cannot reach API server: ${error.message}`);
  }
  
  // 5. Recommendations
  console.log('\n5. Recommendations:');
  console.log('- Check if your API key is valid and active');
  console.log('- Verify the API key from your Presenton account dashboard');
  console.log('- Check if your account has sufficient credits/permissions');
  console.log('- Verify the correct API endpoint in the documentation');
  console.log('- Consider contacting Presenton support if the key is correct');
}

debugAuthentication();