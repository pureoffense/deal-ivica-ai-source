import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
// import { useAuthStore } from '@/stores/authStore';
import { APP_CONFIG } from '@/constants';
import { createDeck } from '@/services/deckService';

const schema = z.object({
  prompt: z.string().min(10, 'Prompt too short'),
  gates: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const DeckCreation = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating deck with data:', data);
      
      // Call the deck creation service
      const deck = await createDeck({
        prompt: data.prompt,
        gates: data.gates || []
      });
      
      console.log('Deck created successfully:', deck);
      setSuccess(true);
      
      // Redirect to deck view after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
        // TODO: Navigate to deck view page when implemented
        // navigate(`/deck/${deck.id}/view`);
      }, 2000);
      
    } catch (error) {
      console.error('Deck creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Deck Created!
            </h2>
            <p className="text-gray-600 mb-6">
              Your AI-powered presentation is ready. Redirecting to dashboard...
            </p>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-gray-900">{APP_CONFIG.NAME}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Deck
            </h1>
            <p className="text-gray-600">
              Describe your presentation idea and let AI create a stunning deck for you
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md bg-red-50 p-4 border border-red-200"
              >
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              </motion.div>
            )}

            {/* Prompt Input */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Presentation Prompt
              </label>
              <textarea
                {...register('prompt')}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your presentation topic, key points, target audience, and any specific requirements..."
              />
              {errors.prompt && (
                <p className="mt-1 text-sm text-red-600">{errors.prompt.message}</p>
              )}
            </div>

            {/* Access Gates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Gates</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="info"
                    {...register('gates')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Contact Info Gate:</strong> Collect viewer contact information
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="signature"
                    {...register('gates')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Signature Gate:</strong> Require digital signature to proceed
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="otp"
                    {...register('gates')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>OTP Gate:</strong> Send verification code via email/SMS
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    value="payment"
                    {...register('gates')}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    <strong>Payment Gate:</strong> Require payment to access content
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Deck
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default DeckCreation;