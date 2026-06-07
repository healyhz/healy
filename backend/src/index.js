import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getMigrations } from 'better-auth/db/migration';
import { auth } from './auth.js';
import { corsOrigins } from './config.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => (corsOrigins.includes(origin) ? origin : null),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.get('/api', (c) => c.json({ ok: true }));

const { runMigrations } = await getMigrations(auth.options);
await runMigrations();

serve(app);
