/**
 * Velnox Customer Intelligence Service
 *
 * Core principle: Velnox must progressively understand customers.
 * This service handles:
 * - Event ingestion (browser → backend → Neon)
 * - Customer profile derivation (from events + orders)
 * - Customer segmentation (derived from data)
 * - Customer insights (for recommendations, VelRepeat)
 *
 * Architecture:
 *   Browser → Event Collector → This Service → Neon (durable)
 *                                   ↓
 *                             Customer Profile
 *                                   ↓
 *                             Segmentation
 *                                   ↓
 *                             Insights / Recommendations
 *
 * Privacy: Never collect passwords, payment credentials, or secrets.
 * Minimize metadata. Only collect what's needed for product experience.
 */
import type { Db } from "./db";

// ─── Event Types ────────────────────────────────────────────────────────────

export type EventType =
  | "PRODUCT_VIEWED"
  | "PRODUCT_SEARCHED"
  | "CATEGORY_VIEWED"
  | "STORE_VIEWED"
  | "PRODUCT_ADDED_TO_CART"
  | "PRODUCT_REMOVED_FROM_CART"
  | "WISHLIST_ADDED"
  | "WISHLIST_REMOVED"
  | "CHECKOUT_STARTED"
  | "ORDER_CREATED"
  | "ORDER_COMPLETED"
  | "ORDER_CANCELLED"
  | "ORDER_REFUNDED"
  | "REPEAT_PURCHASE"
  | "LANGUAGE_CHANGED"
  | "CURRENCY_CHANGED";

export type EventPriority = "CRITICAL" | "IMPORTANT" | "ANALYTICS";

/** Classify event priority for processing strategy. */
export function getEventPriority(type: EventType): EventPriority {
  switch (type) {
    case "ORDER_COMPLETED":
    case "ORDER_REFUNDED":
      return "CRITICAL";
    case "ORDER_CREATED":
    case "ORDER_CANCELLED":
    case "PRODUCT_ADDED_TO_CART":
    case "PRODUCT_REMOVED_FROM_CART":
    case "WISHLIST_ADDED":
    case "WISHLIST_REMOVED":
    case "REPEAT_PURCHASE":
      return "IMPORTANT";
    default:
      return "ANALYTICS";
  }
}

// ─── Event Ingestion ────────────────────────────────────────────────────────

export interface CustomerEventInput {
  /** Client-generated event ID for idempotency. */
  eventId: string;
  /** Authenticated user ID (null for anonymous). */
  userId?: string | null;
  /** Anonymous session ID (null for authenticated). */
  anonymousId?: string | null;
  /** Session ID for grouping events. */
  sessionId?: string | null;
  /** Event type from the vocabulary. */
  type: EventType;
  /** Neon entity ID (product, shop, category) when applicable. */
  entityType?: string | null;
  entityId?: string | null;
  /** Search query, category label, short value. */
  value?: string | null;
  /** Structured metadata — minimal, no secrets. */
  metadata?: Record<string, unknown> | null;
  /** When the event occurred (epoch ms). */
  occurredAt: number;
}

export interface EventIngestionResult {
  success: boolean;
  eventId: string;
  duplicate: boolean;
  error?: string;
}

/**
 * Ingest a single customer event into Neon (durable).
 * Uses idempotent insert — duplicate eventId is safely ignored.
 */
