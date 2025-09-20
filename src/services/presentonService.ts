import axios from 'axios';

// Presenton API configuration from environment variables
const API_KEY = import.meta.env.VITE_PRESENTON_API_KEY as string;
const API_URL = import.meta.env.VITE_PRESENTON_API_URL as string;
const BASE_URL = import.meta.env.VITE_PRESENTON_BASE_URL as string;

// Debug environment variables on service load
console.log('🔧 Presenton Service Loaded - Environment Check:', {
  hasApiKey: !!API_KEY,
  keyLength: API_KEY?.length || 0,
  keyPreview: API_KEY ? `${API_KEY.substring(0, 25)}...` : 'MISSING',
  hasApiUrl: !!API_URL,
  apiUrl: API_URL || 'MISSING',
  hasBaseUrl: !!BASE_URL,
  baseUrl: BASE_URL || 'MISSING',
  allEnvVars: Object.keys(import.meta.env).filter(k => k.includes('PRESENTON'))
});

// Type definitions for Presenton API
export type PresentationRequest = {
  content: string;
  n_slides?: number;
  language?: string;
  template?: string;
  export_as?: 'pptx' | 'pdf';
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  web_search?: boolean;
  files?: string[]; // Array of file IDs for uploaded files
};

export type PresentationResponse = {
  presentation_id: string;
  path: string; // Download URL
  edit_path: string;
  credits_consumed: number;
};

export type PresentonError = {
  detail: string | Array<{
    type: string;
    loc: string[];
    msg: string;
    input: any;
  }>;
};

// Validate environment configuration
function validateConfig(): void {
  if (!API_KEY || API_KEY === 'sk-presenton-xxxxx' || API_KEY.includes('xxxxx')) {
    throw new Error(
      'Presenton API key is not configured. Please set VITE_PRESENTON_API_KEY in your .env file with a valid key from https://presenton.ai/account'
    );
  }
  
  if (!API_URL) {
    throw new Error('Presenton API URL is not configured. Please set VITE_PRESENTON_API_URL in your .env file');
  }
  
  if (!API_KEY.startsWith('sk-presenton-')) {
    throw new Error('Invalid Presenton API key format. Key should start with "sk-presenton-"');
  }
}

// Create axios instance with default configuration
const presentonAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  timeout: 60000, // 60 seconds timeout for presentation generation
});

