const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'replace-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'tcy_token',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  useSupabase: String(process.env.USE_SUPABASE || 'false').toLowerCase() === 'true',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

async function connectDatabase() {
  if (env.useSupabase) {
    return null;
  }

  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri);
  return mongoose.connection;
}

function isProduction() {
  return env.nodeEnv === 'production';
}

module.exports = {
  env,
  connectDatabase,
  isProduction,
};
