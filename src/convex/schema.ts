import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      // Velnox profile fields
      avatarPublicId: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(
        v.object({
          street: v.optional(v.string()),
          city: v.optional(v.string()),
          state: v.optional(v.string()),
          zip: v.optional(v.string()),
          country: v.optional(v.string()),
        }),
      ),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Products table for the shop
    products: defineTable({
      name: v.string(),
      description: v.string(),
      price: v.number(),
      originalPrice: v.optional(v.number()),
      category: v.string(),
      imageUrl: v.string(),
      images: v.optional(v.array(v.string())),
      inStock: v.boolean(),
      rating: v.optional(v.number()),
      reviewCount: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      featured: v.optional(v.boolean()),
    })
      .index("by_category", ["category"])
      .index("by_price", ["price"])
      .index("by_featured", ["featured"]),

    // Orders table
    orders: defineTable({
      userId: v.string(),
      items: v.array(
        v.object({
          productId: v.string(),
          name: v.string(),
          price: v.number(),
          quantity: v.number(),
          imageUrl: v.string(),
        }),
      ),
      total: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled"),
      ),
      shippingAddress: v.optional(
        v.object({
          street: v.string(),
          city: v.string(),
          state: v.string(),
          zip: v.string(),
          country: v.string(),
        }),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    // Cart items
    cartItems: defineTable({
      userId: v.string(),
      productId: v.string(),
      name: v.string(),
      price: v.number(),
      imageUrl: v.string(),
      quantity: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
