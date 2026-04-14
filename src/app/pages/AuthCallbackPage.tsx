import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuthCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const roleParam = searchParams.get('role');
      const roleHint = roleParam === 'admin' ? 'admin' : 'user';

      try {
        const nextUser = await completeOAuthCallback(roleHint);
        if (!mounted) {
          return;
        }

        if (!nextUser) {
          navigate(roleHint === 'admin' ? '/admin/login' : '/user/login', { replace: true });
          return;
        }

        navigate(nextUser.role === 'admin' ? '/admin/dashboard' : '/user/home', { replace: true });
      } catch (callbackError) {
        if (!mounted) {
          return;
        }

        const message = callbackError instanceof Error ? callbackError.message : 'OAuth callback failed';
        setError(message);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [completeOAuthCallback, navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-red-600 mb-3">Authentication Failed</h1>
            <p className="text-sm text-gray-600">{error}</p>
          </>
        ) : (
          <>
            <LoaderCircle className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h1>
            <p className="text-sm text-gray-600">Please wait while we finish your authentication.</p>
          </>
        )}
      </div>
    </div>
  );
};
