import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * CalendarRedirect - Redirects legacy calendar URLs to new product URLs
 *
 * This component handles backward compatibility by redirecting
 * /calendar/{uuid} URLs to /product/{uuid} URLs.
 */
export function CalendarRedirect() {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (shareUuid) {
      // Redirect to the new product URL
      navigate(`/product/${shareUuid}`, { replace: true });
    }
  }, [shareUuid, navigate]);

  // Show a brief loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Redirecting...</p>
      </div>
    </div>
  );
}