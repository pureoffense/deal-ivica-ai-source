import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Settings, 
  LogOut, 
  Sparkles,
  BarChart3,
  Users,
  Clock,
  Download,
  Edit,
  Calendar,
  Search,
  SortAsc
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/constants';
import { getUserDecks, getUserDeckStats } from '@/services/deckService';
import { getAllTemplates } from '@/services/presentonService';

// Type for deck data
interface Deck {
  id: string;
  title: string;
  prompt_text: string;
  created_at: string;
  updated_at: string;
  unique_url: string;
  generated_content_json: {
    presentation_id?: string;
    presentation_url?: string;
    edit_url?: string;
    raw_response?: any;
  };
  gate_settings_json: string[];
}

// Type for stats
interface DeckStats {
  totalPresentations: number;
  activeViews: number;
  totalViews?: number; // Optional for backward compatibility
  engagedUsers: number;
  hoursSaved: number;
}

// Type for templates
interface Template {
  id: string;
  name: string;
  displayName: string;
  description: string;
  preview?: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [stats, setStats] = useState<DeckStats>({
    totalPresentations: 0,
    activeViews: 0,
    totalViews: 0,
    engagedUsers: 0,
    hoursSaved: 0
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'title-desc'>('date-desc');

  // Fetch user decks and stats
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching decks for user:', user.id);
        
        // Fetch decks and stats in parallel
        const [userDecks, userStats] = await Promise.all([
          getUserDecks(user.id),
          getUserDeckStats(user.id)
        ]);
        
        setDecks(userDecks);
        
        // Ensure stats totalPresentations matches actual deck count
        const correctedStats = {
          ...userStats,
          totalPresentations: userDecks.length // Use actual deck count
        };
        setStats(correctedStats);
        
        console.log('Loaded decks:', userDecks.length);
        console.log('Stats (corrected):', correctedStats);
        console.log('Original stats from API:', userStats);
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        console.log('Fetching templates...');
        const availableTemplates = await getAllTemplates();
        setTemplates(availableTemplates);
        console.log('Loaded templates:', availableTemplates.length);
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Templates are not critical, so don't show error to user
        // Just use fallback templates
        setTemplates([
          {
            id: 'general',
            name: 'general',
            displayName: 'General',
            description: 'Versatile template suitable for any presentation type'
          }
        ]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleGenerateWithTemplate = (templateName: string) => {
    // Navigate to deck creation with selected template
    navigate(`/deck/create?template=${templateName}`);
  };

  // Filter and sort presentations
  const filteredAndSortedDecks = decks
    .filter(deck => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        deck.title.toLowerCase().includes(query) ||
        deck.prompt_text.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/', { replace: true });
    }
  };

  const statsCards = [
    {
      name: 'Total Presentations',
      value: loading ? '-' : stats.totalPresentations.toString(),
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'Total Views',
      value: loading ? '-' : (stats.totalViews || stats.activeViews).toString(),
      icon: BarChart3,
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'Engaged Users',
      value: loading ? '-' : stats.engagedUsers.toString(),
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'Hours Saved',
      value: loading ? '-' : stats.hoursSaved.toString(),
      icon: Clock,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {APP_CONFIG.NAME}
                </h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            Ready to create your next amazing presentation?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/deck/create"
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group block"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create New Presentation
              </h3>
              <p className="text-sm text-gray-600">
                Start from scratch with AI assistance
              </p>
            </Link>

            <button 
              onClick={() => document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Browse Templates
              </h3>
              <p className="text-sm text-gray-600">
                Choose from {templates.length} professional templates
              </p>
            </button>

            <button className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                View Analytics
              </h3>
              <p className="text-sm text-gray-600">
                Track presentation performance
              </p>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Stats</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Browse Templates Section */}
        <motion.div
          id="templates-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Browse Templates</h3>
            <span className="text-sm text-gray-500">{templates.length} available</span>
          </div>

          {/* Templates Loading */}
          {templatesLoading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading templates...</p>
              </div>
            </div>
          )}

          {/* Templates Grid */}
          {!templatesLoading && templates.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => handleGenerateWithTemplate(template.name)}
                >
                  <div className="flex flex-col h-full">
                    {/* Preview Image */}
                    {template.preview && (
                      <div className="w-full h-20 bg-gray-50 flex items-center justify-center overflow-hidden">
                        <img 
                          src={template.preview} 
                          alt={`${template.displayName} template preview`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            // Hide image on error
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-4 flex-1">
                      <div className="flex-1 mb-3">
                        <h4 className="text-md font-semibold text-gray-900 mb-2">
                          {template.displayName}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      <button className="text-xs bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition-colors group-hover:bg-primary group-hover:text-white w-full">
                        Use Template
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>


        {/* Your Presentations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Presentations</h3>
            {decks.length > 0 && (
              <Link to="/deck/create" className="text-primary hover:text-indigo-700 text-sm font-medium">
                Create New
              </Link>
            )}
          </div>

          {/* Search and Sort Controls */}
          {!loading && !error && decks.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search presentations by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Sort */}
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary appearance-none bg-white min-w-[200px]"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {!loading && !error && decks.length > 0 && (
            <div className="text-sm text-gray-600 mb-4">
              {searchQuery ? (
                <span>
                  Showing {filteredAndSortedDecks.length} of {decks.length} presentations
                  {filteredAndSortedDecks.length === 0 && ' - try a different search'}
                </span>
              ) : (
                <span>Showing all {decks.length} presentations</span>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-red-800 underline text-xs mt-1"
              >
                Try again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your presentations...</p>
              </div>
            </div>
          )}

          {/* No Decks State */}
          {!loading && !error && decks.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center py-12">
                <LayoutDashboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No presentations yet
                </h4>
                <p className="text-gray-600 mb-6">
                  Create your first presentation to get started!
                </p>
                <Link to="/deck/create" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Presentation
                </Link>
              </div>
            </div>
          )}

          {/* Empty Search Results */}
          {!loading && !error && decks.length > 0 && filteredAndSortedDecks.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No presentations match your search
                </h4>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or create a new presentation.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Clear Search
                  </button>
                  <Link to="/deck/create" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Decks Grid */}
          {!loading && !error && filteredAndSortedDecks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedDecks.map((deck) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {deck.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {deck.prompt_text}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(deck.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/deck/${deck.id}/view`}
                      className="flex items-center px-3 py-2 text-xs bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      View
                    </Link>
                    {deck.generated_content_json?.presentation_url && (
                      <a
                        href={deck.generated_content_json.presentation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </a>
                    )}
                    {deck.generated_content_json?.edit_url && (
                      <a
                        href={deck.generated_content_json.edit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit Online
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
