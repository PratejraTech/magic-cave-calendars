import Joi from 'joi';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variable schema validation
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  SUPABASE_URL: Joi.string().uri().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: Joi.string().min(1).default('placeholder-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().min(1).optional(),
  INTELLIGENCE_SERVICE_URL: Joi.string().uri().default('http://localhost:8000'),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:3000'),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  JWT_SECRET: Joi.string().min(32).optional(), // For custom JWT if needed
});

// Parse and validate environment variables
const envResult = envSchema.validate(process.env, { allowUnknown: true });

if (envResult.error) {
  console.error('❌ Invalid environment configuration:');
  envResult.error.details.forEach((error: any) => {
    console.error(`  - ${error.path.join('.')}: ${error.message}`);
  });
  process.exit(1);
}

const env = envResult.value;

// Configuration object
export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  intelligence: {
    serviceUrl: env.INTELLIGENCE_SERVICE_URL,
  },
  corsOrigins: env.CORS_ORIGINS.split(',').map(origin => origin.trim()),
  logLevel: env.LOG_LEVEL,
  jwtSecret: env.JWT_SECRET,
} as const;

// Log configuration on startup (without sensitive data)
console.log('✅ Configuration loaded:', {
  nodeEnv: config.nodeEnv,
  port: config.port,
  supabaseUrl: config.supabase.url,
  intelligenceUrl: config.intelligence.serviceUrl,
  corsOrigins: config.corsOrigins,
});