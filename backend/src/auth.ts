import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { corsOrigins } from './config.js';
import { admin } from 'better-auth/plugins';
import { db } from './db.js';
import * as schema from './schemas/auth-schema.js';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  baseURL: process.env.API_URL,
  secret: process.env.AUTH_SECRET,
  trustedOrigins: corsOrigins,
  emailAndPassword: { enabled: true },
  plugins: [admin()],
  advanced: {
    crossSubDomainCookies: {
      enabled: Boolean(process.env.COOKIE_DOMAIN),
      ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
    },
  },
});
