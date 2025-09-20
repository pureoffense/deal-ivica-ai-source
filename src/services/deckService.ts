import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { generatePresentation } from './presentonService';

// Presenton API is synchronous - no polling needed

interface CreateDeckRequest {
  prompt: string;
  template?: string;
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

// Get all decks for a specific user
export const getUserDecks = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user decks:', error);
      throw new Error(`Failed to fetch decks: ${error.message}`);
    }

    console.log(`Fetched ${data?.length || 0} decks for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error('getUserDecks error:', error);
    throw error;
  }
};

// Get deck statistics for a user with real analytics data
export const getUserDeckStats = async (userId: string) => {
  try {
    // Get user's decks and their analytics in a single query using LEFT JOIN
    // This ensures we get all decks even if they don't have analytics yet
    const { data: deckAnalytics, error } = await supabase
      .from('decks')
      .select(`
        id,
        generated_content_json,
        created_at,
        analytics!left (
          view_count,
          engaged_users,
          last_viewed_at
        )
      `)
      .eq('creator_id', userId);

    if (error) {
      console.error('Error fetching deck stats:', error);
      throw error;
    }

    const decks = deckAnalytics || [];
    
    // Calculate total views and engaged users from real analytics data
    let totalViews = 0;
    let totalEngagedUsers = 0;
    let recentlyViewedCount = 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    decks.forEach(deck => {
      const analytics = deck.analytics?.[0];
      if (analytics) {
        totalViews += analytics.view_count || 0;
        totalEngagedUsers += analytics.engaged_users || 0;
        
        // Count decks viewed in the last week as "active views"
        if (analytics.last_viewed_at) {
          const lastViewed = new Date(analytics.last_viewed_at);
          if (lastViewed >= oneWeekAgo) {
            recentlyViewedCount++;
          }
        }
      }
    });
    
    // Calculate hours saved based on credits consumed
    const totalCreditsConsumed = decks.reduce((total, deck) => {
      const credits = deck.generated_content_json?.raw_response?.credits_consumed || 0;
      return total + credits;
    }, 0);
    
    // Each credit represents time/effort saved, assume 1 credit = 30 minutes saved
    const hoursSaved = totalCreditsConsumed > 0 
      ? Math.round(totalCreditsConsumed * 0.5)
      : Math.round(decks.length * 2.5); // Fallback: assume 2.5 hours saved per presentation
    
    const stats = {
      totalPresentations: decks.length,
      activeViews: recentlyViewedCount, // Presentations viewed in the last week
      totalViews: totalViews, // Total view count across all presentations
      engagedUsers: totalEngagedUsers, // Total engaged users across all presentations
      hoursSaved: hoursSaved
    };

    console.log('Enhanced stats calculation:', {
      totalDecks: decks.length,
      totalViews,
      totalEngagedUsers,
      recentlyViewedCount,
      totalCreditsConsumed,
      hoursSaved
    });

    return stats;
  } catch (error) {
    console.error('getUserDeckStats error:', error);
    // Return default stats if error
    return {
      totalPresentations: 0,
      activeViews: 0,
      totalViews: 0,
      engagedUsers: 0,
      hoursSaved: 0
    };
  }
};

export const createDeck = async (data: CreateDeckRequest): Promise<DeckResponse> => {
  console.log('Creating deck with data:', data);
  
  // Check if we're in development or production
  const isDevelopment = import.meta.env.DEV;
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    let generatedContent;
    
    if (isDevelopment) {
      // Use direct Presenton API for local development
      console.log('Using direct Presenton API for development...');
      
      const presentationResponse = await generatePresentation({
        content: data.prompt,
        n_slides: 8,
        language: 'English',
        template: data.template || 'general', // Use provided template or fallback to general
        export_as: 'pdf',
        tone: 'professional'
      });
      
      generatedContent = presentationResponse;
      console.log('Presenton generation completed:', generatedContent);
    } else {
      // Use Vercel proxy for production (API key hidden in serverless function)
      console.log('Using Presenton API via Vercel proxy for production...');
      
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

      generatedContent = createResponse.data;
      console.log('Presenton generation completed:', generatedContent);
    }
    
    // Presenton returns the result immediately, no polling needed
    
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
        presentation_url: generatedContent.path, // Already full URL from Presenton
        edit_url: generatedContent.edit_path, // Already full URL from Presenton
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
        slideCount: 8, // We requested 8 slides from Presenton
        theme: 'professional',
        presentation_url: generatedContent.path, // Already full URL from Presenton
        edit_url: generatedContent.edit_path, // Already full URL from Presenton
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

// Analytics functions
export const logDeckView = async (deckId: string) => {
  try {
    console.log('Logging view for deck:', deckId);
    
    // Use the PostgreSQL function for efficient view count increment
    const { error } = await supabase.rpc(
      'increment_view_count',
      { deck_id: deckId }
    );
    
    if (error) {
      console.error('Error logging deck view with function:', error);
      
      // Fallback to upsert if function fails
      const { error: upsertError } = await supabase
        .from('analytics')
        .upsert(
          {
            deck_id: deckId,
            view_count: 1,
            last_viewed_at: new Date().toISOString()
          },
          {
            onConflict: 'deck_id',
            ignoreDuplicates: false
          }
        )
        .select();
      
      if (upsertError) {
        console.error('Error with fallback upsert:', upsertError);
        return false;
      }
    }
    
    console.log('View logged successfully for deck:', deckId);
    return true;
    
  } catch (error) {
    console.error('logDeckView error:', error);
    return false;
  }
};

export const getDeckAnalytics = async (deckId: string) => {
  try {
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('deck_id', deckId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No analytics record exists yet
        return {
          deck_id: deckId,
          view_count: 0,
          engaged_users: 0,
          last_viewed_at: null,
          created_at: null
        };
      }
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('getDeckAnalytics error:', error);
    return {
      deck_id: deckId,
      view_count: 0,
      engaged_users: 0,
      last_viewed_at: null,
      created_at: null
    };
  }
};

// Get engagement insights for analytics dashboard
export const getEngagementInsights = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select(`
        id,
        title,
        created_at,
        analytics (
          view_count,
          engaged_users,
          last_viewed_at,
          created_at
        )
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Calculate insights
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const insights = {
      topPerforming: [] as Array<{id: string, title: string, views: number}>,
      recentActivity: [] as Array<{id: string, title: string, lastViewed: string}>,
      growthMetrics: {
        viewsThisWeek: 0,
        viewsLastWeek: 0,
        newPresentationsThisMonth: 0
      }
    };
    
    // Process each deck
    data?.forEach(deck => {
      const analytics = deck.analytics?.[0];
      const createdAt = new Date(deck.created_at);
      
      // Top performing presentations
      if (analytics?.view_count && analytics.view_count > 0) {
        insights.topPerforming.push({
          id: deck.id,
          title: deck.title,
          views: analytics.view_count
        });
      }
      
      // Recent activity
      if (analytics?.last_viewed_at) {
        const lastViewed = new Date(analytics.last_viewed_at);
        if (lastViewed >= oneWeekAgo) {
          insights.recentActivity.push({
            id: deck.id,
            title: deck.title,
            lastViewed: analytics.last_viewed_at
          });
        }
      }
      
      // Growth metrics
      if (createdAt >= oneMonthAgo) {
        insights.growthMetrics.newPresentationsThisMonth++;
      }
    });
    
    // Sort and limit results
    insights.topPerforming = insights.topPerforming
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    
    insights.recentActivity = insights.recentActivity
      .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
      .slice(0, 10);
    
    return insights;
    
  } catch (error) {
    console.error('getEngagementInsights error:', error);
    return {
      topPerforming: [],
      recentActivity: [],
      growthMetrics: {
        viewsThisWeek: 0,
        viewsLastWeek: 0,
        newPresentationsThisMonth: 0
      }
    };
  }
};

export const getAllAnalytics = async (userId: string) => {
  try {
    // Get analytics for all user's decks using a join
    const { data, error } = await supabase
      .from('decks')
      .select(`
        id,
        title,
        created_at,
        analytics (
          view_count,
          engaged_users,
          last_viewed_at
        )
      `)
      .eq('creator_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Calculate totals
    const totals = {
      totalViews: 0,
      totalEngagedUsers: 0,
      totalDecks: data?.length || 0
    };
    
    const analyticsData = data?.map(deck => ({
      ...deck,
      analytics: deck.analytics?.[0] || {
        view_count: 0,
        engaged_users: 0,
        last_viewed_at: null
      }
    })) || [];
    
    // Sum up totals
    analyticsData.forEach(deck => {
      totals.totalViews += deck.analytics.view_count || 0;
      totals.totalEngagedUsers += deck.analytics.engaged_users || 0;
    });
    
    return {
      decks: analyticsData,
      totals
    };
    
  } catch (error) {
    console.error('getAllAnalytics error:', error);
    return {
      decks: [],
      totals: {
        totalViews: 0,
        totalEngagedUsers: 0,
        totalDecks: 0
      }
    };
  }
};

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