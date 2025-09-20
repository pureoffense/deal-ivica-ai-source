export default async function handler(req, res) {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check environment variables
  const apiKey = process.env.PRESENTON_API_KEY;
  const apiUrl = process.env.PRESENTON_API_URL;
  
  res.status(200).json({
    environment: 'vercel',
    timestamp: new Date().toISOString(),
    api_key_set: !!apiKey,
    api_key_preview: apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT SET',
    api_url: apiUrl || 'NOT SET',
    all_env_keys: Object.keys(process.env).filter(key => 
      key.includes('PRESENTON') || key.includes('SUPABASE')
    )
  });
}