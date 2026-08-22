/**
 * @deprecated LEGACY Convex-table subscription module (V3 migration).
 *
 * VelRepeat subscriptions are authoritative in Neon (`backend/subscriptions.ts`);
 * `convex/commerce.ts` exposes the live actions (`createVelRepeat`,
 * `mySubscriptions`, `sellerSubscriptions`, `pauseSubscription`,
 * `updateSubscriptionAction`, `processDueSubscriptions`). No frontend
 * references this module (verified 2026-08-16). Safe to delete after `_generated`
 * is regenerated without these functions.
 */
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { canSell, getCurrentUser } from "./users";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * velshop "สั่งรายเดือน": the customer signs up to receive this product
 * automatically every intervalDays. Each cycle the seller runs
 * `processDueSubscriptions` and a normal order is created for the customer.
 */
export const createSubscription = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    intervalDays: v.number(),
  },
  handler: async (ctx, { productId, quantity, intervalDays }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");
    const product = await ctx.db.get(productId);
    if (!product || !product.published || product.price === undefined) {
      throw new Error("สินค้าไม่มีจำหน่าย");
    }
    if (quantity < 1) throw new Error("จำนวนไม่ถูกต้อง");
    if (intervalDays < 7) throw new Error("รอบสั่งต้องไม่น้อยกว่า 7 วัน");

    const now = Date.now();
    return await ctx.db.insert("subscriptions", {
      userId: user._id,
      productId,
      quantity: Math.floor(quantity),
      intervalDays: Math.round(intervalDays),
      status: "active",
      nextOrderAt: now + Math.round(intervalDays) * DAY_MS,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** The signed-in customer's subscriptions (velshop "การสั่งรายเดือน"). */
export const mySubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null) return [];
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id as unknown as string))
      .order("desc")
      .collect();
    const rows: { subscription: Doc<"subscriptions">; product: Doc<"products"> | null }[] = [];
    for (const sub of subs) {
      rows.push({ subscription: sub, product: await ctx.db.get(sub.productId as Id<"products">) });
    }
    return rows;
  },
});

/** Cancel one of the customer's own subscriptions. */
export const cancelSubscription = mutation({
  args: { subscriptionId: v.string() },
  handler: async (ctx, { subscriptionId }) => {
    const user = await getCurrentUser(ctx);
    if (user === null) throw new Error("Not authenticated");
    const sub = await ctx.db.get(subscriptionId as Id<"subscriptions">);
    if (!sub || sub.userId !== user._id) throw new Error("Subscription not found");
    await ctx.db.patch(subscriptionId as Id<"subscriptions">, { status: "cancelled", updatedAt: Date.now() });

    // CPNS §3/§17 — cancelling a VelRepeat is a meaningful transaction event.
    // The identity comes from the session (never the client), so it cannot be spoofed.
    try {
      await ctx.runMutation(api.memoryEvents.trackForUser, {
        userId: user._id,
        type: "VELREPEAT_CANCEL",
        entityId: sub.productId,
        value: undefined,
        context: { intervalDays: sub.intervalDays, quantity: sub.quantity },
      });
    } catch {
      // tracking is fire-and-forget — cancelling must never fail because of it
    }
  },
});

/** All active subscriptions across the shop (velseller / velcenter). */
export const activeSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null || !canSell(user.role)) throw new Error("Seller only");
    const subs = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("status"), "active"))
      .order("desc")
      .take(100);
    const rows: {
      subscription: Doc<"subscriptions">;
      product: Doc<"products"> | null;
      customer: Doc<"users"> | null;
    }[] = [];
    for (const sub of subs) {
      rows.push({
        subscription: sub,
        product: await ctx.db.get(sub.productId as Id<"products">),
        customer: await ctx.db.get(sub.userId as Id<"users">),
      });
    }
    return rows;
  },
});

/**
 * Turn due subscriptions into real customer orders (one per cycle), deduct
 * stock and advance the next cycle. Triggered by the merchant/company — in
 * production this becomes a scheduled job (VelRepeat auto-order).
 */
export const processDueSubscriptions = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user === null || !canSell(user.role)) throw new Error("Seller only");

    const now = Date.now();
    const due = await ctx.db
      .query("subscriptions")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.lte(q.field("nextOrderAt"), now),
        ),
      )
      .take(50);

    let created = 0;
    for (const sub of due) {
      const product = await ctx.db.get(sub.productId as Id<"products">);
      if (!product || !product.published || product.price === undefined) continue;
      if ((product.currentStock ?? 0) < sub.quantity) continue; // skip, out of stock
      const customer = await ctx.db.get(sub.userId as Id<"users">);

      const subtotal = Math.round(product.price * sub.quantity * 100) / 100;
      const orderId = await ctx.db.insert("orders", {
        userId: sub.userId,
        items: [{
          productId: product._id as unknown as string,
          name: product.name,
          price: product.price,
          quantity: sub.quantity,
          imageUrl: product.imageUrl,
        }],
        status: "pending",
        total: subtotal,
      });
      await ctx.db.insert("orderItems", {
        orderId: orderId as unknown as string,
        productName: product.name,
        quantity: sub.quantity,
        subtotal,
      });
      await ctx.db.patch(product._id, {
        currentStock: Math.max(0, (product.currentStock ?? 0) - sub.quantity),
        updatedAt: now,
      });
      await ctx.db.patch(sub._id, {
        nextOrderAt: now + sub.intervalDays * DAY_MS,
        updatedAt: now,
      });
      created += 1;
    }
    return created;
  },
});
