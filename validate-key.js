import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.PRESENTON_API_KEY;

async function validateApiKey() {
  console.log('🔑 Simple API Key Validation Test\n');
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  console.log('Testing with minimal request...');
  
  try {
    // Try a simple GET request that might not require heavy processing
    const response = await fetch('https://api.presenton.ai/api/v1/ppt/presentation/generate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Dealivica-App/1.0'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`Response: ${responseText}`);
    
    if (response.status === 401) {
      console.log('\n❌ Authentication Failed');
      console.log('Possible reasons:');
      console.log('1. API key is expired or revoked');
      console.log('2. API key is invalid');
      console.log('3. Account has insufficient credits');
      console.log('4. API key permissions are restricted');
      
      console.log('\n🔧 Next steps:');
      console.log('1. Log into your Presenton account at https://presenton.ai');
      console.log('2. Go to your account/API settings');
      console.log('3. Check if your current API key is active');
      console.log('4. Generate a new API key if needed');
      console.log('5. Verify your account has available credits');
      
    } else if (response.status === 200 || response.status === 405) {
      console.log('\n✅ Authentication appears to be working!');
      console.log('The API key is being accepted by the server.');
      
    } else {
      console.log('\n⚠️  Unexpected response');
      console.log('The API key might be working, but there\'s another issue.');
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

validateApiKey();