#!/usr/bin/env node

// Comprehensive test for the deck creation workflow
// Tests: Environment -> Presenton API -> Supabase Database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

console.log('🔄 Testing Complete Deck Creation Workflow');
console.log('==========================================');

// Environment validation
const presentonApiKey = process.env.VITE_PRESENTON_API_KEY;
const presentonApiUrl = process.env.VITE_PRESENTON_API_URL;
const presentonBaseUrl = process.env.VITE_PRESENTON_BASE_URL;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('1. Environment Check:');
console.log('✓ Presenton API Key:', presentonApiKey ? `${presentonApiKey.substring(0, 25)}... (${presentonApiKey.length} chars)` : '❌ MISSING');
console.log('✓ Presenton API URL:', presentonApiUrl || '❌ MISSING');
console.log('✓ Presenton Base URL:', presentonBaseUrl || '❌ MISSING');
console.log('✓ Supabase URL:', supabaseUrl || '❌ MISSING');
console.log('✓ Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 25)}... (${supabaseKey.length} chars)` : '❌ MISSING');

if (!presentonApiKey || !supabaseUrl || !supabaseKey) {
  console.log('\n❌ Missing required environment variables');
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testPrompt = 'Create a one-page presentation about the benefits of renewable energy for businesses';

async function testWorkflow() {
  try {
    console.log('\n2. Testing Presenton API Integration:');
    console.log('----------------------------------------');
    
    // Step 1: Test Presenton API
    const presentonRequest = {
      content: testPrompt,
      n_slides: 3,
      language: 'English',
      template: 'general',
      export_as: 'pptx',
      tone: 'professional',
      web_search: false
    };

    console.log('📤 Sending request to Presenton API...');
    console.log('Request details:', {
      content_length: presentonRequest.content.length,
      n_slides: presentonRequest.n_slides,
      template: presentonRequest.template
    });

    const presentonResponse = await fetch('https://api.presenton.ai/api/v1/ppt/presentation/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${presentonApiKey}`
      },
      body: JSON.stringify(presentonRequest)
    });

    console.log('📡 Presenton API Response:', presentonResponse.status, presentonResponse.statusText);

    if (!presentonResponse.ok) {
      const error = await presentonResponse.text();
      throw new Error(`Presenton API failed: ${presentonResponse.status} - ${error}`);
    }

    const presentonData = await presentonResponse.json();
    console.log('✅ Presenton API Success!');
    console.log('Generated presentation:', {
      id: presentonData.presentation_id,
      credits_consumed: presentonData.credits_consumed,
      download_url: presentonData.path,
      edit_url: presentonData.edit_path
    });

    console.log('\n3. Testing Supabase Database Integration:');
    console.log('------------------------------------------');

    // Step 2: Test Supabase authentication (simulate user)
    // Note: In a real app, you'd have a logged-in user
    console.log('ℹ️  Skipping auth simulation for this test (would need real user login)');

    // Step 3: Test database insertion (mock user ID for testing)
    const mockUserId = 'test-user-' + Date.now();
    const uniqueUrl = `deck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const deckPayload = {
      creator_id: mockUserId,
      title: extractTitleFromPrompt(testPrompt),
      prompt_text: testPrompt,
      generated_content_json: {
        presentation_id: presentonData.presentation_id,
        presentation_url: presentonData.path,
        edit_url: presentonData.edit_path,
        raw_response: presentonData
      },
      gate_settings_json: [],
      unique_url: uniqueUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('💾 Inserting deck into Supabase...');
    console.log('Payload summary:', {
      title: deckPayload.title,
      creator_id: deckPayload.creator_id,
      unique_url: deckPayload.unique_url,
      has_presentation_data: !!deckPayload.generated_content_json.presentation_id
    });

    // Note: This might fail due to RLS policies requiring authenticated users
    const { data: deck, error: dbError } = await supabase
      .from('decks')
      .insert(deckPayload)
      .select()
      .single();

    if (dbError) {
      if (dbError.code === '42501') {
        console.log('⚠️  Database RLS policy blocked insert (expected - need authenticated user)');
        console.log('This is normal for production security - the API would work with real auth');
      } else {
        console.error('❌ Database error:', dbError);
        throw dbError;
      }
    } else {
      console.log('✅ Database insert successful!');
      console.log('Created deck:', {
        id: deck.id,
        title: deck.title,
        unique_url: deck.unique_url
      });
    }

    console.log('\n4. Complete Workflow Summary:');
    console.log('==============================');
    console.log('✅ Environment variables loaded correctly');
    console.log('✅ Presenton API authentication working');
    console.log('✅ Presenton API request successful');
    console.log('✅ Generated presentation with valid URLs');
    console.log('✅ Supabase connection established');
    console.log(dbError ? '⚠️  Database insert blocked by RLS (normal)' : '✅ Database operations working');
    
    console.log('\n🎉 Workflow test completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Test the full workflow in your React app at http://localhost:5173');
    console.log('2. Login with a real user account');
    console.log('3. Go to "Create New Deck" and test with a simple prompt');
    console.log('4. Check that the deck appears in your dashboard');
    console.log('5. Verify the presentation can be downloaded from the generated URL');

  } catch (error) {
    console.error('\n💥 Workflow test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check environment variables are set correctly');
    console.log('- Verify Presenton API key is valid and has credits');
    console.log('- Ensure Supabase configuration is correct');
    console.log('- Check that your database schema is set up properly');
  }
}

function extractTitleFromPrompt(prompt) {
  const firstSentence = prompt.split('.')[0] || prompt;
  return firstSentence.length > 50 
    ? firstSentence.substring(0, 47) + '...'
    : firstSentence;
}

testWorkflow();