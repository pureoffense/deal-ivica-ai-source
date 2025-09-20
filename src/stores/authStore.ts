import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type User, type AuthError } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  authListener: { subscription: { unsubscribe: () => void } } | null; // Store reference to auth listener for cleanup
}

interface AuthActions {
  // Authentication methods
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithOAuth: (provider: 'google') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  
  // Session management
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Password reset
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  
  // Cleanup
  cleanup: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      loading: false,
      initialized: false,
      authListener: null,

      // Initialize auth state
      initialize: async () => {
        const currentState = useAuthStore.getState();
        
        // If already initialized, don't reinitialize
        if (currentState.initialized) {
          console.log('Auth already initialized, skipping...');
          return;
        }
        
        // Clean up existing auth listener if exists
        if (currentState.authListener) {
          currentState.authListener.subscription.unsubscribe();
        }
        
        set({ loading: true });
        
        try {
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            set({ user: null, session: null, loading: false, initialized: true, authListener: null });
            return;
          }

          // Set session and user
          const user = session?.user ? {
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata
          } : null;

          // Set up auth listener (only once)
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email || 'no user');
            
            const user = session?.user ? {
              id: session.user.id,
              email: session.user.email || '',
              user_metadata: session.user.user_metadata
            } : null;

            set({ session, user });
          });

          set({ 
            session, 
            user, 
            loading: false, 
            initialized: true,
            authListener 
          });
          
          console.log('Auth initialized successfully', user ? `for ${user.email}` : 'no user');
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ user: null, session: null, loading: false, initialized: true, authListener: null });
        }
      },

      // Sign up new user
      signUp: async (email: string, password: string, metadata?: { full_name?: string }) => {
        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: metadata || {}
            }
          });

          set({ loading: false });

          if (error) {
            return { user: null, error: { message: error.message, status: error.status } as AuthError };
          }

          const user = data.user ? {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata
          } : null;

          return { user, error: null };
        } catch (error) {
          set({ loading: false });
          return { 
            user: null, 
            error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
          };
        }
      },

      // Sign in existing user
      signIn: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          set({ loading: false });

          if (error) {
            return { user: null, error: { message: error.message, status: error.status } as AuthError };
          }

          const user = data.user ? {
            id: data.user.id,
            email: data.user.email || '',
            user_metadata: data.user.user_metadata
          } : null;

          return { user, error: null };
        } catch (error) {
          set({ loading: false });
          return { 
            user: null, 
            error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
          };
        }
      },

      // Sign in with OAuth
      signInWithOAuth: async (provider: 'google') => {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin }
          });
          if (error) {
            return { error: { message: error.message, status: error.status } as AuthError };
          }
          return { error: null };
        } catch (error) {
          return { 
            error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
          };
        }
      },

      // Sign out user
      signOut: async () => {
        set({ loading: true });
        
        try {
          const { error } = await supabase.auth.signOut();
          
          set({ 
            user: null, 
            session: null, 
            loading: false 
          });

          if (error) {
            return { error: { message: error.message, status: error.status } as AuthError };
          }

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { 
            error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
          };
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
          });

          if (error) {
            return { error: { message: error.message, status: error.status } as AuthError };
          }

          return { error: null };
        } catch (error) {
          return { 
            error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
          };
        }
      },

      // Update password
      updatePassword: async (password: string) => {
        set({ loading: true });
        
        try {
          const { error } = await supabase.auth.updateUser({ password });

          set({ loading: false });

          if (error) {
            return { error: { message: error.message, status: error.status } as AuthError };
          }

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { 
            error: { message: error instanceof Error ? error.message : 'An unexpected error occurred' } 
          };
        }
      },

      // Cleanup auth listener
      cleanup: () => {
        const currentState = useAuthStore.getState();
        if (currentState.authListener) {
          currentState.authListener.subscription.unsubscribe();
          set({ authListener: null });
          console.log('Auth listener cleaned up');
        }
      },

      // State setters
      setSession: (session: Session | null) => set({ session }),
      setUser: (user: User | null) => set({ user }),
      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
);