import { Tenant, Category, Product, Sale, InventoryMovement, WhatsAppTemplate, AppUser } from './types';

export const TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'Moda & Calzado Urbano',
    slug: 'moda-urbana',
    phone: '51987654321',
    address: 'Av. Larco 1240, Miraflores, Lima',
    plan: 'pro',
    currency: 'PEN',
    currencySymbol: 'S/',
    primaryColor: '#ec4899',
  },
  {
    id: 't2',
    name: 'TecnoExpress Gadgets',
    slug: 'tecnoexpress',
    phone: '51976543210',
    address: 'Centro Comercial Jockey Plaza, Loc. 245, Santiago de Surco, Lima',
    plan: 'starter',
    currency: 'PEN',
    currencySymbol: 'S/',
    primaryColor: '#3b82f6',
  },
];

export const CATEGORIES: Category[] = [
  { id: 'c1', tenantId: 't1', name: 'Ropa', color: '#ec4899' },
  { id: 'c2', tenantId: 't1', name: 'Calzado', color: '#f59e0b' },
  { id: 'c3', tenantId: 't1', name: 'Accesorios', color: '#8b5cf6' },
  { id: 'c4', tenantId: 't2', name: 'Smartphones', color: '#3b82f6' },
  { id: 'c5', tenantId: 't2', name: 'Audio', color: '#10b981' },
  { id: 'c6', tenantId: 't2', name: 'Computación', color: '#f59e0b' },
  { id: 'c7', tenantId: 't2', name: 'Accesorios Tech', color: '#8b5cf6' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1', tenantId: 't1', name: 'Campera Bomber Oversize', sku: 'ROB-001',
    description: 'Campera bomber de nylon con interior de felpa. Corte oversize, ideal para looks urbanos. Disponible en negro y verde militar.',
    price: 189, cost: 85, categoryId: 'c1',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop&auto=format',
    stock: 18, minStock: 5, tags: ['bomber', 'invierno', 'mujer'], active: true, createdAt: '2025-03-10T10:00:00Z',
  },
  {
    id: 'p2', tenantId: 't1', name: 'Zapatillas Urban Low', sku: 'ZAP-042',
    description: 'Zapatilla urbana de suela baja. Upper de cuero sintético con detalles en mesh. Suela de goma vulcanizada antideslizante.',
    price: 259, cost: 128, categoryId: 'c2',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format',
    stock: 3, minStock: 5, tags: ['zapatillas', 'urbano', 'unisex'], active: true, createdAt: '2025-03-12T11:00:00Z',
  },
  {
    id: 'p3', tenantId: 't1', name: 'Jean Straight Leg Vintage', sku: 'JEA-087',
    description: 'Jean de corte recto con efecto vintage. Tiro medio, fit relajado. 98% algodón, 2% elastano. Fabricado en Lima.',
    price: 149, cost: 62, categoryId: 'c1',
    imageUrl: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=400&fit=crop&auto=format',
    stock: 22, minStock: 8, tags: ['jean', 'vintage', 'casual'], active: true, createdAt: '2025-03-15T09:30:00Z',
  },
  {
    id: 'p4', tenantId: 't1', name: 'Cartera Crossbody Mini', sku: 'ACC-019',
    description: 'Cartera crossbody de cuero vegano. Cadena dorada de 120 cm. Cierre con solapa magnética. 3 compartimentos internos.',
    price: 99, cost: 38, categoryId: 'c3',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop&auto=format',
    stock: 0, minStock: 3, tags: ['cartera', 'accesorios', 'mujer'], active: true, createdAt: '2025-03-18T14:00:00Z',
  },
  {
    id: 'p5', tenantId: 't1', name: 'Gorra Dad Hat Bordada', sku: 'ACC-034',
    description: 'Gorra estilo dad hat de algodón con bordado frontal. Cierre trasero ajustable con hebilla metálica.',
    price: 45, cost: 17, categoryId: 'c3',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop&auto=format',
    stock: 35, minStock: 10, tags: ['gorra', 'cap', 'unisex'], active: true, createdAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 'p6', tenantId: 't1', name: 'Buzo Hoodie Fleece Premium', sku: 'ROB-028',
    description: 'Hoodie de algodón fleece 350g. Cordones planos, bolsillo canguro. Corte regular, ribetes elastizados.',
    price: 169, cost: 74, categoryId: 'c1',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=400&fit=crop&auto=format',
    stock: 4, minStock: 5, tags: ['hoodie', 'invierno', 'unisex'], active: true, createdAt: '2025-04-05T08:00:00Z',
  },
  {
    id: 'p7', tenantId: 't2', name: 'Samsung Galaxy A55 5G', sku: 'SAM-A55-256',
    description: 'Pantalla Super AMOLED 6.6" 120Hz. Procesador Exynos 1480. 8GB RAM / 256GB. Cámara triple 50+12+5 MP. Batería 5000mAh.',
    price: 1299, cost: 890, categoryId: 'c4',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop&auto=format',
    stock: 7, minStock: 3, tags: ['samsung', '5g', 'smartphone'], active: true, createdAt: '2025-02-20T09:00:00Z',
  },
  {
    id: 'p8', tenantId: 't2', name: 'AirPods Pro 2da Gen', sku: 'APL-APP2-MQ',
    description: 'Cancelación activa de ruido H2. Modo transparencia adaptativo. Estuche MagSafe. Hasta 30h con estuche. Audio espacial personalizado.',
    price: 879, cost: 615, categoryId: 'c5',
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop&auto=format',
    stock: 2, minStock: 3, tags: ['apple', 'airpods', 'audio'], active: true, createdAt: '2025-02-25T11:00:00Z',
  },
  {
    id: 'p9', tenantId: 't2', name: 'Notebook Lenovo IdeaPad 5', sku: 'LEN-IP5-I7',
    description: 'Intel Core i7-13620H. RAM 16GB DDR5. SSD 512GB NVMe. Pantalla 15.6" FHD IPS. 2x USB-C Thunderbolt. Batería 73Wh.',
    price: 3490, cost: 2490, categoryId: 'c6',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&auto=format',
    stock: 0, minStock: 2, tags: ['lenovo', 'notebook', 'intel'], active: true, createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'p10', tenantId: 't2', name: 'Cargador GaN 65W USB-C', sku: 'ACC-GAN65',
    description: 'Tecnología GaN tercera generación. 65W máximo. 2x USB-C + 1x USB-A. Carga rápida PD 3.0 y QC 4+. Tamaño compacto de viaje.',
    price: 89, cost: 40, categoryId: 'c7',
    imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop&auto=format',
    stock: 24, minStock: 8, tags: ['cargador', 'gan', 'usb-c'], active: true, createdAt: '2025-03-10T12:00:00Z',
  },
  {
    id: 'p11', tenantId: 't2', name: 'Tablet Xiaomi Pad 6', sku: 'XIL-PAD6-128',
    description: 'Snapdragon 870. Pantalla IPS 11" 144Hz 2880×1800. 6GB RAM / 128GB. Cámara 13MP. Altavoces estéreo Dolby Atmos. 8840mAh.',
    price: 1190, cost: 825, categoryId: 'c4',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop&auto=format',
    stock: 5, minStock: 2, tags: ['xiaomi', 'tablet', 'android'], active: true, createdAt: '2025-03-15T09:00:00Z',
  },
  {
    id: 'p12', tenantId: 't2', name: 'Sony WH-1000XM5', sku: 'SNY-XM5-BK',
    description: 'Cancelación de ruido líder del mercado. 30h de autonomía. Llamadas de 4 micrófonos. Carga rápida 3min=3h. Audio LDAC Hi-Res.',
    price: 879, cost: 575, categoryId: 'c5',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format',
    stock: 9, minStock: 3, tags: ['sony', 'headphones', 'anc'], active: true, createdAt: '2025-03-20T14:00:00Z',
  },
];

export const SALES: Sale[] = [
  {
    id: 's1', tenantId: 't1', customerName: 'Valentina Ríos Huanca', customerPhone: '51987123456',
    items: [{ productId: 'p1', productName: 'Campera Bomber Oversize', quantity: 1, price: 189 }],
    total: 189, channel: 'whatsapp', status: 'delivered', createdAt: '2025-05-03T10:30:00Z',
  },
  {
    id: 's2', tenantId: 't1', customerName: 'Matías Córdoba Vega', customerPhone: '51956789012',
    items: [
      { productId: 'p3', productName: 'Jean Straight Leg Vintage', quantity: 1, price: 149 },
      { productId: 'p5', productName: 'Gorra Dad Hat Bordada', quantity: 2, price: 45 },
    ],
    total: 239, channel: 'pos', status: 'delivered', createdAt: '2025-05-03T12:15:00Z',
  },
  {
    id: 's3', tenantId: 't1', customerName: 'Lucía Fernández Palomino', customerPhone: '51945678901',
    items: [{ productId: 'p2', productName: 'Zapatillas Urban Low', quantity: 1, price: 259 }],
    total: 259, channel: 'whatsapp', status: 'confirmed', createdAt: '2025-05-03T14:00:00Z',
  },
  {
    id: 's4', tenantId: 't1', customerName: 'Diego Morales Quispe', customerPhone: '51934567890',
    items: [{ productId: 'p6', productName: 'Buzo Hoodie Fleece Premium', quantity: 1, price: 169 }],
    total: 169, channel: 'whatsapp', status: 'pending', createdAt: '2025-05-03T16:45:00Z',
  },
  {
    id: 's5', tenantId: 't1', customerName: 'Camila Suárez Mendoza', customerPhone: '51923456789',
    items: [
      { productId: 'p1', productName: 'Campera Bomber Oversize', quantity: 1, price: 189 },
      { productId: 'p4', productName: 'Cartera Crossbody Mini', quantity: 1, price: 99 },
    ],
    total: 288, channel: 'web', status: 'pending', createdAt: '2025-05-03T18:00:00Z',
  },
  {
    id: 's6', tenantId: 't2', customerName: 'Federico Ibáñez Torres', customerPhone: '51978901234',
    items: [{ productId: 'p7', productName: 'Samsung Galaxy A55 5G', quantity: 1, price: 1299 }],
    total: 1299, channel: 'whatsapp', status: 'delivered', createdAt: '2025-05-03T11:00:00Z',
  },
  {
    id: 's7', tenantId: 't2', customerName: 'Ana Gutiérrez Llanos', customerPhone: '51989012345',
    items: [
      { productId: 'p8', productName: 'AirPods Pro 2da Gen', quantity: 1, price: 879 },
      { productId: 'p10', productName: 'Cargador GaN 65W USB-C', quantity: 1, price: 89 },
    ],
    total: 968, channel: 'pos', status: 'delivered', createdAt: '2025-05-03T13:30:00Z',
  },
  {
    id: 's8', tenantId: 't2', customerName: 'Rodrigo Vega Cárdenas', customerPhone: '51990123456',
    items: [{ productId: 'p12', productName: 'Sony WH-1000XM5', quantity: 1, price: 879 }],
    total: 879, channel: 'whatsapp', status: 'confirmed', createdAt: '2025-05-03T15:00:00Z',
  },
];

