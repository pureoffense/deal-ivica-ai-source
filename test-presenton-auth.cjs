#!/usr/bin/env node

/**
 * Test script for Presenton API authentication
 * 
 * This script tests the authentication setup without running the full application.
 * Run with: node test-presenton-auth.js
 * 
 * Uses curl command for testing to avoid module complications
 */

const { execSync } = require('child_process');
const fs = require('fs');
require('dotenv').config();

function testPresentonAuth() {
  console.log('🧪 Testing Presenton API Authentication\n');
  
  const apiKey = process.env.PRESENTON_API_KEY;
  const apiUrl = process.env.PRESENTON_API_URL || 'http://localhost:5001';
  
  console.log(`📍 API URL: ${apiUrl}`);
  console.log(`🔑 API Key: ${apiKey ? '***' + apiKey.slice(-4) : 'NOT CONFIGURED'}\n`);
  
  // Test payload
  const testPayload = {
    content: "Test presentation about API authentication",
    n_slides: 3,
    language: "English",
    template: "professional",
    export_as: "pdf",
    tone: "professional"
  };
  
  // Create temp file for payload
  const tempPayload = '/tmp/presenton-test-payload.json';
  fs.writeFileSync(tempPayload, JSON.stringify(testPayload));
  
  // Build curl command
  let curlCommand = `curl -s -w "HTTP_STATUS:%{http_code}" -X POST "${apiUrl}/api/v1/ppt/presentation/generate" -H "Content-Type: application/json"`;
  
  if (apiKey) {
    curlCommand += ` -H "Authorization: Bearer ${apiKey}"`;
    console.log('✅ Adding authentication header');
  } else {
    console.log('⚠️  No API key configured - testing without authentication');
  }
  
  curlCommand += ` -d @"${tempPayload}"`;
  
  try {
    console.log('\n🚀 Sending request to Presenton API...');
    console.log(`Command: ${curlCommand.replace(apiKey, 'XXX')}\n`);
    
    const output = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
    
    // Parse response
    const httpStatusMatch = output.match(/HTTP_STATUS:(\d+)$/);
    const httpStatus = httpStatusMatch ? parseInt(httpStatusMatch[1]) : 0;
    const responseBody = output.replace(/HTTP_STATUS:\d+$/, '');
    
    console.log(`📡 Response status: ${httpStatus}`);
    
    if (httpStatus >= 200 && httpStatus < 300) {
      console.log('✅ SUCCESS: API authentication working!');
      console.log('📊 Response data:');
      try {
        const jsonData = JSON.parse(responseBody);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(responseBody);
      }
    } else {
      console.log('❌ FAILED: API request failed');
      console.log(`Status: ${httpStatus}`);
      console.log(`Error: ${responseBody}`);
      
      // Provide specific guidance based on status code
      if (httpStatus === 401) {
        console.log('\n💡 Troubleshooting:');
        console.log('- Check your PRESENTON_API_KEY in .env file');
        console.log('- Verify the API key is correct and active');
        console.log('- Contact Presenton team if key should be valid');
      } else if (httpStatus === 403) {
        console.log('\n💡 Troubleshooting:');
        console.log('- Your API key may not have the required permissions');
        console.log('- Contact Presenton team to verify your API key scope');
      } else if (httpStatus === 404) {
        console.log('\n💡 Troubleshooting:');
        console.log('- Check if Presenton service is running');
        console.log('- Verify the PRESENTON_API_URL is correct');
      } else if (httpStatus === 0) {
        console.log('\n💡 Troubleshooting:');
        console.log('- Check if Presenton service is running');
        console.log('- Verify network connectivity');
        console.log('- Check firewall settings');
      }
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR: Could not connect to Presenton API');
    console.log(`Error: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('- Check if Presenton service is running');
    console.log('- Verify network connectivity');
    console.log('- Check firewall settings');
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempPayload)) {
      fs.unlinkSync(tempPayload);
    }
  }
}

// Run the test
testPresentonAuth();
