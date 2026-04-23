import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Lock, LoaderCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { showErrorToast, showSuccessToast } from '../utils/notificationHelpers';

const wait = (ms: number) => new Promise<void>((resolve) => {
  window.setTimeout(resolve, ms);
});

const waitForSession = async () => {
  if (!supabase) {
    return false;
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase.auth.getSession();
    if (!error && data.session) {
      return true;
    }

    await wait(250);
  }

  return false;
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [linkError, setLinkError] = useState('');

  const role = useMemo<'user' | 'admin'>(() => {
    return location.pathname.startsWith('/admin') ? 'admin' : 'user';
  }, [location.pathname]);

  const loginPath = role === 'admin' ? '/admin/login' : '/user/login';

  useEffect(() => {
    let active = true;

    const init = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (!active) {
          return;
        }

        setLinkError('Password reset is not configured.');
        setInitializing(false);
        return;
      }

      try {
        const hasCode = searchParams.has('code');
        if (hasCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const hasSession = await waitForSession();
        if (!hasSession) {
          throw new Error('This reset link is invalid or has expired. Please request a new one.');
        }
      } catch (initError) {
        if (!active) {
          return;
        }

        setLinkError(initError instanceof Error ? initError.message : 'Unable to validate reset link');
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!password) {
      setError('New password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      showSuccessToast('Password updated successfully');
      window.sessionStorage.setItem('tcy.auth.notice', 'Your password was updated. Please login with your new password.');
      navigate(loginPath, { replace: true });
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update password';
      setError(message);
      showErrorToast('Password reset failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate(loginPath)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </button>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h1>
            <p className="text-gray-600">Set a new password for your account.</p>
          </div>

          {initializing ? (
            <div className="flex items-center justify-center py-8 text-gray-600 gap-3">
              <LoaderCircle className="w-5 h-5 animate-spin" />
              Validating reset link...
            </div>
          ) : linkError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {linkError}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="New Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) {
                    setError('');
                  }
                }}
                error={error}
              />

              <Input
                label="Confirm New Password"
                type="password"
                icon={<Lock className="w-5 h-5" />}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) {
                    setError('');
                  }
                }}
              />

              <Button type="submit" variant="primary" className="w-full" loading={loading} disabled={Boolean(linkError)}>
                Update Password
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            <Link to={loginPath} className="text-[#10b981] hover:text-[#059669] font-medium">
              Return to login
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
