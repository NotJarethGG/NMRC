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
export interface Product {
  id: string;
  name: string;
  nameEn?: string | null;
  slug: string;
  description?: string | null;
  descriptionEn?: string | null;
  priceCents: number;
  status: ProductStatus;
  featured: boolean;
  categoryId: string;
  collectionId?: string | null;
  category?: Category;
  collection?: Collection | null;
  images: ProductImage[];
  variants: ProductVariant[];
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  createdAt?: string;
}
export interface OrderItem {
  id: string;
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
  sinpeRef?: string | null;
  trackingCode?: string | null;
  trackingCarrier?: string | null;
  items: OrderItem[];
  createdAt: string;
  user?: { id: string; name: string; email: string; phone?: string | null };
}
export interface Stats {
  totalOrders: number;
  totalProducts: number;
  revenueCents: number;
  avgOrderCents: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  revenueByDay: { date: string; revenueCents: number; orders: number }[];
}
export interface AdminReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { name: string; email: string };
  product?: { name: string; slug: string };
}
export interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}
export interface DiscountCode {
  id: string;
  code: string;
  percentOff: number;
  active: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  uses: number;
  createdAt: string;
}
export interface StockAlert {
  id: string;
  email: string;
  size?: string | null;
  createdAt: string;
  product?: { name: string; slug: string };
}
export interface BestSeller {
  productId: string;
  name: string;
  units: number;
  revenueCents: number;
  slug: string | null;
  image: string | null;
}
export interface LowStockRow {
  id: string;
  size: string;
  stock: number;
  product: { id: string; name: string; slug: string };
}
