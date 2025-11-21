import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../providers/SupabaseProvider';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const supabase = useSupabase();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const authenticated = !!user;

        setIsAuthenticated(authenticated);

        if (requireAuth && !authenticated) {
          navigate('/auth', { replace: true });
        } else if (!requireAuth && authenticated) {
          navigate('/parent-portal', { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          navigate('/auth', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authenticated = !!session?.user;
      setIsAuthenticated(authenticated);

      if (requireAuth && !authenticated) {
        navigate('/auth', { replace: true });
      } else if (!requireAuth && authenticated) {
        navigate('/parent-portal', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, navigate, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect
  }

  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}