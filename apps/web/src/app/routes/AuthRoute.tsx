import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../providers/SupabaseProvider';

const ACCESS_PARAM = 'code';
const ACCESS_PHRASE = 'grace janin';

export function AuthRoute() {
  const [codeAttempt, setCodeAttempt] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const supabase = useSupabase();

  const handleCodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError('');

    if (codeAttempt.trim().toLowerCase() === ACCESS_PHRASE) {
      // For now, just navigate to parent dashboard
      // In production, this would authenticate with Supabase
      navigate('/parent');
    } else {
      setAuthError('Hmm, that does not sound right. Try again!');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100 p-6 text-center">
      <form
        onSubmit={handleCodeSubmit}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-extrabold text-pink-500">Welcome to Advent Calendar Builder</h1>
        <p className="text-sm text-slate-500">Please enter your access code to continue.</p>
        <input
          type="text"
          value={codeAttempt}
          onChange={(event) => setCodeAttempt(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Enter access code"
          disabled={isLoading}
        />
        {authError && <p className="text-pink-600 text-sm">{authError}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white font-semibold py-3 shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Enter'}
        </button>
      </form>
    </div>
  );
}