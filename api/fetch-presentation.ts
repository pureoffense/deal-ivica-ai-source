import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  // Validate URL parameter
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log('Proxying presentation fetch for:', url);

    // Validate that the URL is from an allowed domain (security measure)
    const allowedDomains = [
      'presenton.ai',
      's3.amazonaws.com',
      'amazonaws.com',
      '.s3.amazonaws.com',
      'presenton-files.s3.amazonaws.com'
    ];

    const urlObj = new URL(url);
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || 
      urlObj.hostname.endsWith(domain) ||
      urlObj.hostname.includes('presenton')
    );

    if (!isAllowed) {
      console.warn('Blocked request to unauthorized domain:', urlObj.hostname);
      return res.status(403).json({ error: 'Domain not allowed' });
    }

    // Fetch the file from the remote server
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Deal-Ivica-AI/1.0',
        'Accept': 'application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch from remote server:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Failed to fetch presentation: ${response.status} ${response.statusText}` 
      });
    }

    // Get the content type from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Set appropriate headers for the response
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes

    // Stream the file data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Successfully proxied presentation:', {
      size: buffer.length,
      contentType,
      url: url.substring(0, 100) + '...'
    });

    return res.send(buffer);

  } catch (error) {
    console.error('Error proxying presentation:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch presentation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}