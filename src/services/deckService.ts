import axios from 'axios';
import { supabase } from '@/lib/supabase';

// Presenton API is synchronous - no polling needed

interface CreateDeckRequest {
  prompt: string;
  gates?: string[];
}

interface DeckResponse {
  id: string;
  content: Record<string, unknown>;
  slides: Array<Record<string, unknown>>;
  metadata: {
    title: string;
    slideCount: number;
    theme: string;
    presentation_url?: string;
    edit_url?: string;
    presentation_id?: string;
  };
}

export const createDeck = async (data: CreateDeckRequest): Promise<DeckResponse> => {
  console.log('Creating deck with data:', data);
  
  // Use proxy for Presenton API calls (API key is stored in Vercel environment)
  console.log('Using Presenton API via Vercel proxy');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Calling Presenton API via proxy...');
    // Call Presenton API through Vercel proxy to avoid CORS
    const createResponse = await axios.post('/api/presenton-proxy', {
      prompt: data.prompt,
      settings: {
        theme: 'professional',
        format: 'presentation',
        include_images: true,
        slide_count: 'auto'
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const createData = createResponse.data;
    console.log('Presenton generation completed:', createData);
    
    // Presenton returns the result immediately, no polling needed
    const generatedContent = createData;
    
    // Generate unique URL for the deck (TEXT field)
    const uniqueUrl = `deck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store deck in Supabase database
    const payload = {
      // Don't set id - let Supabase auto-generate UUID
      creator_id: user.id, // This is already a UUID from auth
      title: extractTitleFromPrompt(data.prompt),
      prompt_text: data.prompt,
      generated_content_json: {
        presentation_id: generatedContent.presentation_id,
        presentation_url: `https://api.presenton.ai${generatedContent.path}`,
        edit_url: `https://api.presenton.ai${generatedContent.edit_path}`,
        raw_response: generatedContent
      },
      gate_settings_json: data.gates || [],
      unique_url: uniqueUrl, // Custom slug for sharing
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Insert payload:', payload);
    console.log('User ID from auth:', user.id);
    
    const { data: deck, error } = await supabase
      .from('decks')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to save deck to database: ${error.message || 'Unknown error'}`);
    }

    return {
      id: deck.id,
      content: generatedContent,
      slides: [], // Presenton creates presentation files directly
      metadata: {
        title: deck.title,
        slideCount: generatedContent.n_slides || 8,
        theme: 'professional',
        presentation_url: `https://api.presenton.ai${generatedContent.path}`,
        edit_url: `https://api.presenton.ai${generatedContent.edit_path}`,
        presentation_id: generatedContent.presentation_id
      }
    };

  } catch (error) {
    console.error('Deck creation error:', error);
    
    // Fallback to mock data if Presenton API fails
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 401) {
        throw new Error('Invalid API key. Please check your Presenton API configuration.');
      }
      
      if (axiosError.response?.status && axiosError.response.status >= 400) {
        throw new Error(`Presenton API Error: ${axiosError.response.data?.message || 'Failed to generate presentation'}`);
      }
    }
    
    // For development/demo purposes, return mock data
    return createMockDeck(data);
  }
};

// Helper function to extract title from prompt
function extractTitleFromPrompt(prompt: string): string {
  // Simple extraction - take first sentence or first 50 characters
  const firstSentence = prompt.split('.')[0] || prompt;
  return firstSentence.length > 50 
    ? firstSentence.substring(0, 47) + '...'
    : firstSentence;
}

// Mock deck creation for development/fallback
async function createMockDeck(data: CreateDeckRequest): Promise<DeckResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const uniqueUrl = `deck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const title = extractTitleFromPrompt(data.prompt);
  
  const mockContent = {
    slides: [
      {
        id: 1,
        type: 'title',
        title: title,
        subtitle: 'Generated by Deal Ivica AI',
        layout: 'title-slide'
      },
      {
        id: 2,
        type: 'content',
        title: 'Overview',
        content: [
          'Key points from your prompt',
          'AI-generated insights',
          'Professional structure'
        ],
        layout: 'bullet-points'
      },
      {
        id: 3,
        type: 'content',
        title: 'Next Steps',
        content: [
          'Review generated content',
          'Customize as needed',
          'Share with your audience'
        ],
        layout: 'bullet-points'
      }
    ],
    theme: 'professional',
    metadata: {
      generatedAt: new Date().toISOString(),
      prompt: data.prompt.substring(0, 100)
    }
  };

  // Store mock deck in database
  const mockPayload = {
    // Don't set id - let Supabase auto-generate UUID
    creator_id: user.id, // This is already a UUID from auth
    title: title,
    prompt_text: data.prompt,
    generated_content_json: mockContent,
    gate_settings_json: data.gates || [],
    unique_url: uniqueUrl, // Custom slug for sharing (TEXT field)
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('Mock deck insert payload:', mockPayload);
  console.log('Mock user ID from auth:', user.id);
  
  const { data: deck, error } = await supabase
    .from('decks')
    .insert(mockPayload)
    .select()
    .single();

  if (error) {
    console.error('Mock deck insert error:', error);
    console.error('Mock error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to save mock deck to database: ${error.message || 'Unknown error'}`);
  }

  return {
    id: deck.id,
    content: mockContent,
    slides: mockContent.slides,
    metadata: {
      title: title,
      slideCount: mockContent.slides.length,
      theme: 'professional'
    }
  };
}