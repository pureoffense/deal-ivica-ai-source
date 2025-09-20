import React from 'react';

export function EnvDebug() {
  // Get all environment variables that Vite exposes
  const env = import.meta.env;
  
  // Filter for Presenton-related vars
  const presentonVars = Object.entries(env)
    .filter(([key]) => key.includes('PRESENTON'))
    .reduce((acc, [key, value]) => {
      acc[key] = key.includes('API_KEY') 
        ? (value ? `${String(value).substring(0, 25)}... (${String(value).length} chars)` : 'MISSING')
        : String(value) || 'MISSING';
      return acc;
    }, {} as Record<string, string>);

  // Log to console for debugging
  console.log('🔍 Environment Variables Debug:', {
    all: env,
    presenton: presentonVars,
    mode: env.MODE,
    dev: env.DEV,
    prod: env.PROD
  });

  return (
    <div className="p-4 bg-gray-100 rounded-lg mb-4">
      <h3 className="font-bold text-lg mb-3">🔍 Environment Variables Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Mode:</strong> {env.MODE}</div>
        <div><strong>DEV:</strong> {String(env.DEV)}</div>
        <div><strong>PROD:</strong> {String(env.PROD)}</div>
        
        <div className="mt-4">
          <strong>Presenton Variables:</strong>
          <div className="ml-4 mt-2 space-y-1">
            {Object.entries(presentonVars).map(([key, value]) => (
              <div key={key} className="font-mono text-xs">
                <span className="text-blue-600">{key}:</span> {value}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <strong>All Environment Variables:</strong>
          <div className="ml-4 mt-2 space-y-1 max-h-40 overflow-y-auto">
            {Object.entries(env).map(([key, value]) => (
              <div key={key} className="font-mono text-xs">
                <span className="text-blue-600">{key}:</span> {String(value).substring(0, 50)}
                {String(value).length > 50 ? '...' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => console.log('Full env object:', env)}
        className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm"
      >
        Log Full Env to Console
      </button>
    </div>
  );
}