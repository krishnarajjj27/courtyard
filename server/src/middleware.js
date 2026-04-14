const jwt = require('jsonwebtoken');
const { env, isProduction } = require('./config');
const { createSupabaseAdminClient } = require('./supabase');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

function asyncHandler(handler) {
  return function wrapped(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function readToken(req) {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;

  return req.cookies?.[env.jwtCookieName] || bearerToken || null;
}

async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  if (env.useSupabase) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data: authData, error: authError } = await supabase.auth.getUser(token);

      if (authError || !authData?.user) {
        return next(new ApiError(401, 'Invalid or expired session'));
      }

      const supabaseUser = authData.user;
      let role = 'user';
      let name = supabaseUser.user_metadata?.name || supabaseUser.email || 'User';
      let email = supabaseUser.email || '';
      let phone = supabaseUser.phone || supabaseUser.user_metadata?.phone || null;

      let { data: profile } = await supabase
        .from('profiles')
        .select('app_role,name,email,phone')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (!profile && supabaseUser.email) {
        const { data: insertedProfile } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            name,
            email: supabaseUser.email,
            phone,
            app_role: supabaseUser.user_metadata?.app_role === 'admin' ? 'admin' : 'user',
          })
          .select('app_role,name,email,phone')
          .single();

        profile = insertedProfile || null;
      }

      if (profile) {
        role = profile.app_role || role;
        name = profile.name || name;
        email = profile.email || email;
        phone = profile.phone || phone;
      }

      req.auth = {
        sub: supabaseUser.id,
        role,
        email,
        name,
      };

      return next();
    } catch {
      return next(new ApiError(401, 'Invalid or expired session'));
    }
  }

  try {
    req.auth = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired session'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new ApiError(403, 'Forbidden'));
    }

    return next();
  };
}

function notFound(req, res, next) {
  next(new ApiError(404, 'Route not found'));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    // Keep the runtime logs readable without leaking internals to the client.
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
    },
  });
}

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

module.exports = {
  ApiError,
  asyncHandler,
  requireAuth,
  requireRole,
  notFound,
  errorHandler,
  buildCookieOptions,
};
