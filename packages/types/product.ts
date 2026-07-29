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

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: ProductStatus;
  images?: ProductImage[];
  createdAt: string;
}
