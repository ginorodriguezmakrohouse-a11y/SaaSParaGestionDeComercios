export type Role = 'admin' | 'seller' | 'viewer';
export type StockStatus = 'normal' | 'low' | 'out';
export type MovementType = 'COMPRA' | 'SALIDA_VENTA' | 'AJUSTE_MANUAL' | 'MERMA' | 'DEVOLUCION';
export type SaleChannel = 'whatsapp' | 'pos' | 'web';
export type SaleStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type Module = 'dashboard' | 'products' | 'inventory' | 'pos' | 'whatsapp' | 'public' | 'techdocs' | 'tests';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  plan: 'starter' | 'pro' | 'enterprise';
  currency: string;
  currencySymbol: string;
  primaryColor: string;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  sku: string;
  categoryId: string;
  imageUrl: string;
  stock: number;
  minStock: number;
  tags: string[];
  active: boolean;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  tenantId: string;
  items: SaleItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  channel: SaleChannel;
  status: SaleStatus;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  tenantId: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantityBefore: number;
  quantityAfter: number;
  delta: number;
  justification: string;
  userId: string;
  createdAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  tenantId: string;
  name: string;
  body: string;
  isDefault: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string;
  avatar: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
