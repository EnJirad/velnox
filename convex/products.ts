import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let products;

    if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.featured) {
      products = await ctx.db
        .query("products")
        .withIndex("by_featured", (q) => q.eq("featured", true))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower) ||
          (p.tags &&
            p.tags.some((t) => t.toLowerCase().includes(searchLower))),
      );
    }

    return products;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const featured = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .take(8);
  },
});

export const categories = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return [...new Set(products.map((p) => p.category))].sort();
  },
});

/** List all products (admin). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

/** Create a new product (seller only). */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    imageUrl: v.string(),
    inStock: v.boolean(),
    published: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    estimatedCycleDays: v.optional(v.number()),
    reorderLevel: v.number(),
    currentStock: v.number(),
    unit: v.optional(v.string()),
    supplier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    const { price, ...rest } = args;
    return await ctx.db.insert("products", {
      ...rest,
      price: price ?? 0,
      userId: userId as unknown as string,
      updatedAt: now,
    });
  },
});

/** Update an existing product (seller only). */
export const update = mutation({
  args: {
    productId: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    published: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    estimatedCycleDays: v.optional(v.number()),
    reorderLevel: v.optional(v.number()),
    currentStock: v.optional(v.number()),
    unit: v.optional(v.string()),
    supplier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const { productId, ...patch } = args;
    await ctx.db.patch(productId, { ...patch, updatedAt: Date.now() });
  },
});

/** Record a purchase (inventory restock). */
export const recordPurchase = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    unitCost: v.number(),
    supplier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    await ctx.db.insert("purchases", {
      productId: args.productId as unknown as string,
      userId: userId as unknown as string,
      quantity: args.quantity,
      unitCost: args.unitCost,
      supplier: args.supplier,
      createdAt: now,
    });

    await ctx.db.patch(args.productId, {
      currentStock: (product.currentStock ?? 0) + args.quantity,
      lastPurchaseQty: args.quantity,
      lastOrderedAt: now,
      updatedAt: now,
    });
  },
});

/** Record a sale (stock deduction). */
export const recordSale = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    await ctx.db.patch(args.productId, {
      currentStock: Math.max(0, (product.currentStock ?? 0) - args.quantity),
      updatedAt: Date.now(),
    });
  },
});
