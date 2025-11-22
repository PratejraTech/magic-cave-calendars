import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../providers/SupabaseProvider';

type AuthMode = 'signin' | 'signup';

export function AuthRoute() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const supabase = useSupabase();

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/parent');
      }
    };
    checkUser();
  }, [supabase, navigate]);

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setAuthError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
        } else if (data.user) {
          // Check if email confirmation is required
          if (data.user.email_confirmed_at) {
        navigate('/parent-portal');
          } else {
            setAuthError('Please check your email to confirm your account');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setAuthError(error.message);
        } else if (data.user) {
            navigate('/parent-portal');
        }
      }
    } catch (error) {
      // TODO: Implement proper error logging service
      setAuthError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100 p-6 text-center">
      <form
        onSubmit={handleAuthSubmit}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-extrabold text-pink-500">Welcome to Advent Calendar Builder</h1>
        <p className="text-sm text-slate-500">
          {authMode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </p>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter your email"
          disabled={isLoading}
          required
        />

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter your password"
          disabled={isLoading}
          required
          minLength={6}
        />

        {authMode === 'signup' && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Confirm your password"
            disabled={isLoading}
            required
            minLength={6}
          />
        )}

        {authError && <p className="text-pink-600 text-sm">{authError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white font-semibold py-3 shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
        </button>

        <button
          type="button"
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
          className="w-full text-sm text-slate-500 hover:text-slate-700"
          disabled={isLoading}
        >
          {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}