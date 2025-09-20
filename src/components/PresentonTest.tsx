import { useState } from 'react';
import { generatePresentation, getConfigStatus, testAuthentication } from '../services/presentonService';

interface PresentonTestProps {
  className?: string;
}

export function PresentonTest({ className }: PresentonTestProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [testContent, setTestContent] = useState('Create a presentation about artificial intelligence and its impact on modern business.');

  const configStatus = getConfigStatus();

  const handleTestAuth = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const success = await testAuthentication();
      setResult({
        type: 'auth_test',
        success,
        message: success ? 'Authentication successful!' : 'Authentication failed!'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePresentation = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const request = {
        content: testContent,
        n_slides: 5,
        language: 'English',
        template: 'general',
        export_as: 'pptx' as const,
        tone: 'professional' as const
      };

      const response = await generatePresentation(request);
      setResult({
        type: 'presentation',
        data: response
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate presentation');
    } finally {
      setIsLoading(false);
    }
  };

  const isConfigValid = configStatus.hasApiKey && configStatus.hasApiUrl && configStatus.keyFormat === 'valid';

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Presenton API Test</h2>
      
      {/* Configuration Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Configuration Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className={`mr-2 ${configStatus.hasApiKey ? 'text-green-500' : 'text-red-500'}`}>
              {configStatus.hasApiKey ? '✅' : '❌'}
            </span>
            <span>API Key: {configStatus.hasApiKey ? 'Set' : 'Missing or placeholder'}</span>
          </div>
          <div className="flex items-center">
            <span className={`mr-2 ${configStatus.keyFormat === 'valid' ? 'text-green-500' : 'text-red-500'}`}>
              {configStatus.keyFormat === 'valid' ? '✅' : '❌'}
            </span>
            <span>Key Format: {configStatus.keyFormat} ({configStatus.keyLength} chars)</span>
          </div>
          <div className="flex items-center">
            <span className={`mr-2 ${configStatus.hasApiUrl ? 'text-green-500' : 'text-red-500'}`}>
              {configStatus.hasApiUrl ? '✅' : '❌'}
            </span>
            <span>API URL: {configStatus.hasApiUrl ? 'Set' : 'Missing'}</span>
          </div>
          {configStatus.hasApiKey && (
            <div className="text-xs text-gray-600 mt-2">
              Key Preview: {configStatus.keyPreview}
            </div>
          )}
        </div>
      </div>

      {!isConfigValid && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-yellow-800 font-medium mb-2">⚠️ Configuration Issues</h4>
          <p className="text-yellow-700 text-sm mb-3">
            Please update your .env file with a valid Presenton API key:
          </p>
          <ol className="text-yellow-700 text-sm list-decimal list-inside space-y-1">
            <li>Go to <a href="https://presenton.ai/account" target="_blank" rel="noopener noreferrer" className="underline">https://presenton.ai/account</a></li>
            <li>Navigate to API Keys section</li>
            <li>Generate a new API key</li>
            <li>Update VITE_PRESENTON_API_KEY in your .env file</li>
            <li>Restart your development server</li>
          </ol>
        </div>
      )}

      {/* Test Controls */}
      <div className="space-y-4 mb-6">
        <button
          onClick={handleTestAuth}
          disabled={!isConfigValid || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Testing...' : 'Test Authentication'}
        </button>

        <div className="space-y-2">
          <label htmlFor="testContent" className="block text-sm font-medium text-gray-700">
            Test Content:
          </label>
          <textarea
            id="testContent"
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter content for test presentation..."
          />
          <button
            onClick={handleGeneratePresentation}
            disabled={!isConfigValid || isLoading || !testContent.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Test Presentation'}
          </button>
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-medium mb-2">❌ Error</h4>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-green-800 font-medium mb-2">✅ Success</h4>
          {result.type === 'auth_test' ? (
            <p className="text-green-700 text-sm">{result.message}</p>
          ) : (
            <div className="text-green-700 text-sm">
              <p className="mb-2">Presentation generated successfully!</p>
              <div className="bg-white p-3 rounded border">
                <p><strong>Presentation ID:</strong> {result.data.presentation_id}</p>
                <p><strong>Credits Consumed:</strong> {result.data.credits_consumed}</p>
                <p><strong>Download URL:</strong> 
                  <a 
                    href={result.data.path} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-2 text-blue-600 underline hover:text-blue-800"
                  >
                    Download Presentation
                  </a>
                </p>
                <p><strong>Edit URL:</strong> 
                  <a 
                    href={result.data.edit_path} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ml-2 text-blue-600 underline hover:text-blue-800"
                  >
                    Edit Online
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 text-sm mt-2">
            {result?.type === 'auth_test' ? 'Testing authentication...' : 'Generating presentation...'}
          </p>
        </div>
      )}
    </div>
  );
}