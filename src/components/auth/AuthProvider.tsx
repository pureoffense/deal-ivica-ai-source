import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { initialize, initialized, loading, cleanup } = useAuthStore();

  useEffect(() => {
    initialize();
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initialize, cleanup]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};
