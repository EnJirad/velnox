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

export interface ApiVelRepeatPlan {
  id?: string;
  planCode: string;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
  totalUnits: number;
  unitsPerDelivery?: number;
  discountPercent?: number;
  freeShipping?: boolean;
  isActive?: boolean;
  sortOrder?: number;
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
  velRepeatEnabled?: boolean;
  velRepeatPlans?: ApiVelRepeatPlan[];
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
    paymentStatus?: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    shippingName?: string | null;
    payment?: { status?: string; method?: string } | null;
  };
}