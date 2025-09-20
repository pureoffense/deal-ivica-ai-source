import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const { signIn, signInWithOAuth } = useAuthStore();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' }, // Prevents undefined
  });

  const onSubmit = async (data: FormData) => {
    setAuthError(null);
    try {
      console.log('Submitting:', data); // Debug log
      const { user, error } = await signIn(data.email, data.password);
      
      if (error) {
        console.error('Login error:', error);
        setAuthError(error.message);
      } else if (user) {
        console.log('Login successful, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      console.error('Login error:', error); // Full log
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(`Login failed: ${errorMessage}`);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const { error } = await signInWithOAuth('google');
      if (error) {
        setAuthError(error.message);
      }
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setAuthError(`Google sign-in failed: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <div>
          <h2 className="text-2xl font-secondary text-primary text-center mb-2">Welcome back</h2>
          <p className="text-secondary text-center">Sign in to your Deal Ivica AI account</p>
        </div>

        {/* Error Display */}
        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{authError}</div>
          </div>
        )}

        {/* Google Button */}
        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="text-center text-gray-500 my-4">Or continue with</div>

        {/* Email - Explicit binding */}
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email', { required: true })} // Required + binding
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-gray-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password', { required: true })}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          <Link to="/reset-password" className="text-primary text-sm hover:underline block mt-1">Forgot your password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-3 rounded font-medium hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
