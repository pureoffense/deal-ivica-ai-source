#!/usr/bin/env node

// Test access to generated presentation URLs from console logs
console.log('🔗 Testing Presentation URL Access');
console.log('==================================');

// URLs from your console logs
const presentationURLs = [
  {
    name: 'Latest Generated PPTX',
    download: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/users/cce3bf09-5c4a-4c9e-8d1f-810c9a79d3f0/exports/b791bf9f-de67-4fa1-88a0-371f1bc02a7d.pptx',
    edit: 'https://presenton.ai/presentation?id=1678257b-1b5d-4850-8919-e06adcf999ae'
  },
  {
    name: 'Previous Generated PPTX',
    download: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/users/cce3bf09-5c4a-4c9e-8d1f-810c9a79d3f0/exports/575901a8-6475-4b9a-afd4-205477978c05.pptx',
    edit: 'https://presenton.ai/presentation?id=9d68c6db-1fb0-4060-ac9d-64d5a5367738'
  },
  {
    name: 'First Test PPTX',
    download: 'https://presenton-public.s3.ap-southeast-1.amazonaws.com/users/cce3bf09-5c4a-4c9e-8d1f-810c9a79d3f0/exports/14cb6a25-4281-4e00-aebc-5f277775e673.pptx',
    edit: 'https://presenton.ai/presentation?id=fae981f7-9b09-43a7-a42b-c8948fac72c9'
  }
];

async function testPresentationAccess() {
  for (const presentation of presentationURLs) {
    console.log(`\n📊 Testing: ${presentation.name}`);
    console.log('=' + '='.repeat(presentation.name.length + 11));
    
    try {
      // Test download URL accessibility
      console.log('📥 Testing download URL...');
      const downloadResponse = await fetch(presentation.download, { method: 'HEAD' });
      console.log(`   Status: ${downloadResponse.status} ${downloadResponse.statusText}`);
      console.log(`   Content-Type: ${downloadResponse.headers.get('content-type')}`);
      console.log(`   Content-Length: ${downloadResponse.headers.get('content-length')} bytes`);
      
      if (downloadResponse.ok) {
        console.log('✅ Download URL accessible');
        console.log(`📂 Download: ${presentation.download}`);
      } else {
        console.log('❌ Download URL not accessible');
      }
      
      // Test edit URL accessibility
      console.log('🖊️  Testing edit URL...');
      const editResponse = await fetch(presentation.edit, { method: 'HEAD' });
      console.log(`   Status: ${editResponse.status} ${editResponse.statusText}`);
      
      if (editResponse.ok) {
        console.log('✅ Edit URL accessible');
        console.log(`✏️  Edit online: ${presentation.edit}`);
      } else {
        console.log('❌ Edit URL not accessible (might require login)');
        console.log(`✏️  Try logging into Presenton.ai first: ${presentation.edit}`);
      }
      
    } catch (error) {
      console.error(`💥 Error testing ${presentation.name}:`, error.message);
    }
  }
  
  console.log('\n🎯 Summary:');
  console.log('============');
  console.log('• Download URLs should be directly accessible');
  console.log('• Edit URLs require logging into Presenton.ai');
  console.log('• You can open the download URLs directly in PowerPoint/Google Slides');
  console.log('• The CSP fix should now prevent web worker errors in your app');
  
  console.log('\n🔄 Next Steps:');
  console.log('1. Test presentation generation in your app at http://localhost:5173');
  console.log('2. Login and go to "Create New Deck"');
  console.log('3. Try generating a presentation - CSP errors should be gone');
  console.log('4. Check that the presentation displays properly in the UI');
}

testPresentationAccess();