// Add request interceptor for logging and validation
presentonAPI.interceptors.request.use(
  (config) => {
    console.log('🎯 Presenton API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullUrl: `${config.baseURL}${config.url}`,
      hasAuth: !!config.headers.Authorization,
      authHeader: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 20)}...` : 'missing',
      body: config.data
    });
    return config;
  },
  (error) => {
    console.error('❌ Presenton API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
presentonAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Presenton API Success:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Presenton API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response?.status === 400) {
      const errorMsg = error.response.data?.message || error.response.data?.detail || 'Bad request';
      if (errorMsg.includes('template') || errorMsg.includes('Template')) {
        throw new Error(`Invalid template specified. Please use one of: general, modern, standard, swift. Error: ${errorMsg}`);
      }
      throw new Error(`Bad request: ${errorMsg}`);
    } else if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please check your Presenton API key and account status.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. Please check your account permissions and billing status.');
    } else if (error.response?.status === 422) {
      const detail = error.response.data?.detail;
      if (Array.isArray(detail)) {
        const messages = detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        throw new Error(`Validation error: ${messages}`);
      } else {
        throw new Error(`Validation error: ${detail || 'Invalid request data'}`);
      }
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    } else if (error.response?.status >= 500) {
      throw new Error('Presenton API server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

/**
 * Generate a presentation using the Presenton API
 * @param request - The presentation request parameters
 * @returns Promise resolving to the presentation response
 */
export async function generatePresentation(request: PresentationRequest): Promise<PresentationResponse> {
  try {
    // Validate configuration before making request
    validateConfig();
    
    // Set default values with explicit template validation
    const requestData: PresentationRequest = {
      n_slides: 8,
      language: 'English',
      template: 'general', // Default to 'general' - valid options: 'general', 'modern', 'standard', 'swift'
      export_as: 'pptx',
      tone: 'professional',
      web_search: false,
      ...request
    };
    
    // Validate template value
    const validTemplates = ['general', 'modern', 'standard', 'swift'];
    if (!validTemplates.includes(requestData.template || '')) {
      console.warn(`⚠️ Invalid template '${requestData.template}', defaulting to 'general'`);
      requestData.template = 'general';
    }
    
    console.log('🚀 Generating presentation with Presenton API...');
    console.log('📋 Request Details:', {
      content_length: requestData.content.length,
      content_preview: requestData.content.substring(0, 100) + '...',
      n_slides: requestData.n_slides,
      template: requestData.template,
      export_as: requestData.export_as,
      tone: requestData.tone,
      language: requestData.language,
      web_search: requestData.web_search
    });
    console.log('📤 Full Request Body:', JSON.stringify(requestData, null, 2));
    
    const response = await presentonAPI.post('/api/v1/ppt/presentation/generate', requestData);
    
    console.log('🎉 Presentation generated successfully!', {
      presentation_id: response.data.presentation_id,
      credits_consumed: response.data.credits_consumed
    });
    
    return response.data;
    
  } catch (error) {
    console.error('💥 Failed to generate presentation:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to generate presentation. Please try again.');
    }
  }
}

/**
 * Quick test function to validate API authentication
 * @returns Promise resolving to true if authentication works
 */
export async function testAuthentication(): Promise<boolean> {
  try {
    validateConfig();
    
    console.log('🔑 Testing Presenton API authentication...');
    
    // Try a minimal request to test auth
    await generatePresentation({
      content: 'Test presentation',
      n_slides: 1
    });
    
    console.log('✅ Presenton API authentication successful!');
    return true;
    
  } catch (error) {
    console.error('❌ Presenton API authentication failed:', error);
    return false;
  }
}

/**
 * Get all available templates from Presenton API
 * @returns Promise resolving to array of template objects
 */
export async function getAllTemplates() {
  try {
    // Validate configuration before making request
    validateConfig();
    
    console.log('🎨 Fetching available templates from Presenton API...');
    
    const response = await presentonAPI.get('/api/v1/ppt/template/all');
    
    console.log('✅ Templates fetched successfully:', response.data);
    
    // If the API returns a simple array of template names, transform to objects
    const templates = Array.isArray(response.data) ? response.data : [];
    
    // Transform string templates to objects with additional info
    const enhancedTemplates = templates.map((template: any) => {
      if (typeof template === 'string') {
        return {
          id: template,
          name: template,
          displayName: formatTemplateName(template),
          description: getTemplateDescription(template)
        };
      }
      return {
        id: template.id || template.name,
        name: template.name,
        displayName: template.displayName || formatTemplateName(template.name),
        description: template.description || getTemplateDescription(template.name),
        preview: template.preview || null
      };
    });
    
    return enhancedTemplates;
    
  } catch (error) {
    console.error('💥 Failed to fetch templates:', error);
    
    // Return fallback templates if API fails
    console.log('Using fallback templates');
    return getFallbackTemplates();
  }
}

/**
 * Format template name for display
 */
function formatTemplateName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ');
}

/**
 * Get description for template
 */
function getTemplateDescription(name: string): string {
  const descriptions: Record<string, string> = {
    general: 'Versatile template suitable for any presentation type',
    modern: 'Contemporary design with clean lines and bold typography',
    standard: 'Classic business presentation layout',
    swift: 'Minimalist template for quick, focused presentations',
    professional: 'Formal business template with corporate styling',
    creative: 'Dynamic template with creative elements and vibrant colors'
  };
  
  return descriptions[name.toLowerCase()] || 'Professional presentation template';
}

/**
 * Get fallback templates if API fails
 */
function getFallbackTemplates() {
  return [
    {
      id: 'general',
      name: 'general',
      displayName: 'General',
      description: 'Versatile template suitable for any presentation type'
    },
    {
      id: 'modern',
      name: 'modern',
      displayName: 'Modern',
      description: 'Contemporary design with clean lines and bold typography'
    },
    {
      id: 'standard',
      name: 'standard',
      displayName: 'Standard',
      description: 'Classic business presentation layout'
    },
    {
      id: 'swift',
      name: 'swift',
      displayName: 'Swift',
      description: 'Minimalist template for quick, focused presentations'
    }
  ];
}

/**
 * Get API configuration status
 * @returns Object with configuration status
 */
export function getConfigStatus() {
  return {
    hasApiKey: !!API_KEY && API_KEY !== 'sk-presenton-xxxxx' && !API_KEY.includes('xxxxx'),
    hasApiUrl: !!API_URL,
    hasBaseUrl: !!BASE_URL,
    keyFormat: API_KEY ? (API_KEY.startsWith('sk-presenton-') ? 'valid' : 'invalid') : 'missing',
    keyLength: API_KEY?.length || 0,
    keyPreview: API_KEY ? `${API_KEY.substring(0, 20)}...` : 'not set'
  };
}
