import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth.js';
import { corsOrigins } from './config.js';
import products from './routes/products.js';
import claimAdmin from './routes/claim-admin.js';
import adminRouter from './routes/admin.js';
import partnerRouter from './routes/partner.js';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: (origin) => (corsOrigins.includes(origin) ? origin : null),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

app.route('/api/products', products);
app.route('/api/claim-admin', claimAdmin);
app.route('/api/admin', adminRouter);
app.route('/api/partner', partnerRouter);

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
