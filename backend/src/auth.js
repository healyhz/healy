import { betterAuth } from 'better-auth';
import { pool } from './db.js';
import { corsOrigins } from './config.js';

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
