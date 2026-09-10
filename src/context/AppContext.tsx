import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Tenant, Category, Product, Sale, InventoryMovement, WhatsAppTemplate,
  AppUser, Role, Module, MovementType, SaleChannel,
} from '../types';
import {
  TENANTS, CATEGORIES, PRODUCTS, SALES, MOVEMENTS, TEMPLATES, USERS,
} from '../mockData';

// ── Persistence helpers ──────────────────────────────────────────────────────
const LS_PREFIX = 'catalogopro_pe_v1_';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch {
    // quota exceeded — silently ignore
  }
}

// ── Context types ────────────────────────────────────────────────────────────
interface AppContextValue {
  tenants: Tenant[];
  currentTenantId: string;
  currentRole: Role;
  currentUser: AppUser;
  products: Product[];
  categories: Category[];
  sales: Sale[];
  movements: InventoryMovement[];
  templates: WhatsAppTemplate[];
  currentModule: Module;
  sidebarOpen: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  currentTenant: Tenant;
  tenantProducts: Product[];
  tenantCategories: Category[];
  tenantSales: Sale[];
  tenantMovements: InventoryMovement[];
  tenantTemplates: WhatsAppTemplate[];
  selectTenant: (id: string) => void;
  setRole: (role: Role) => void;
  setModule: (module: Module) => void;
  toggleSidebar: () => void;
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addSale: (items: { productId: string; quantity: number }[], customer: string, phone: string, channel: SaleChannel) => boolean;
  adjustStock: (productId: string, delta: number, type: MovementType, justification: string) => void;
  addTemplate: (t: Omit<WhatsAppTemplate, 'id'>) => void;
  updateTemplate: (t: WhatsAppTemplate) => void;
  deleteTemplate: (id: string) => void;
  addCategory: (name: string, color: string) => void;
  addTenant: (name: string, phone: string, address: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  formatCurrency: (amount: number) => string;
  clearPersistedData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

let idCounter = 2000;
const uid = () => `id_${++idCounter}_${Date.now()}`;

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>(() => load('tenants', TENANTS));
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => load('currentTenantId', 't1'));
  const [currentRole, setCurrentRole] = useState<Role>(() => load('currentRole', 'admin'));
  const [products, setProducts] = useState<Product[]>(() => load('products', PRODUCTS));
  const [categories, setCategories] = useState<Category[]>(() => load('categories', CATEGORIES));
  const [sales, setSales] = useState<Sale[]>(() => load('sales', SALES));
  const [movements, setMovements] = useState<InventoryMovement[]>(() => load('movements', MOVEMENTS));
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => load('templates', TEMPLATES));
  const [currentModule, setCurrentModule] = useState<Module>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<AppContextValue['toast']>(null);

  // ── Persist on every change ────────────────────────────────────────────────
  useEffect(() => { save('tenants', tenants); }, [tenants]);
  useEffect(() => { save('currentTenantId', currentTenantId); }, [currentTenantId]);
  useEffect(() => { save('currentRole', currentRole); }, [currentRole]);
  useEffect(() => { save('products', products); }, [products]);
  useEffect(() => { save('categories', categories); }, [categories]);
  useEffect(() => { save('sales', sales); }, [sales]);
  useEffect(() => { save('movements', movements); }, [movements]);
  useEffect(() => { save('templates', templates); }, [templates]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentTenant = tenants.find(t => t.id === currentTenantId) ?? tenants[0];
  const tenantProducts = products.filter(p => p.tenantId === currentTenantId);
  const tenantCategories = categories.filter(c => c.tenantId === currentTenantId);
  const tenantSales = sales.filter(s => s.tenantId === currentTenantId);
  const tenantMovements = movements.filter(m => m.tenantId === currentTenantId);
  const tenantTemplates = templates.filter(t => t.tenantId === currentTenantId);

  const currentUser: AppUser =
    USERS.find(u => u.tenantId === currentTenantId && u.role === currentRole) ??
    { id: 'u_view', name: 'Auditor Invitado', email: 'audit@catalogopro.pe', role: currentRole, tenantId: currentTenantId, avatar: 'AI' };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    const t = tenants.find(x => x.id === currentTenantId);
    const sym = t?.currencySymbol ?? 'S/';
    return `${sym} ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [tenants, currentTenantId]);

  const clearPersistedData = useCallback(() => {
    const keys = ['tenants', 'currentTenantId', 'currentRole', 'products', 'categories', 'sales', 'movements', 'templates'];
    keys.forEach(k => localStorage.removeItem(LS_PREFIX + k));
    setTenants(TENANTS);
    setCurrentTenantId('t1');
    setCurrentRole('admin');
    setProducts(PRODUCTS);
    setCategories(CATEGORIES);
    setSales(SALES);
    setMovements(MOVEMENTS);
    setTemplates(TEMPLATES);
    showToast('Datos restaurados al estado inicial', 'info');
  }, [showToast]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const selectTenant = useCallback((id: string) => {
    setCurrentTenantId(id);
    setCurrentModule('dashboard');
    showToast(`Comercio cambiado: ${tenants.find(t => t.id === id)?.name}`, 'info');
  }, [tenants, showToast]);

  const setRole = useCallback((role: Role) => {
    setCurrentRole(role);
    showToast(`Rol: ${role === 'admin' ? 'Administrador' : role === 'seller' ? 'Vendedor' : 'Auditor'}`, 'info');
  }, [showToast]);

  const addProduct = useCallback((p: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = { ...p, id: uid(), createdAt: new Date().toISOString() };
    const mv: InventoryMovement = {
      id: uid(), tenantId: p.tenantId, productId: newProduct.id, productName: p.name,
      type: 'COMPRA', quantityBefore: 0, quantityAfter: p.stock, delta: p.stock,
      justification: 'Stock inicial al crear producto',
      userId: currentUser.id, createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    setMovements(prev => [mv, ...prev]);
    showToast(`Producto "${p.name}" creado y guardado`);
  }, [currentUser.id, showToast]);

  const updateProduct = useCallback((p: Product) => {
    setProducts(prev => prev.map(x => x.id === p.id ? p : x));
    showToast('Cambios guardados correctamente');
  }, [showToast]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(x => x.id !== id));
    setMovements(prev => prev.filter(m => m.productId !== id));
    showToast('Producto eliminado', 'info');
  }, [showToast]);

  const addSale = useCallback((
    items: { productId: string; quantity: number }[],
    customer: string, phone: string, channel: SaleChannel,
  ): boolean => {
    for (const { productId, quantity } of items) {
      const p = products.find(x => x.id === productId);
      if (!p || p.stock < quantity) {
        showToast(`Stock insuficiente para "${p?.name ?? productId}"`, 'error');
        return false;
      }
    }

    const saleItems = items.map(({ productId, quantity }) => {
      const p = products.find(x => x.id === productId)!;
      return { productId, productName: p.name, quantity, price: p.price };
    });
    const total = saleItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const sale: Sale = {
      id: uid(), tenantId: currentTenantId,
      items: saleItems, total, customerName: customer, customerPhone: phone,
      channel, status: 'confirmed', createdAt: new Date().toISOString(),
    };

    const newMovements: InventoryMovement[] = [];
    setProducts(prev => prev.map(p => {
      const item = items.find(i => i.productId === p.id);
      if (!item) return p;
      const after = p.stock - item.quantity;
      newMovements.push({
        id: uid(), tenantId: currentTenantId, productId: p.id, productName: p.name,
        type: 'SALIDA_VENTA', quantityBefore: p.stock, quantityAfter: after, delta: -item.quantity,
        justification: `Venta #${sale.id} — ${customer}`,
        userId: currentUser.id, createdAt: new Date().toISOString(),
      });
      return { ...p, stock: after };
    }));

    setSales(prev => [sale, ...prev]);
    setMovements(prev => [...newMovements, ...prev]);
    showToast(`Venta registrada — Total: ${formatCurrency(total)}`);
    return true;
  }, [products, currentTenantId, currentUser.id, showToast, formatCurrency]);

  const adjustStock = useCallback((productId: string, delta: number, type: MovementType, justification: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const after = Math.max(0, p.stock + delta);
      const mv: InventoryMovement = {
        id: uid(), tenantId: currentTenantId, productId, productName: p.name,
        type, quantityBefore: p.stock, quantityAfter: after, delta,
        justification, userId: currentUser.id, createdAt: new Date().toISOString(),
      };
      setMovements(prev2 => [mv, ...prev2]);
      return { ...p, stock: after };
    }));
    showToast('Inventario ajustado y guardado');
  }, [currentTenantId, currentUser.id, showToast]);

  const addTemplate = useCallback((t: Omit<WhatsAppTemplate, 'id'>) => {
    setTemplates(prev => [...prev, { ...t, id: uid() }]);
    showToast('Plantilla guardada');
  }, [showToast]);

  const updateTemplate = useCallback((t: WhatsAppTemplate) => {
    setTemplates(prev => prev.map(x => x.id === t.id ? t : x));
    showToast('Plantilla actualizada');
  }, [showToast]);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(x => x.id !== id));
    showToast('Plantilla eliminada', 'info');
  }, [showToast]);

  const addCategory = useCallback((name: string, color: string) => {
    setCategories(prev => [...prev, { id: uid(), tenantId: currentTenantId, name, color }]);
    showToast(`Categoría "${name}" guardada`);
  }, [currentTenantId, showToast]);

  const addTenant = useCallback((name: string, phone: string, address: string) => {
    const id = uid();
    const newTenant: Tenant = {
      id, name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      phone, address, plan: 'starter', currency: 'PEN', currencySymbol: 'S/',
      primaryColor: '#25D366',
    };
    setTenants(prev => [...prev, newTenant]);
    setCategories(prev => [
      ...prev,
      { id: uid(), tenantId: id, name: 'General', color: '#64748b' },
      { id: uid(), tenantId: id, name: 'Destacados', color: '#f59e0b' },
    ]);
    setTemplates(prev => [...prev, {
      id: uid(), tenantId: id, name: 'Presentación de producto', isDefault: true,
      body: `¡Hola! 👋 Te presento este producto de *{nombre_tienda}*:\n\n📦 *{producto}*\n💰 Precio: *{precio}*\n🏷️ SKU: {sku}\n\n🔗 Ver catálogo: {link_catalogo}\n\n¿Te interesa? ¡Escríbenos!`,
    }]);
    setCurrentTenantId(id);
    setCurrentModule('dashboard');
    showToast(`Comercio "${name}" creado y guardado`);
  }, [showToast]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value: AppContextValue = {
    tenants, currentTenantId, currentRole, currentUser,
    products, categories, sales, movements, templates,
    currentModule, sidebarOpen, toast,
    currentTenant, tenantProducts, tenantCategories, tenantSales, tenantMovements, tenantTemplates,
    selectTenant, setRole, setModule: setCurrentModule,
    toggleSidebar: () => setSidebarOpen(v => !v),
    addProduct, updateProduct, deleteProduct, addSale, adjustStock,
    addTemplate, updateTemplate, deleteTemplate, addCategory, addTenant,
    showToast, formatCurrency, clearPersistedData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
