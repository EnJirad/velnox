import { apiClient } from './api-client';
import type { Category, Product } from '@velnox/types';

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CatalogVelRepeatPlan = {
  planCode: string;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  totalUnits: number;
  unitsPerDelivery?: number;
  discountPercent?: number;
  freeShipping?: boolean;
};

/** Product shape สำหรับ UI Shop */
export interface CatalogProduct extends Product {
  categoryName: string;
  shopName: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  velRepeatEnabled?: boolean;
  velRepeatPlans?: CatalogVelRepeatPlan[];
}

export function toCatalogProduct(p: Product & {
  velRepeatEnabled?: boolean;
  velRepeatPlans?: CatalogVelRepeatPlan[];
}): CatalogProduct {
  const price = typeof p.price === 'string' ? Number(p.price) : Number(p.price);
  return {
    ...p,
    price,
    categoryName: p.category?.name ?? '',
    shopName: p.shop?.name ?? '',
    imageUrl: p.images?.[0]?.url,
    rating: 0,
    reviewCount: 0,
    soldCount: 0,
    velRepeatEnabled: p.velRepeatEnabled ?? false,
    velRepeatPlans: p.velRepeatPlans ?? [],
  };
}

/** decode ก่อน encode กัน double-encoding จาก useParams / URL ภาษาไทย */
export function encodePathSegment(raw: string): string {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    // already plain text
  }
  return encodeURIComponent(value);
}

// --- short client cache (ลด refetch ตอน navigate กลับมาใน session เดียวกัน) ---
const CACHE_TTL_MS = 60_000; // 1 นาที
const mem = new Map<string, { at: number; data: unknown }>();

function cacheGet<T>(key: string): T | null {
  const hit = mem.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    mem.delete(key);
    return null;
  }
  return hit.data as T;
}

function cacheSet(key: string, data: unknown) {
  mem.set(key, { at: Date.now(), data });
}

export async function fetchCategories(): Promise<Category[]> {
  const key = 'categories';
  const cached = cacheGet<Category[]>(key);
  if (cached) return cached;
  try {
    const data = await apiClient.get<Category[]>('/categories', { skipAuth: true });
    cacheSet(key, data);
    return data;
  } catch {
    return [];
  }
}

export async function fetchProducts(params?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.categoryId) qs.set('categoryId', params.categoryId);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit ?? 20));
  if (params?.sort) qs.set('sort', params.sort);
  const path = '/products' + (qs.toString() ? '?' + qs.toString() : '');
  const key = `products:${path}`;
  const cached = cacheGet<PaginatedProducts>(key);
  if (cached) return cached;
  try {
    const data = await apiClient.get<PaginatedProducts>(path, { skipAuth: true });
    cacheSet(key, data);
    return data;
  } catch {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const key = `product:${slug}`;
  const cached = cacheGet<CatalogProduct>(key);
  if (cached) return cached;
  try {
    const p = await apiClient.get<Product>(`/products/${encodePathSegment(slug)}`, {
      skipAuth: true,
    });
    const catalog = toCatalogProduct(p);
    cacheSet(key, catalog);
    return catalog;
  } catch {
    return null;
  }
}
