import { mutation } from "./_generated/server";

type ProductData = {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  featured?: boolean;
};

const products: ProductData[] = [
  {
    name: "Premium Wireless Headphones",
    description:
      "Immersive sound with active noise cancellation. 30-hour battery life, ultra-comfortable over-ear design.",
    price: 2999,
    originalPrice: 3999,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.8,
    reviewCount: 234,
    tags: ["wireless", "noise-cancelling", "audio"],
    featured: true,
  },
  {
    name: "Ultra-Slim Smartwatch",
    description:
      "Track your fitness, receive notifications, and stay connected with a sleek, water-resistant design.",
    price: 4999,
    originalPrice: 5999,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
    tags: ["smartwatch", "fitness", "wearable"],
    featured: true,
  },
  {
    name: "Minimalist Leather Backpack",
    description:
      "Full-grain leather with padded laptop compartment. Perfect for work or travel.",
    price: 3499,
    originalPrice: 4499,
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.9,
    reviewCount: 312,
    tags: ["backpack", "leather", "laptop"],
    featured: true,
  },
  {
    name: "Ceramic Pour-Over Coffee Set",
    description:
      "Hand-crafted ceramic dripper with thermal carafe. Brew the perfect cup every morning.",
    price: 1899,
    originalPrice: 2499,
    category: "Home & Living",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.7,
    reviewCount: 156,
    tags: ["coffee", "ceramic", "kitchen"],
    featured: true,
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Adjustable lumbar support, breathable mesh, and 4D armrests for all-day comfort.",
    price: 8999,
    originalPrice: 11999,
    category: "Home & Living",
    imageUrl:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.5,
    reviewCount: 98,
    tags: ["chair", "ergonomic", "office"],
    featured: false,
  },
  {
    name: "Running Performance Shoes",
    description:
      "Lightweight carbon-plate design for speed. Responsive cushioning for long-distance comfort.",
    price: 5499,
    originalPrice: 6999,
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.8,
    reviewCount: 421,
    tags: ["running", "shoes", "sports"],
    featured: true,
  },
  {
    name: "Vintage Film Camera",
    description:
      "Classic 35mm film camera with manual controls. Perfect for photography enthusiasts.",
    price: 6999,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.4,
    reviewCount: 67,
    tags: ["camera", "film", "photography"],
    featured: false,
  },
  {
    name: "Organic Cotton Hoodie",
    description:
      "Sustainably made with organic cotton. Relaxed fit with a soft brushed interior.",
    price: 2499,
    originalPrice: 2999,
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f7b807ad?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.6,
    reviewCount: 203,
    tags: ["hoodie", "organic", "sustainable"],
    featured: true,
  },
  {
    name: "Stainless Steel Water Bottle",
    description:
      "Double-wall vacuum insulation keeps drinks cold for 24hrs or hot for 12hrs.",
    price: 899,
    originalPrice: 1299,
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.7,
    reviewCount: 543,
    tags: ["bottle", "stainless", "insulated"],
    featured: false,
  },
  {
    name: "Wireless Mechanical Keyboard",
    description:
      "Hot-swappable switches, RGB backlight, and dual-mode connectivity (Bluetooth + USB-C).",
    price: 3999,
    originalPrice: 4999,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.8,
    reviewCount: 312,
    tags: ["keyboard", "mechanical", "wireless"],
    featured: true,
  },
  {
    name: "Handmade Ceramic Planter",
    description:
      "Unique hand-thrown planter with drainage hole. Ideal for indoor plants.",
    price: 1299,
    category: "Home & Living",
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.5,
    reviewCount: 87,
    tags: ["planter", "ceramic", "plants"],
    featured: false,
  },
  {
    name: "Travel Yoga Mat",
    description:
      "Lightweight, foldable mat with alignment markers. Perfect for yoga on the go.",
    price: 1699,
    originalPrice: 2199,
    category: "Sports",
    imageUrl:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.3,
    reviewCount: 145,
    tags: ["yoga", "mat", "travel"],
    featured: false,
  },
  {
    name: "Polarized Aviator Sunglasses",
    description:
      "UV400 protection with lightweight titanium frames. Timeless aviator style.",
    price: 2299,
    originalPrice: 2999,
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.6,
    reviewCount: 278,
    tags: ["sunglasses", "polarized", "aviator"],
    featured: false,
  },
  {
    name: "Smart LED Desk Lamp",
    description:
      "Adjustable color temperature, wireless charging base, and touch controls.",
    price: 2799,
    originalPrice: 3499,
    category: "Home & Living",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.4,
    reviewCount: 112,
    tags: ["lamp", "smart", "LED"],
    featured: false,
  },
  {
    name: "Canvas Low-Top Sneakers",
    description:
      "Classic canvas sneakers with vulcanized rubber sole. Available in multiple colors.",
    price: 1799,
    originalPrice: 2299,
    category: "Fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.5,
    reviewCount: 389,
    tags: ["sneakers", "canvas", "casual"],
    featured: true,
  },
  {
    name: "Portable Bluetooth Speaker",
    description:
      "360° sound with deep bass. IPX7 waterproof, 20-hour playtime.",
    price: 2199,
    originalPrice: 2799,
    category: "Electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    inStock: true,
    rating: 4.7,
    reviewCount: 267,
    tags: ["speaker", "bluetooth", "waterproof"],
    featured: false,
  },
];

/**
 * Seed the database with initial product data.
 * Safe to run multiple times — skips if products already exist.
 */
export const seedProducts = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) {
      return { message: "Products already seeded", count: 0 };
    }

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return {
      message: "Products seeded successfully",
      count: products.length,
    };
  },
});
