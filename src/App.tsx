import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home'));

// Authentication routes
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const DeckCreation = lazy(() => import('@/pages/DeckCreation'));
const DeckView = lazy(() => import('@/pages/DeckView'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              {/* Public auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deck/create" 
                element={
                  <ProtectedRoute>
                    <DeckCreation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/deck/:id/view" 
                element={<DeckView />}
              />
              {/* Catch all route */}
              <Route path="*" element={
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center min-h-screen"
                >
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </motion.div>
              } />
            </Routes>
          </Suspense>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
