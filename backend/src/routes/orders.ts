import { Hono } from 'hono';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db.js';
import { order } from '../schemas/order-schema.js';
import { productSchema } from '../schemas/product-schema.js';
import { partner } from '../schemas/partner-schema.js';

const ordersRouter = new Hono();

ordersRouter.post('/', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const rawItems: { slug: string; qty: number }[] = body.items;
  const ref: string | undefined = body.ref;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return c.json({ error: 'Items are required' }, 400);
  }

  const slugs = rawItems.map((i) => i.slug);
  const products = await db
    .select()
    .from(productSchema)
    .where(inArray(productSchema.slug, slugs));

  if (products.length === 0) return c.json({ error: 'No valid products found' }, 400);

  const productMap = Object.fromEntries(products.map((p) => [p.slug, p]));

  const items = rawItems
    .filter((i) => productMap[i.slug] && i.qty > 0)
    .map((i) => ({
      slug: i.slug,
      name: productMap[i.slug].name,
      price: productMap[i.slug].price,
      qty: i.qty,
    }));

  if (items.length === 0) return c.json({ error: 'No valid items' }, 400);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let partnerId: string | null = null;
  if (ref) {
    const [partnerRow] = await db
      .select({ id: partner.id })
      .from(partner)
      .where(and(eq(partner.referral_code, ref), isNull(partner.deleted_at)));
    if (partnerRow) partnerId = partnerRow.id;
  }

  const [row] = await db
    .insert(order)
    .values({
      user_id: session.user.id,
      partner_id: partnerId ?? undefined,
      items,
      total,
    })
    .returning();

  return c.json(row, 201);
});

ordersRouter.get('/', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

  const rows = await db
    .select()
    .from(order)
    .where(eq(order.user_id, session.user.id))
    .orderBy(order.created_at);

  return c.json(rows);
});

export default ordersRouter;