export const MOVEMENTS: InventoryMovement[] = [
  { id: 'm1', tenantId: 't1', productId: 'p1', productName: 'Campera Bomber Oversize', type: 'COMPRA', quantityBefore: 10, quantityAfter: 25, delta: 15, justification: 'Reposición temporada invierno — proveedor Gamarra', userId: 'u1', createdAt: '2025-04-28T09:00:00Z' },
  { id: 'm2', tenantId: 't1', productId: 'p2', productName: 'Zapatillas Urban Low', type: 'SALIDA_VENTA', quantityBefore: 8, quantityAfter: 7, delta: -1, justification: 'Venta #s1', userId: 'u2', createdAt: '2025-05-01T10:30:00Z' },
  { id: 'm3', tenantId: 't1', productId: 'p4', productName: 'Cartera Crossbody Mini', type: 'MERMA', quantityBefore: 3, quantityAfter: 0, delta: -3, justification: 'Daño en almacén — humedad en depósito', userId: 'u1', createdAt: '2025-05-02T11:00:00Z' },
  { id: 'm4', tenantId: 't1', productId: 'p6', productName: 'Buzo Hoodie Fleece Premium', type: 'AJUSTE_MANUAL', quantityBefore: 6, quantityAfter: 4, delta: -2, justification: 'Corrección inventario físico — diferencia en conteo', userId: 'u1', createdAt: '2025-05-02T14:00:00Z' },
  { id: 'm5', tenantId: 't1', productId: 'p1', productName: 'Campera Bomber Oversize', type: 'SALIDA_VENTA', quantityBefore: 20, quantityAfter: 18, delta: -2, justification: 'Venta #s2 y #s5', userId: 'u2', createdAt: '2025-05-03T10:30:00Z' },
  { id: 'm6', tenantId: 't1', productId: 'p3', productName: 'Jean Straight Leg Vintage', type: 'SALIDA_VENTA', quantityBefore: 23, quantityAfter: 22, delta: -1, justification: 'Venta #s2', userId: 'u2', createdAt: '2025-05-03T12:15:00Z' },
  { id: 'm7', tenantId: 't2', productId: 'p7', productName: 'Samsung Galaxy A55 5G', type: 'COMPRA', quantityBefore: 5, quantityAfter: 10, delta: 5, justification: 'Reposición stock — importadora Lince', userId: 'u3', createdAt: '2025-04-30T10:00:00Z' },
  { id: 'm8', tenantId: 't2', productId: 'p9', productName: 'Notebook Lenovo IdeaPad 5', type: 'SALIDA_VENTA', quantityBefore: 2, quantityAfter: 0, delta: -2, justification: 'Ventas agotaron stock disponible', userId: 'u4', createdAt: '2025-05-02T16:00:00Z' },
  { id: 'm9', tenantId: 't2', productId: 'p8', productName: 'AirPods Pro 2da Gen', type: 'SALIDA_VENTA', quantityBefore: 3, quantityAfter: 2, delta: -1, justification: 'Venta #s7', userId: 'u4', createdAt: '2025-05-03T13:30:00Z' },
  { id: 'm10', tenantId: 't2', productId: 'p10', productName: 'Cargador GaN 65W USB-C', type: 'DEVOLUCION', quantityBefore: 23, quantityAfter: 24, delta: 1, justification: 'Devolución cliente — cambio en garantía', userId: 'u3', createdAt: '2025-05-03T15:00:00Z' },
];

