export type UserRole =
  | 'super_admin'
  | 'store_manager'
  | 'order_manager'
  | 'inventory_manager'
  | 'marketing_manager'
  | 'support_staff'
  | 'customer';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  provinceOrState: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
  totalSpent?: number;
  orderCount?: number;
  tags?: string[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  title: string;
  size: string;
  color: string;
  colorHex?: string;
  fabric?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  image?: string;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categoryName?: string;
  collectionId?: string;
  collectionName?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  images: string[];
  status: 'active' | 'draft' | 'archived';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  fabric: string;
  careInstructions: string;
  specifications: Record<string, string>;
  tags: string[];
  totalStock: number;
  lowStockThreshold: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount?: number;
  order: number;
  isActive: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  size: string;
  color: string;
  fabric?: string;
  image: string;
  quantity: number;
  maxStock: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cod' | 'card' | 'bank_transfer';

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  userId?: string;
  isGuest: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  taxAmount: number;
  shippingFee: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    transactionId?: string;
    cardLast4?: string;
    bankReference?: string;
    receiptUrl?: string;
  };
  orderStatus: OrderStatus;
  timeline: OrderTimelineEvent[];
  courierInfo?: {
    courierName: string;
    trackingCode: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  description?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantTitle?: string;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'order_reservation' | 'order_cancellation';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'customer' | 'staff';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  category: 'order' | 'product' | 'return' | 'general';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  messages: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  forAdmin: boolean;
  title: string;
  message: string;
  type: 'order' | 'inventory' | 'review' | 'support' | 'promotion';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  logoText: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  taxRatePercentage: number;
  standardShippingFee: number;
  freeShippingThreshold: number;
  supportEmail: string;
  supportPhone: string;
  address: string;
  city: string;
  country: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  orderNumberPrefix: string;
  returnWindowDays: number;
  bankDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchCode: string;
  };
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  imageUrl: string;
  isActive: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface SalesReport {
  totalRevenue: number;
  grossSales: number;
  netSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscountGiven: number;
  totalTaxCollected: number;
  totalShippingCollected: number;
  orderStatusCounts: Record<OrderStatus, number>;
  dailySales: { date: string; revenue: number; orders: number }[];
  categorySales: { categoryName: string; revenue: number; count: number }[];
  paymentMethodBreakdown: { method: PaymentMethod; count: number; total: number }[];
  topSellingProducts: { id: string; name: string; sku: string; unitsSold: number; revenue: number }[];
}
