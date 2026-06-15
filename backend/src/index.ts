import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
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

app.get('/api/config.js', (c) => {
  const config = {
    API_URL: process.env.API_URL,
    APP_URL: process.env.APP_URL,
    LANDING_URL: process.env.LANDING_URL,
  };
  c.header('Content-Type', 'application/javascript');
  c.header('Cache-Control', 'no-store');
  return c.body(`window.ENV = ${JSON.stringify(config)};`);
});

serve(app);
