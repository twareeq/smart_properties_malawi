import 'dotenv/config';

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL as string,
  supabaseUrl: process.env.SUPABASE_URL as string,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY as string,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET as string,
  paychanguSecretKey: process.env.PAYCHANGU_SECRET_KEY as string,
  paychanguPublicKey: process.env.PAYCHANGU_PUBLIC_KEY as string,
  paychanguWebhookSecret: process.env.PAYCHANGU_WEBHOOK_SECRET as string,
  jwtSecret: process.env.JWT_SECRET as string || 'default-secret-do-not-use-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,
};

if (!config.databaseUrl) {
  console.warn('WARNING: DATABASE_URL is not set!');
}
