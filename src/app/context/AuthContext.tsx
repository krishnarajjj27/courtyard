import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, isSupabaseConfigured, requiresEmailVerification } from '../lib/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<'signed-in' | 'verification-required'>;
  resendVerificationEmail: (email: string) => Promise<void>;
  requestPasswordReset: (email: string, role: 'user' | 'admin') => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  loginWithGoogle: (role: 'user' | 'admin') => Promise<void>;
  completeOAuthCallback: (roleHint?: 'user' | 'admin') => Promise<{ user: User; verificationRequired: boolean } | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'tcy.auth.user.v1';

const EMAIL_NOT_CONFIRMED_PATTERN = /email not confirmed|confirm your email/i;
const AUTH_REQUEST_TIMEOUT_MS = 12000;
const PROFILE_LOOKUP_TIMEOUT_MS = 3000;

const buildOAuthRedirectUrl = (role: 'user' | 'admin') => {
  const configuredRedirectBase =
    (import.meta.env.VITE_OAUTH_REDIRECT_BASE_URL as string | undefined)
    || (import.meta.env.VITE_SITE_URL as string | undefined)
    || window.location.origin;

  const normalizedBase = configuredRedirectBase.trim().replace(/\/$/, '');
  return `${normalizedBase}/auth/callback?role=${role}`;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!user) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const buildUserFromSupabase = async (
    supabaseUser: { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> },
    roleHint?: 'user' | 'admin',
    options?: { skipProfileLookup?: boolean }
  ): Promise<User | null> => {
    if (!supabaseUser.email) {
      return null;
    }

    let profile: { name?: string; email?: string; phone?: string; app_role?: string } | null = null;

    if (!options?.skipProfileLookup) {
      try {
        const { data, error } = await withTimeout(
          supabase
            .from('profiles')
            .select('name,email,phone,app_role')
            .eq('id', supabaseUser.id)
            .maybeSingle(),
          PROFILE_LOOKUP_TIMEOUT_MS,
          'Loading profile timed out'
        );

        if (!error) {
          profile = data;
        }
      } catch {
        // Use auth metadata fallback if profile fetch is slow or unavailable.
        profile = null;
      }
    }

    const derivedRole = (profile?.app_role as 'user' | 'admin' | undefined)
      || (supabaseUser.user_metadata?.app_role as 'user' | 'admin' | undefined)
      || roleHint
      || 'user';

    return {
      id: supabaseUser.id,
      name: profile?.name || (supabaseUser.user_metadata?.name as string | undefined) || supabaseUser.email,
      email: profile?.email || supabaseUser.email,
      phone: profile?.phone || supabaseUser.phone || (supabaseUser.user_metadata?.phone as string | undefined) || undefined,
      role: derivedRole,
    };
  };

  const getUserFromSupabase = async (roleHint?: 'user' | 'admin'): Promise<User | null> => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      throw error;
    }

    return buildUserFromSupabase(data.user, roleHint, { skipProfileLookup: true });
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    let active = true;

    const hydrateFromSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      const sessionUser = data.session?.user;
      if (!sessionUser) {
        return;
      }

      const nextUser = await buildUserFromSupabase(sessionUser, undefined, { skipProfileLookup: true });
      if (active && nextUser) {
        setUser(nextUser);
      }

      void buildUserFromSupabase(sessionUser).then((enrichedUser) => {
        if (active && enrichedUser) {
          setUser(enrichedUser);
        }
      });
    };

    void hydrateFromSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) {
        return;
      }

      if (!session?.user) {
        setUser(null);
        return;
      }

      const nextUser = await buildUserFromSupabase(session.user, undefined, { skipProfileLookup: true });
      if (active && nextUser) {
        setUser(nextUser);
      }

      void buildUserFromSupabase(session.user).then((enrichedUser) => {
        if (active && enrichedUser) {
          setUser(enrichedUser);
        }
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: 'user' | 'admin') => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase auth is not configured');
    }

    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
      AUTH_REQUEST_TIMEOUT_MS,
      'Login timed out. Please try again.'
    );

    if (error) {
      if (EMAIL_NOT_CONFIRMED_PATTERN.test(error.message || '')) {
        if (requiresEmailVerification) {
          throw new Error('Email not confirmed. Please verify your email, or use "Resend verification email" below.');
        }

        throw new Error('Unable to sign in. Please contact support if this continues.');
      }

      throw error;
    }

    const nextUser = data.user
      ? await buildUserFromSupabase(data.user, role === 'admin' ? undefined : role, { skipProfileLookup: true })
      : await getUserFromSupabase(role);
    if (!nextUser) {
      throw new Error('Unable to load user profile');
    }

    if (role === 'admin' && nextUser.role !== 'admin') {
      const verifiedAdminUser = data.user ? await buildUserFromSupabase(data.user) : null;
      if (!verifiedAdminUser || verifiedAdminUser.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Admin access required for this portal');
      }

      setUser(verifiedAdminUser);
      return;
    }

    setUser(nextUser);

    if (data.user) {
      void buildUserFromSupabase(data.user, role).then((enrichedUser) => {
        if (enrichedUser) {
          setUser(enrichedUser);
        }
      });
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<'signed-in' | 'verification-required'> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase auth is not configured');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingLogin, error: existingLoginError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!existingLoginError && existingLogin.user) {
      const existingUser = await buildUserFromSupabase(existingLogin.user, 'user');
      if (!existingUser) {
        throw new Error('Unable to load user profile');
      }

      setUser(existingUser);
      return 'signed-in';
    }

    if (requiresEmailVerification && existingLoginError && /email not confirmed|confirm your email/i.test(existingLoginError.message || '')) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=user`,
        },
      });

      if (resendError) {
        throw resendError;
      }

      return 'verification-required';
    }

    if (existingLoginError && existingLoginError.message && !/invalid login credentials|invalid credentials/i.test(existingLoginError.message)) {
      throw existingLoginError;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?role=user`,
        data: {
          name,
          phone,
          app_role: 'user',
        },
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    if (!data.session?.user && requiresEmailVerification) {
      return 'verification-required';
    }

    if (!data.session?.user) {
      throw new Error('Account created, but sign in did not complete. Please try logging in.');
    }

    const nextUser = data.user ? await buildUserFromSupabase(data.user, 'user') : await getUserFromSupabase('user');
    if (!nextUser) {
      throw new Error('Unable to load user profile');
    }

    setUser(nextUser);
    return 'signed-in';
  };

  const resendVerificationEmail = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase auth is not configured');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?role=user`,
      },
    });

    if (error) {
      throw error;
    }
  };

  const requestPasswordReset = async (email: string, role: 'user' | 'admin') => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase auth is not configured');
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error('Email is required');
    }

    const redirectPath = role === 'admin' ? '/admin/reset-password' : '/user/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}${redirectPath}`,
    });

    if (error) {
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase auth is not configured');
    }

    const password = newPassword.trim();
    if (!password) {
      throw new Error('Password is required');
    }

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw error;
    }

    if (data.user) {
      const nextUser = await buildUserFromSupabase(data.user, undefined, { skipProfileLookup: true });
      if (nextUser) {
        setUser(nextUser);
      }
    }
  };

  const loginWithGoogle = async (role: 'user' | 'admin') => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback to mock login if Supabase env is not configured.
      await new Promise(resolve => setTimeout(resolve, 500));

      setUser({
        id: '1',
        name: role === 'admin' ? 'Admin User' : 'Google User',
        email: 'user@gmail.com',
        role,
      });
      return;
    }

    const redirectTo = buildOAuthRedirectUrl(role);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      if (/redirect|redirect_to|invalid redirect|not allowed/i.test(error.message || '')) {
        throw new Error('Google sign-in redirect URL is not allowed. Add this URL in Supabase Auth > URL Configuration: ' + redirectTo);
      }
      throw error;
    }
  };

  const completeOAuthCallback = async (roleHint?: 'user' | 'admin') => {
    if (!isSupabaseConfigured || !supabase) {
      return null;
    }

    const callbackUrl = new URL(window.location.href);
    const hasAuthCode = callbackUrl.searchParams.has('code');
    let sessionUser: { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> } | null = null;

    // OAuth can return either auth code (PKCE) or tokens in URL hash (implicit).
    // Only call exchangeCodeForSession when code is actually present.
    if (hasAuthCode) {
      const { data: exchangeData, error: exchangeError } = await withTimeout(
        supabase.auth.exchangeCodeForSession(window.location.href),
        AUTH_REQUEST_TIMEOUT_MS,
        'Google sign-in timed out. Please try again.'
      );
      if (exchangeError) {
        throw exchangeError;
      }

      sessionUser = exchangeData.session?.user ?? null;
    }

    if (!sessionUser) {
      const { data: sessionData, error: sessionError } = await withTimeout(
        supabase.auth.getSession(),
        AUTH_REQUEST_TIMEOUT_MS,
        'Google sign-in timed out. Please try again.'
      );
      if (sessionError) {
        throw sessionError;
      }

      sessionUser = sessionData.session?.user ?? null;
    }

    const nextUser = sessionUser
      ? await buildUserFromSupabase(sessionUser, roleHint, { skipProfileLookup: true })
      : await getUserFromSupabase(roleHint);
    if (!nextUser) {
      return null;
    }

    if (roleHint === 'admin' && nextUser.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Admin access required for this portal');
    }

    // Check if email verification is required for OAuth users
    let verificationRequired = false;
    if (requiresEmailVerification && sessionUser?.email && !sessionUser.email_confirmed_at) {
      // Send verification email to the OAuth user
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: sessionUser.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${roleHint || 'user'}`,
        },
      });

      if (!resendError) {
        verificationRequired = true;
      }
    }

    // Only set user if verification is not required, or if already verified
    if (!verificationRequired) {
      setUser(nextUser);

      // Background: enrich user with full profile data
      if (sessionUser) {
        void buildUserFromSupabase(sessionUser, roleHint).then((enrichedUser) => {
          if (enrichedUser) {
            setUser(enrichedUser);
          }
        });
      } else {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          void buildUserFromSupabase(data.user, roleHint).then((enrichedUser) => {
            if (enrichedUser) {
              setUser(enrichedUser);
            }
          });
        }
      }
    }

    return { user: nextUser, verificationRequired };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      void supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        resendVerificationEmail,
        requestPasswordReset,
        updatePassword,
        loginWithGoogle,
        completeOAuthCallback,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
