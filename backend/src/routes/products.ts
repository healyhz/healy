import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { eq } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db.js';
import { productSchema } from '../schemas/product-schema.js';

const adminOnly = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user || session.user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  await next();
});

const products = new Hono();

products.use('*', adminOnly);

products.get('/', async (c) => {
  const items = await db.select().from(productSchema).orderBy(productSchema.created_at);
  return c.json(items);
});

products.post('/', async (c) => {
  const { name, slug, description, price } = await c.req.json();
  const [product] = await db
    .insert(productSchema)
    .values({
      id: crypto.randomUUID(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      price: Number(price),
    })
    .returning();
  return c.json(product, 201);
});

products.get('/:id', async (c) => {
  const [product] = await db
    .select()
    .from(productSchema)
    .where(eq(productSchema.id, c.req.param('id')));
  if (!product) return c.json({ error: 'Not found' }, 404);
  return c.json(product);
});

products.put('/:id', async (c) => {
  const { name, slug, description, price } = await c.req.json();
  const [product] = await db
    .update(productSchema)
    .set({ name, slug, description, price: Number(price), updated_at: new Date() })
    .where(eq(productSchema.id, c.req.param('id')))
    .returning();
  if (!product) return c.json({ error: 'Not found' }, 404);
  return c.json(product);
});

products.delete('/:id', async (c) => {
  const [product] = await db
    .delete(productSchema)
    .where(eq(productSchema.id, c.req.param('id')))
    .returning();
  if (!product) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export default products;
