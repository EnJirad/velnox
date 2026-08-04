export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
  status: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  sortOrder: number;
}

export interface ProductShop {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  /** Platform SKU e.g. VLX-P-XXXX */
  sku: string;
  /** Optional seller SKU */
  sellerSku?: string | null;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  images?: ProductImage[];
  category?: Category;
  shop?: ProductShop;
  createdAt: string;
}