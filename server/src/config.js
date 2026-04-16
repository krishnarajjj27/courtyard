const dotenv = require('dotenv');

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || 'replace-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'tcy_token',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  useSupabase: true,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

async function connectDatabase() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  return null;
}

function isProduction() {
  return env.nodeEnv === 'production';
}

module.exports = {
  env,
  connectDatabase,
  isProduction,
};
