export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type OrderStatus = 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  heroImage?: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  position: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { name: string };
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  descriptionEn?: string | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  status: ProductStatus;
  featured: boolean;
  category?: Category;
  collection?: Collection | null;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  address?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaymentInfo {
  sinpeNumber: string;
  whatsappNumber: string;
  whatsappUrl: string;
  totalText: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  size: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  subtotalCents?: number;
  discountCents?: number;
  discountCode?: string | null;
  shippingCents?: number;
  totalCents: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  notes?: string | null;
  trackingCode?: string | null;
  trackingCarrier?: string | null;
  sinpeRef?: string | null;
  sinpeProofUrl?: string | null;
  items: OrderItem[];
  createdAt: string;
  payment?: PaymentInfo;
}
