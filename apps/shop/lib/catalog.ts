import { apiClient } from './api-client';
import type { Category, Product } from '@velnox/types';

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Product shape สำหรับ UI Shop */
export interface CatalogProduct extends Product {
  categoryName: string;
  shopName: string;
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
}

export function toCatalogProduct(p: Product): CatalogProduct {
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
  };
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    return await apiClient.get<Category[]>('/categories', { skipAuth: true });
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
  const path = `/products\( {qs.toString() ? `? \){qs}` : ''}`;
  try {
    return await apiClient.get<PaginatedProducts>(path, { skipAuth: true });
  } catch {
    return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  try {
    const p = await apiClient.get<Product>(`/products/${encodeURIComponent(slug)}`, {
      skipAuth: true,
    });
    return toCatalogProduct(p);
  } catch {
    return null;
  }
}