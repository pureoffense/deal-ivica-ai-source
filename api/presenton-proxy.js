export default async function handler(req, res) {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Presenton proxy request body:', req.body);
    
    // Map your app's request to Presenton's API format
    const presentonBody = {
      content: req.body.prompt,  // Map your app's prompt to 'content'
      n_slides: req.body.settings?.slide_count === 'auto' ? 8 : parseInt(req.body.settings?.slide_count || 8),  // Default to 8 slides
      language: 'English',  // Or map from your settings
      template: req.body.settings?.theme || 'general',
      export_as: 'pdf',  // Or 'pptx'; adjust based on your needs
      tone: req.body.settings?.tone || 'professional'
    };
    
    console.log('Sending to Presenton API:', presentonBody);
    
    // Call local Presenton API
    const response = await fetch('http://localhost:5001/api/v1/ppt/presentation/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presentonBody),
    });

    console.log('Presenton API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Presenton API error:', errorText);
      throw new Error(`Presenton API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Presenton API success:', data);
    
    // Return the response which includes presentation_id, path, edit_path
    res.status(200).json(data);
  } catch (error) {
    console.error('Presenton proxy error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check Vercel function logs for more details'
    });
  }
}
