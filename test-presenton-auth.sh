#!/bin/bash

# Presenton API Authentication Test Script
# Usage: ./test-presenton-auth.sh

echo "🔑 Presenton API Authentication Test"
echo "======================================"

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables from .env"
else
    echo "❌ .env file not found"
    exit 1
fi

# Check if API key is set
if [ -z "$VITE_PRESENTON_API_KEY" ] || [ "$VITE_PRESENTON_API_KEY" = "sk-presenton-xxxxx" ]; then
    echo "❌ VITE_PRESENTON_API_KEY is not set or is placeholder"
    echo "Please update your .env file with a valid API key from https://presenton.ai/account"
    exit 1
fi

# Check API key format
if [[ ! "$VITE_PRESENTON_API_KEY" =~ ^sk-presenton- ]]; then
    echo "❌ Invalid API key format. Should start with 'sk-presenton-'"
    exit 1
fi

echo "✅ API Key format looks correct"
echo "📋 Key preview: ${VITE_PRESENTON_API_KEY:0:25}..."
echo "📏 Key length: ${#VITE_PRESENTON_API_KEY}"

echo ""
echo "🚀 Testing API authentication..."
echo "Endpoint: https://api.presenton.ai/api/v1/ppt/presentation/generate"

# Test API call with curl
response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VITE_PRESENTON_API_KEY" \
  -d '{
    "content": "Test presentation about artificial intelligence",
    "n_slides": 3,
    "language": "English",
    "template": "general",
    "export_as": "pptx",
    "tone": "professional"
  }' \
  "https://api.presenton.ai/api/v1/ppt/presentation/generate")

# Extract HTTP status code
http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')

echo ""
echo "📡 Response Status: $http_code"

if [ "$http_code" -eq 200 ]; then
    echo "✅ SUCCESS! API authentication is working!"
    echo "🎉 Presentation generated successfully"
    echo "📄 Response:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
elif [ "$http_code" -eq 401 ]; then
    echo "❌ AUTHENTICATION FAILED (401 Unauthorized)"
    echo "💡 Possible causes:"
    echo "   - API key is invalid, expired, or revoked"
    echo "   - Account has insufficient credits"
    echo "   - Account is suspended or inactive"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Log into https://presenton.ai/account"
    echo "   2. Check your API key in the Account → API Keys section"
    echo "   3. Verify your account has available credits"
    echo "   4. Generate a new API key if needed"
    echo ""
    echo "📄 Error details:"
    echo "$body"
elif [ "$http_code" -eq 422 ]; then
    echo "⚠️  VALIDATION ERROR (422 Unprocessable Entity)"
    echo "🔧 Check your request format and parameters"
    echo "📄 Error details:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
elif [ "$http_code" -eq 429 ]; then
    echo "⏱️  RATE LIMIT EXCEEDED (429 Too Many Requests)"
    echo "🔧 Please wait before making another request"
    echo "📄 Error details:"
    echo "$body"
elif [ "$http_code" -ge 500 ]; then
    echo "🚨 SERVER ERROR ($http_code)"
    echo "🔧 Presenton API server issue - try again later"
    echo "📄 Error details:"
    echo "$body"
else
    echo "⚠️  UNEXPECTED RESPONSE ($http_code)"
    echo "📄 Response body:"
    echo "$body"
fi

echo ""
echo "🏁 Test completed"