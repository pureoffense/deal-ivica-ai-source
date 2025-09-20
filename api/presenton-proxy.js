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
    console.log('Environment check:', {
      apiKeySet: !!process.env.PRESENTON_API_KEY,
      apiKeyPreview: process.env.PRESENTON_API_KEY ? `${process.env.PRESENTON_API_KEY.substring(0, 15)}...` : 'NOT SET',
      apiUrl: process.env.PRESENTON_API_URL || 'NOT SET'
    });
    
    // Check for API key
    const apiKey = process.env.PRESENTON_API_KEY;
    const apiUrl = process.env.PRESENTON_API_URL || 'https://api.presenton.ai';
    
    if (!apiKey) {
      console.error('❌ PRESENTON_API_KEY not configured!');
      throw new Error('API key not configured. Please set PRESENTON_API_KEY in Vercel environment variables.');
    }
    
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
    console.log('Using API URL:', apiUrl);
    
    // Prepare headers with optional authentication
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add authentication header if API key is available
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      // Alternative auth patterns (uncomment the one your API uses):
      // headers['X-API-Key'] = apiKey;
      // headers['Authorization'] = `API-Key ${apiKey}`;
      console.log('Adding authentication header');
    }
    
    // Call Presenton API
    const response = await fetch(`${apiUrl}/api/v1/ppt/presentation/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(presentonBody),
    });

    console.log('Presenton API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Presenton API error:', errorText);
      
      // Handle specific authentication errors
      if (response.status === 401) {
        throw new Error('Authentication failed: Invalid or missing API key. Please check your PRESENTON_API_KEY environment variable.');
      } else if (response.status === 403) {
        throw new Error('Access forbidden: Your API key does not have permission to access this resource.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Too many requests. Please try again later.');
      }
      
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
