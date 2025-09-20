# Presenton API Integration Setup

The Deal Ivica AI application uses the Presenton API for AI-powered presentation generation. This document explains how to set up and test the integration.

## Overview

The application includes:
- **API Proxy**: `api/presenton-proxy.js` - Vercel serverless function that handles API calls
- **Service Layer**: `src/services/deckService.ts` - Handles deck creation with Presenton integration
- **Fallback System**: Automatic fallback to mock data if Presenton API is unavailable

## Current Status

✅ **Application works without Presenton API** - The app has a robust fallback system that generates mock presentations when the external API is not available.

⚠️ **Presenton API requires local setup** - The current implementation expects Presenton to be running locally at `http://localhost:5001`.

## Option 1: Use Mock Data (Recommended for Testing)

The application works perfectly without the Presenton API:

1. **No additional setup required**
2. **Deck creation works immediately**
3. **Mock presentations are generated automatically**
4. **All features function normally**

When you create a deck, you'll see:
- Sample slides with professional content
- Proper database storage
- All gate functionality
- Dashboard integration

## Option 2: Set Up Presenton API (Advanced)

If you want to use the actual Presenton API for AI-generated content:

### Prerequisites

1. **Presenton Service**: You need access to a Presenton API service
2. **Local Setup**: The service should be running on `http://localhost:5001`
3. **API Documentation**: Contact the Presenton team for API documentation

### Configuration Steps

1. **Start Presenton Service**:
   ```bash
   # This depends on your Presenton setup
   # Contact Presenton team for specific instructions
   ```

2. **Test API Connection**:
   ```bash
   # Test if Presenton is running
   curl http://localhost:5001/api/v1/ppt/presentation/generate \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"content": "Test presentation", "n_slides": 3}'
   ```

3. **Update Environment** (if needed):
   ```env
   # Add to your .env file if Presenton requires authentication
   PRESENTON_API_KEY=your_api_key_here
   ```

### API Integration Details

The proxy function in `api/presenton-proxy.js` handles:
- **Request mapping**: Converts your app's format to Presenton's expected format
- **CORS handling**: Enables cross-origin requests
- **Error handling**: Provides detailed error messages

Request format sent to Presenton:
```json
{
  "content": "Your presentation prompt",
  "n_slides": 8,
  "language": "English",
  "template": "professional",
  "export_as": "pdf",
  "tone": "professional"
}
```

Expected response from Presenton:
```json
{
  "presentation_id": "unique-id",
  "path": "/path/to/generated/presentation",
  "edit_path": "/path/to/edit/presentation",
  "n_slides": 8
}
```

## Testing Integration

### Test Mock Data (Always Works)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Sign up/login to the application
3. Go to "Create New Presentation"
4. Enter any prompt and create a deck
5. ✅ You should see a mock presentation created

### Test Presenton API (If Configured)

1. Ensure Presenton is running at `http://localhost:5001`
2. Create a new presentation in the app
3. Check browser console for API call logs
4. ✅ You should see actual Presenton-generated content

## Troubleshooting

### Common Issues

1. **"Failed to generate presentation"**
   - ✅ **Expected behavior** - App will fallback to mock data
   - Check if Presenton service is running
   - Verify the API endpoint URL

2. **CORS errors**
   - The proxy function should handle CORS
   - Check `api/presenton-proxy.js` for CORS headers

3. **API format mismatch**
   - Verify Presenton API documentation
   - Update request mapping in `presenton-proxy.js`

4. **Presentation URLs not working**
   - Mock data will show placeholder URLs
   - Real Presenton URLs should point to `localhost:5001`

### Debug Mode

Enable debug logging by checking browser console when creating decks. You'll see:
```
Creating deck with data: {...}
Using Gamma API via Vercel proxy
Calling Presenton API via proxy...
```

## Production Deployment

For production deployment:

1. **Replace localhost with production Presenton URL**
2. **Add proper authentication if required**
3. **Update CORS settings for your domain**
4. **Consider rate limiting and caching**

Example production configuration:
```javascript
// In api/presenton-proxy.js
const PRESENTON_URL = process.env.PRESENTON_API_URL || 'https://your-presenton-instance.com';
```

## Alternative AI Services

If Presenton is not available, you can integrate other AI presentation services:

1. **Gamma API**: Update the proxy to call Gamma instead
2. **Custom AI**: Implement your own AI generation
3. **Template-based**: Create template-based presentations

The application architecture supports any presentation generation service through the proxy pattern.

## Summary

- ✅ **Application works immediately** with mock data
- ⚠️ **Presenton requires additional setup** for real AI generation
- 🔄 **Easy to switch** between mock and real API
- 🚀 **Production-ready** fallback system

The robust fallback system ensures your application delivers value even without the external API integration.