export const TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl1', tenantId: 't1', name: 'Presentación de producto', isDefault: true,
    body: `¡Hola! 👋 Te presento este artículo de *{nombre_tienda}*:\n\n📦 *{producto}*\n💰 Precio: *{precio}*\n🏷️ SKU: {sku}\n\n{descripcion}\n\n🔗 Ver en catálogo: {link_catalogo}\n\n¿Te interesa? ¡Escríbenos!`,
  },
  {
    id: 'tpl2', tenantId: 't1', name: 'Oferta especial', isDefault: false,
    body: `🔥 *OFERTA ESPECIAL* de {nombre_tienda}!\n\n✨ *{producto}*\n💥 Solo por hoy: *{precio}*\n\n¡Últimas unidades disponibles! Responde este mensaje para reservar el tuyo. 🛍️`,
  },
  {
    id: 'tpl3', tenantId: 't2', name: 'Presentación de producto', isDefault: true,
    body: `¡Hola! 📱 Te compartimos este producto de *{nombre_tienda}*:\n\n🛒 *{producto}*\n💳 Precio: *{precio}*\n📌 Código: {sku}\n\n{descripcion}\n\n🌐 Catálogo completo: {link_catalogo}\n\n¿Consultas? ¡Estamos para ayudarte! ⚡`,
  },
  {
    id: 'tpl4', tenantId: 't2', name: 'Stock limitado', isDefault: false,
    body: `⚠️ *ÚLTIMAS UNIDADES* — {nombre_tienda}\n\n📦 *{producto}*\n💰 Precio: *{precio}*\n\n¡No te quedes sin el tuyo! Stock muy limitado.\n👉 Responde ahora para apartar.`,
  },
];

export const USERS: AppUser[] = [
  { id: 'u1', name: 'Sofía González Paredes', email: 'sofia@moda-urbana.pe', role: 'admin', tenantId: 't1', avatar: 'SG' },
  { id: 'u2', name: 'Pablo Méndez Huanca', email: 'pablo@moda-urbana.pe', role: 'seller', tenantId: 't1', avatar: 'PM' },
  { id: 'u3', name: 'Carlos Ruiz Ccoa', email: 'carlos@tecnoexpress.pe', role: 'admin', tenantId: 't2', avatar: 'CR' },
  { id: 'u4', name: 'Laura Torres Quispe', email: 'laura@tecnoexpress.pe', role: 'seller', tenantId: 't2', avatar: 'LT' },
];

export const WEEKLY_SALES = {
  t1: [
    { label: 'Lun', value: 980 },
    { label: 'Mar', value: 745 },
    { label: 'Mié', value: 1340 },
    { label: 'Jue', value: 1090 },
    { label: 'Vie', value: 1870 },
    { label: 'Sáb', value: 2450 },
    { label: 'Dom', value: 1145 },
  ],
  t2: [
    { label: 'Lun', value: 3490 },
    { label: 'Mar', value: 5820 },
    { label: 'Mié', value: 2960 },
    { label: 'Jue', value: 7340 },
    { label: 'Vie', value: 9870 },
    { label: 'Sáb', value: 6140 },
    { label: 'Dom', value: 4380 },
  ],
};
