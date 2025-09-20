import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Share, 
  Eye, 
  Calendar, 
  User,
  AlertCircle,
  ExternalLink,
  BarChart3,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { logDeckView, getDeckAnalytics } from '@/services/deckService';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/constants';

interface Deck {
  id: string;
  title: string;
  prompt_text: string;
  created_at: string;
  updated_at: string;
  unique_url: string;
  creator_id: string;
  generated_content_json: {
    presentation_id?: string;
    presentation_url?: string;
    edit_url?: string;
    raw_response?: any;
  };
  gate_settings_json: string[];
  creator?: {
    email?: string;
    full_name?: string;
  };
}

interface Analytics {
  deck_id: string;
  view_count: number;
  engaged_users: number;
  last_viewed_at: string | null;
  created_at: string | null;
}

const DeckView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchDeck = async () => {
      if (!id) {
        setError('No deck ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch deck details with creator information
        const { data: deckData, error: deckError } = await supabase
          .from('decks')
          .select(`
            *,
            creator:users(email, full_name)
          `)
          .eq('id', id)
          .single();

        if (deckError) {
          if (deckError.code === 'PGRST116') {
            setError('Presentation not found');
          } else {
            setError('Failed to load presentation');
          }
          console.error('Error fetching deck:', deckError);
          return;
        }

        setDeck(deckData);
        
        // Set share URL
        const currentUrl = `${window.location.origin}/deck/${id}/view`;
        setShareUrl(currentUrl);

        // Log the view (don't block UI on this)
        logDeckView(id).catch(err => {
          console.warn('Failed to log deck view:', err);
        });

      } catch (err) {
        console.error('Error in fetchDeck:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [id]);

  // Fetch analytics separately (non-blocking)
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!id) return;

      try {
        setAnalyticsLoading(true);
        const analyticsData = await getDeckAnalytics(id);
        setAnalytics(analyticsData);
      } catch (err) {
        console.warn('Failed to load analytics:', err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    // Delay analytics fetch slightly to prioritize deck data
    setTimeout(fetchAnalytics, 500);
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deck?.title || 'Presentation',
          text: `Check out this presentation: ${deck?.title}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // TODO: Add toast notification for successful copy
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isOwner = user && deck && user.id === deck.creator_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading presentation...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {error}
            </h2>
            <p className="text-gray-600 mb-6">
              The presentation you're looking for might have been moved or deleted.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{APP_CONFIG.NAME}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
              
              {deck.generated_content_json?.presentation_url && (
                <a
                  href={deck.generated_content_json.presentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              )}
              
              {isOwner && deck.generated_content_json?.edit_url && (
                <a
                  href={deck.generated_content_json.edit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6"
            >
              {/* Presentation Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {deck.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {deck.creator?.full_name || deck.creator?.email || 'Anonymous'}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(deck.created_at).toLocaleDateString()}
                  </div>
                  {analytics && (
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {analytics.view_count} views
                    </div>
                  )}
                </div>
              </div>

              {/* Original Prompt */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Original Prompt
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {deck.prompt_text}
                  </p>
                </div>
              </div>

              {/* Presentation Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Access Presentation
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {deck.generated_content_json?.presentation_url && (
                    <a
                      href={deck.generated_content_json.presentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      <span className="font-medium">Download Presentation</span>
                      <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                  
                  {deck.generated_content_json?.edit_url && (isOwner || !isOwner) && (
                    <a
                      href={deck.generated_content_json.edit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors group"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        {isOwner ? 'Edit Presentation' : 'View Online'}
                      </span>
                      <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </h3>
              
              {analyticsLoading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : analytics ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.view_count}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Engaged Users</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.engaged_users}</p>
                  </div>
                  
                  {analytics.last_viewed_at && (
                    <div>
                      <p className="text-sm text-gray-600">Last Viewed</p>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(analytics.last_viewed_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No analytics data available</p>
              )}
            </motion.div>

            {/* Additional Info */}
            {deck.gate_settings_json && deck.gate_settings_json.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Access Gates
                </h3>
                <div className="space-y-2">
                  {deck.gate_settings_json.map((gate, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      {gate.charAt(0).toUpperCase() + gate.slice(1)} Gate
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeckView;