import { betterAuth } from 'better-auth';
import { Pool } from 'pg';
import { corsOrigins } from './config';

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.API_URL,
  secret: process.env.AUTH_SECRET,
  trustedOrigins: corsOrigins,
  emailAndPassword: { enabled: true },
  advanced: {
    crossSubDomainCookies: {
      enabled: !!process.env.COOKIE_DOMAIN,
      domain: process.env.COOKIE_DOMAIN || undefined,
    },
  },
});