export async function ingestEvent(
  db: Db,
  event: CustomerEventInput,
): Promise<EventIngestionResult> {
  const traceId = `EVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    // Validate event
    if (!event.eventId || !event.type) {
      return { success: false, eventId: event.eventId || "unknown", duplicate: false, error: "Missing eventId or type" };
    }

    // Sanitize metadata — never store secrets
    const safeMetadata = event.metadata ? sanitizeMetadata(event.metadata) : null;

    const rows = await db(
      `INSERT INTO behavioral_events
         (source, source_event_id, user_id, anonymous_id, session_id, event_type, entity_id, value, context, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (source, source_event_id) DO NOTHING
       RETURNING id`,
      [
        "velnox_api",
        event.eventId,
        event.userId ?? null,
        event.anonymousId ?? null,
        event.sessionId ?? null,
        event.type,
        event.entityId ?? null,
        event.value ?? null,
        safeMetadata ? JSON.stringify(safeMetadata) : null,
        new Date(event.occurredAt).toISOString(),
      ],
    );

    const duplicate = rows.length === 0;
    console.log(`[CUSTOMER_EVENT] [${traceId}] type=${event.type} userId=${event.userId || "anon"} duplicate=${duplicate}`);

    return { success: true, eventId: event.eventId, duplicate };
  } catch (err) {
    console.error(`[CUSTOMER_EVENT] [${traceId}] ERROR:`, err);
    return { success: false, eventId: event.eventId, duplicate: false, error: String(err) };
  }
}

/**
 * Ingest a batch of events idempotently.
 * Safe to retry — duplicates are dropped by the unique constraint.
 */
export async function ingestEventBatch(
  db: Db,
  events: CustomerEventInput[],
): Promise<{ inserted: number; duplicates: number }> {
  if (events.length === 0) return { inserted: 0, duplicates: 0 };

  let inserted = 0;
  for (const event of events) {
    const result = await ingestEvent(db, event);
    if (result.success && !result.duplicate) inserted++;
  }

  return { inserted, duplicates: events.length - inserted };
}

// ─── Metadata Sanitization ──────────────────────────────────────────────────

const BLOCKED_KEYS = new Set([
  "password", "token", "secret", "api_key", "apiKey",
  "creditCard", "cvv", "ssn", "authorization",
]);

function sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (BLOCKED_KEYS.has(key.toLowerCase())) continue;
    if (typeof value === "string" && value.length > 500) {
      clean[key] = value.slice(0, 500);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// ─── Customer Profile ───────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  preferredLanguage: string;
  preferredCurrency: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstPurchaseAt: Date | null;
  lastPurchaseAt: Date | null;
  favoriteCategories: string[];
  favoriteShops: string[];
  estimatedReplenishmentDays: number | null;
  repeatPurchaseCount: number;
  customerSegment: string;
  totalProductViews: number;
  totalSearches: number;
  totalCartAdds: number;
  lastEventAt: Date | null;
}

/**
 * Get or create a customer profile.
 * Profile is derived from events and orders — never manually edited.
 */
export async function getOrCreateProfile(
  db: Db,
  userId: string,
): Promise<CustomerProfile> {
  const rows = await db(
    "SELECT * FROM customer_profiles WHERE id = $1",
    [userId],
  );

  if (rows[0]) {
    return mapProfileRow(rows[0]);
  }

  // Create empty profile — will be populated by rebuildProfile
  const created = await db(
    `INSERT INTO customer_profiles (id) VALUES ($1) RETURNING *`,
    [userId],
  );

  return mapProfileRow(created[0]);
}

/**
 * Rebuild a customer profile from durable events + orders.
 * This is the core intelligence function — derives insights from raw data.
 */
export async function rebuildProfile(
  db: Db,
  userId: string,
): Promise<CustomerProfile> {
  // 1. Get order statistics
  const orderStats = await db(
    `SELECT
       COUNT(*)::int AS total_orders,
       COALESCE(SUM(total), 0) AS total_spent,
       COALESCE(AVG(total), 0) AS average_order_value,
       MIN(created_at) AS first_purchase_at,
       MAX(created_at) AS last_purchase_at
     FROM orders
     WHERE customer_user_id = $1 AND status IN ('completed', 'delivered')`,
    [userId],
  );

  // 2. Get event statistics
  const eventStats = await db(
    `SELECT
       event_type,
       COUNT(*)::int AS count
     FROM behavioral_events
     WHERE user_id = $1
     GROUP BY event_type`,
    [userId],
  );

  const eventCounts: Record<string, number> = {};
  for (const row of eventStats) {
    eventCounts[row.event_type] = row.count;
  }

  // 3. Get favorite categories (from product views + purchases)
  const favoriteCategories = await db(
    `SELECT
       p.category,
       COUNT(*)::int AS view_count
     FROM behavioral_events be
     JOIN products p ON p.id = be.entity_id
     WHERE be.user_id = $1
       AND be.event_type IN ('PRODUCT_VIEWED', 'ORDER_COMPLETED')
       AND be.entity_id IS NOT NULL
     GROUP BY p.category
     ORDER BY view_count DESC
     LIMIT 5`,
    [userId],
  );

  // 4. Get favorite shops (from store views + purchases)
  const favoriteShops = await db(
    `SELECT
       s.name AS shop_name,
       COUNT(*)::int AS view_count
     FROM behavioral_events be
     JOIN products p ON p.id = be.entity_id
     JOIN shops s ON s.id = p.shop_id
     WHERE be.user_id = $1
       AND be.event_type IN ('STORE_VIEWED', 'ORDER_COMPLETED')
     GROUP BY s.name
     ORDER BY view_count DESC
     LIMIT 5`,
    [userId],
  );

  // 5. Calculate repeat purchase patterns
  const repeatStats = await db(
    `SELECT
       COUNT(DISTINCT product_id)::int AS unique_products,
       COUNT(*)::int AS total_purchases
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.customer_user_id = $1
       AND o.status IN ('completed', 'delivered')`,
    [userId],
  );

  // 6. Determine segment
  const totalOrders = orderStats[0]?.total_orders || 0;
  const totalSpent = Number(orderStats[0]?.total_spent || 0);
  const segment = determineSegment(totalOrders, totalSpent, eventCounts);

  // 7. Update profile
  const profile = {
    total_orders: totalOrders,
    total_spent: totalSpent,
    average_order_value: Number(orderStats[0]?.average_order_value || 0),
    first_purchase_at: orderStats[0]?.first_purchase_at || null,
    last_purchase_at: orderStats[0]?.last_purchase_at || null,
    favorite_categories: JSON.stringify(favoriteCategories.map((r: { category: string }) => r.category)),
    favorite_shops: JSON.stringify(favoriteShops.map((r: { shop_name: string }) => r.shop_name)),
    repeat_purchase_count: repeatStats[0]?.total_purchases || 0,
    customer_segment: segment,
    total_product_views: eventCounts["PRODUCT_VIEWED"] || 0,
    total_searches: eventCounts["PRODUCT_SEARCHED"] || 0,
    total_cart_adds: eventCounts["PRODUCT_ADDED_TO_CART"] || 0,
    last_event_at: new Date(),
    last_rebuilt_at: new Date(),
  };

  await db(
    `UPDATE customer_profiles SET
       total_orders = $2, total_spent = $3, average_order_value = $4,
       first_purchase_at = $5, last_purchase_at = $6,
       favorite_categories = $7, favorite_shops = $8,
       repeat_purchase_count = $9, customer_segment = $10,
       total_product_views = $11, total_searches = $12, total_cart_adds = $13,
       last_event_at = $14, last_rebuilt_at = $15
     WHERE id = $1`,
    [
      userId,
      profile.total_orders,
      profile.total_spent,
      profile.average_order_value,
      profile.first_purchase_at,
      profile.last_purchase_at,
      profile.favorite_categories,
      profile.favorite_shops,
      profile.repeat_purchase_count,
      profile.customer_segment,
      profile.total_product_views,
      profile.total_searches,
      profile.total_cart_adds,
      profile.last_event_at,
      profile.last_rebuilt_at,
    ],
  );

  console.log(`[CUSTOMER_INTELLIGENCE] profile rebuilt userId=${userId} segment=${segment} orders=${totalOrders}`);

  return getOrCreateProfile(db, userId);
}

// ─── Segmentation ───────────────────────────────────────────────────────────

function determineSegment(
  totalOrders: number,
  totalSpent: number,
  eventCounts: Record<string, number>,
): string {
  if (totalOrders === 0) return "new";
  if (totalOrders >= 10 && totalSpent >= 5000) return "high_value";
  if (totalOrders >= 5) return "repeat";
  if (totalOrders >= 2) return "active";
  if (eventCounts["PRODUCT_VIEWED"] && eventCounts["PRODUCT_VIEWED"] > 20) return "price_sensitive";
  return "active";
}

// ─── Insights (for recommendations, VelRepeat) ──────────────────────────────

export interface CustomerInsights {
  userId: string;
  segment: string;
  topCategories: Array<{ category: string; count: number }>;
  topShops: Array<{ shop: string; count: number }>;
  recentProducts: Array<{ productId: string; lastViewed: Date }>;
  purchaseFrequency: number | null; // days between purchases
  lifetimeValue: number;
}

/**
 * Get derived customer insights for recommendations and VelRepeat.
 * These are computed from durable events — not manually set.
 */
export async function getCustomerInsights(
  db: Db,
  userId: string,
): Promise<CustomerInsights> {
  const profile = await getOrCreateProfile(db, userId);

  const topCategories = await db(
    `SELECT p.category, COUNT(*)::int AS count
     FROM behavioral_events be
     JOIN products p ON p.id = be.entity_id
     WHERE be.user_id = $1 AND be.event_type = 'PRODUCT_VIEWED'
     GROUP BY p.category ORDER BY count DESC LIMIT 5`,
    [userId],
  );

  const topShops = await db(
    `SELECT s.name AS shop, COUNT(*)::int AS count
     FROM behavioral_events be
     JOIN products p ON p.id = be.entity_id
     JOIN shops s ON s.id = p.shop_id
     WHERE be.user_id = $1
     GROUP BY s.name ORDER BY count DESC LIMIT 5`,
    [userId],
  );

  const recentProducts = await db(
    `SELECT entity_id AS product_id, MAX(occurred_at) AS last_viewed
     FROM behavioral_events
     WHERE user_id = $1 AND event_type = 'PRODUCT_VIEWED' AND entity_id IS NOT NULL
     GROUP BY entity_id ORDER BY last_viewed DESC LIMIT 10`,
    [userId],
  );

  return {
    userId,
    segment: profile.customerSegment,
    topCategories: topCategories.map((r: { category: string; count: number }) => ({
      category: r.category,
      count: r.count,
    })),
    topShops: topShops.map((r: { shop: string; count: number }) => ({
      shop: r.shop,
      count: r.count,
    })),
    recentProducts: recentProducts.map((r: { product_id: string; last_viewed: Date }) => ({
      productId: r.product_id,
      lastViewed: r.last_viewed,
    })),
    purchaseFrequency: profile.estimatedReplenishmentDays,
    lifetimeValue: profile.totalSpent,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mapProfileRow(row: Record<string, unknown>): CustomerProfile {
  return {
    id: String(row.id),
    preferredLanguage: String(row.preferred_language || "th"),
    preferredCurrency: String(row.preferred_currency || "THB"),
    totalOrders: Number(row.total_orders || 0),
    totalSpent: Number(row.total_spent || 0),
    averageOrderValue: Number(row.average_order_value || 0),
    firstPurchaseAt: row.first_purchase_at ? new Date(row.first_purchase_at as string) : null,
    lastPurchaseAt: row.last_purchase_at ? new Date(row.last_purchase_at as string) : null,
    favoriteCategories: Array.isArray(row.favorite_categories) ? row.favorite_categories as string[] : [],
    favoriteShops: Array.isArray(row.favorite_shops) ? row.favorite_shops as string[] : [],
    estimatedReplenishmentDays: row.estimated_replenishment_days ? Number(row.estimated_replenishment_days) : null,
    repeatPurchaseCount: Number(row.repeat_purchase_count || 0),
    customerSegment: String(row.customer_segment || "new"),
    totalProductViews: Number(row.total_product_views || 0),
    totalSearches: Number(row.total_searches || 0),
    totalCartAdds: Number(row.total_cart_adds || 0),
    lastEventAt: row.last_event_at ? new Date(row.last_event_at as string) : null,
  };
}
