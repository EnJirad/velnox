import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  STAFF: "staff",
  ADMIN: "admin",
  OWNER: "owner",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.CUSTOMER),
  v.literal(ROLES.SELLER),
  v.literal(ROLES.STAFF),
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.OWNER),
);

export const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled"),
  v.literal("completed"),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      department: v.optional(v.string()),
      mustChangePassword: v.optional(v.boolean()),
      phone: v.optional(v.string()),
      address: v.optional(v.object({
        street: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zip: v.optional(v.string()),
        country: v.optional(v.string()),
      })),
    }).index("email", ["email"]),

    products: defineTable({
      name: v.string(),
      description: v.string(),
      price: v.number(),
      originalPrice: v.optional(v.number()),
      category: v.string(),
      imageUrl: v.string(),
      inStock: v.boolean(),
      published: v.optional(v.boolean()),
      rating: v.optional(v.number()),
      reviewCount: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      featured: v.optional(v.boolean()),
      unit: v.optional(v.string()),
      avgCycleDays: v.optional(v.number()),
      estimatedCycleDays: v.optional(v.number()),
      lastOrderedAt: v.optional(v.number()),
      reorderLevel: v.optional(v.number()),
      currentStock: v.optional(v.number()),
      lastPurchaseQty: v.optional(v.number()),
      userId: v.optional(v.string()),
      updatedAt: v.optional(v.number()),
    })
      .index("by_category", ["category"])
      .index("by_price", ["price"])
      .index("by_featured", ["featured"])
      .index("by_user", ["userId"]),

    purchases: defineTable({
      productId: v.string(),
      userId: v.string(),
      quantity: v.number(),
      unitCost: v.number(),
      supplier: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_product", ["productId"]),

    orders: defineTable({
      userId: v.string(),
      customerName: v.optional(v.string()),
      customerPhone: v.optional(v.string()),
      itemCount: v.optional(v.number()),
      items: v.array(v.object({
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        imageUrl: v.string(),
      })),
      total: v.number(),
      status: orderStatusValidator,
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    orderItems: defineTable({
      orderId: v.string(),
      productName: v.string(),
      productId: v.optional(v.string()),
      unit: v.optional(v.string()),
      quantity: v.number(),
      subtotal: v.number(),
      price: v.optional(v.number()),
    }).index("by_order", ["orderId"]),

    subscriptions: defineTable({
      userId: v.string(),
      productId: v.string(),
      quantity: v.number(),
      intervalDays: v.number(),
      status: v.string(),
      nextOrderAt: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    goals: defineTable({
      userId: v.string(),
      title: v.string(),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      unit: v.optional(v.string()),
      period: v.optional(v.string()),
      dueDate: v.optional(v.number()),
      targetValue: v.number(),
      currentValue: v.number(),
      achieved: v.optional(v.boolean()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),

    storeSettings: defineTable({
      key: v.string(),
      shopName: v.optional(v.string()),
      tagline: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      announcement: v.optional(v.string()),
      updatedAt: v.optional(v.number()),
    }).index("by_key", ["key"]),

    interests: defineTable({
      userId: v.optional(v.string()),
      productId: v.string(),
      viewedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_entity", ["productId"]),

    productViews: defineTable({
      userId: v.string(),
      productId: v.string(),
      timestamp: v.number(),
    }).index("by_user", ["userId"]),

    businessEvents: defineTable({
      type: v.string(),
      entityId: v.string(),
      context: v.optional(v.any()),
      createdAt: v.number(),
    }).index("by_entity", ["entityId"]),

    customerEvents: defineTable({
      userId: v.optional(v.string()),
      anonymousId: v.optional(v.string()),
      type: v.string(),
      entityId: v.optional(v.string()),
      entityType: v.optional(v.string()),
      value: v.optional(v.string()),
      context: v.optional(v.any()),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_user_type", ["userId", "type"])
      .index("by_type", ["type"])
      .index("by_anonymous", ["anonymousId"]),

    auditLogs: defineTable({
      actor: v.string(),
      action: v.string(),
      target: v.optional(v.string()),
      metadata: v.optional(v.any()),
      timestamp: v.number(),
    }).index("by_timestamp", ["timestamp"]),

    notifications: defineTable({
      userId: v.string(),
      type: v.string(),
      title: v.string(),
      body: v.optional(v.string()),
      link: v.optional(v.string()),
      read: v.optional(v.boolean()),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    rateLimits: defineTable({
      name: v.string(),
      key: v.string(),
      count: v.number(),
      resetAt: v.number(),
    }).index("by_name_key", ["name", "key"]),

  },
  {
    schemaValidation: false,
  },
);

export default schema;
