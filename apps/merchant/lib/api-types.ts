export interface ApiProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  sku: string;
  sellerSku?: string | null;
  description: string | null;
  price: string;
  stock: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  images: ApiProductImage[];
  category?: ApiCategory;
}

export interface ApiShop {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ApiOrderItem {
  id: string;
  orderId: string;
  productId: string;
  merchantId: string;
  quantity: number;
  price: string;
  product?: ApiProduct;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    total: string;
    createdAt: string;
  };
}