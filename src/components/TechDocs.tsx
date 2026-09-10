import { useState } from 'react';

const DDL = `-- ============================================================
-- CatalogoPro — Esquema PostgreSQL Multi-Tenant (v1.0)
-- Arquitectura: Shared Database, Row-Level Tenant Isolation
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comercios (tenants)
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120)  NOT NULL,
  slug          VARCHAR(60)   NOT NULL UNIQUE,
  phone         VARCHAR(20)   NOT NULL,
  address       TEXT,
  plan          VARCHAR(20)   NOT NULL DEFAULT 'starter',
  currency      CHAR(3)       NOT NULL DEFAULT 'ARS',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Usuarios del sistema
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email         VARCHAR(255)  NOT NULL,
  name          VARCHAR(120)  NOT NULL,
  password_hash TEXT          NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'seller',
  active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tenant_email UNIQUE (tenant_id, email),
  CONSTRAINT chk_role CHECK (role IN ('admin','seller','viewer'))
);

-- Categorías de productos
CREATE TABLE categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          VARCHAR(80)   NOT NULL,
  color         CHAR(7)       NOT NULL DEFAULT '#64748b',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tenant_category UNIQUE (tenant_id, name)
);

-- Catálogo de productos
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(200)  NOT NULL,
  description   TEXT,
  price         NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  cost          NUMERIC(12,2)          CHECK (cost  >= 0),
  sku           VARCHAR(60)   NOT NULL,
  image_url     TEXT,
  stock         INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock     INTEGER       NOT NULL DEFAULT 5,
  tags          TEXT[]        NOT NULL DEFAULT '{}',
  active        BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_tenant_sku UNIQUE (tenant_id, sku)
);

-- Pedidos / Ventas
CREATE TABLE sales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_name VARCHAR(120),
  customer_phone VARCHAR(20),
  channel       VARCHAR(20)   NOT NULL DEFAULT 'pos',
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending',
  total         NUMERIC(14,2) NOT NULL,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_channel CHECK (channel IN ('pos','whatsapp','web')),
  CONSTRAINT chk_status  CHECK (status  IN ('pending','confirmed','delivered','cancelled'))
);

-- Ítems del pedido
CREATE TABLE sale_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id       UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  product_name  VARCHAR(200)  NOT NULL,
  quantity      INTEGER       NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(12,2) NOT NULL
);

-- Kardex — Historial inmutable de movimientos de inventario
CREATE TABLE inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products(id),
  product_name    VARCHAR(200) NOT NULL,
  type            VARCHAR(20)  NOT NULL,
  quantity_before INTEGER      NOT NULL,
  quantity_after  INTEGER      NOT NULL,
  delta           INTEGER      NOT NULL,
  justification   TEXT         NOT NULL,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_movement_type CHECK (type IN ('COMPRA','SALIDA_VENTA','AJUSTE_MANUAL','MERMA','DEVOLUCION'))
);

-- Plantillas de mensaje WhatsApp
CREATE TABLE whatsapp_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          VARCHAR(120)  NOT NULL,
  body          TEXT          NOT NULL,
  is_default    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Registro de actividad (audit log)
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id),
  action        VARCHAR(80)   NOT NULL,
  entity        VARCHAR(40),
  entity_id     UUID,
  details       JSONB,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX idx_products_tenant      ON products(tenant_id, active);
CREATE INDEX idx_sales_tenant_date    ON sales(tenant_id, created_at DESC);
CREATE INDEX idx_movements_product    ON inventory_movements(product_id, created_at DESC);
CREATE INDEX idx_movements_tenant     ON inventory_movements(tenant_id, created_at DESC);
CREATE INDEX idx_activity_tenant      ON activity_logs(tenant_id, created_at DESC);

-- Row-Level Security (RLS) para aislamiento de datos
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales                ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs        ENABLE ROW LEVEL SECURITY;

-- Política ejemplo (repetir para cada tabla)
CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
`;

const SEED = `-- ============================================================
-- Datos de ejemplo (seed)
-- ============================================================

INSERT INTO tenants (name, slug, phone, address, plan)
VALUES
  ('Moda & Calzado Urbano', 'moda-urbana', '5491112345678', 'Av. Santa Fe 1234, CABA', 'pro'),
  ('TecnoExpress Gadgets', 'tecnoexpress', '5491187654321', 'Galería Pacífico, Local 45', 'starter');

-- Insertar admin de cada tenant
INSERT INTO users (tenant_id, email, name, password_hash, role)
SELECT id, 'admin@moda-urbana.com', 'Sofía González',
       crypt('Admin1234!', gen_salt('bf')), 'admin'
FROM tenants WHERE slug = 'moda-urbana';

INSERT INTO users (tenant_id, email, name, password_hash, role)
SELECT id, 'admin@tecnoexpress.com', 'Carlos Ruiz',
       crypt('Admin1234!', gen_salt('bf')), 'admin'
FROM tenants WHERE slug = 'tecnoexpress';
`;

const ENDPOINTS = [
  { method: 'POST', path: '/auth/login', desc: 'Autenticación JWT', auth: false },
  { method: 'POST', path: '/auth/register', desc: 'Registro de nuevo tenant', auth: false },
  { method: 'GET', path: '/products', desc: 'Listar productos del tenant', auth: true },
  { method: 'POST', path: '/products', desc: 'Crear producto', auth: true },
  { method: 'PUT', path: '/products/:id', desc: 'Editar producto', auth: true },
  { method: 'DELETE', path: '/products/:id', desc: 'Eliminar producto', auth: true },
  { method: 'POST', path: '/products/bulk-import', desc: 'Importar CSV', auth: true },
  { method: 'GET', path: '/inventory', desc: 'Estado de inventario', auth: true },
  { method: 'POST', path: '/inventory/adjust', desc: 'Ajuste manual de stock', auth: true },
  { method: 'GET', path: '/inventory/movements', desc: 'Kardex de movimientos', auth: true },
  { method: 'GET', path: '/sales', desc: 'Listar ventas', auth: true },
  { method: 'POST', path: '/sales', desc: 'Registrar venta', auth: true },
  { method: 'GET', path: '/templates', desc: 'Plantillas WhatsApp', auth: true },
  { method: 'POST', path: '/templates', desc: 'Crear plantilla', auth: true },
  { method: 'GET', path: '/public/catalog/:slug', desc: 'Catálogo público (sin auth)', auth: false },
  { method: 'GET', path: '/dashboard/metrics', desc: 'Métricas del dashboard', auth: true },
];

const methodColor: Record<string, string> = {
  GET: 'text-ok bg-ok/10 border-ok/30',
  POST: 'text-info bg-info/10 border-info/30',
  PUT: 'text-warn bg-warn/10 border-warn/30',
  DELETE: 'text-danger bg-danger/10 border-danger/30',
};

const ER_SVG = `
<svg viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" font-family="JetBrains Mono, monospace">
  <!-- tenants -->
  <rect x="10" y="10" width="160" height="160" rx="6" fill="#0c1a2e" stroke="#25D366" stroke-width="1.5"/>
  <rect x="10" y="10" width="160" height="28" rx="6" fill="#25D366"/>
  <text x="90" y="28" text-anchor="middle" fill="#001a09" font-size="11" font-weight="bold">tenants</text>
  <text x="20" y="55" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="20" y="70" fill="#94a3b8" font-size="9">name VARCHAR</text>
  <text x="20" y="85" fill="#94a3b8" font-size="9">slug VARCHAR UNIQUE</text>
  <text x="20" y="100" fill="#94a3b8" font-size="9">phone VARCHAR</text>
  <text x="20" y="115" fill="#94a3b8" font-size="9">plan VARCHAR</text>
  <text x="20" y="130" fill="#94a3b8" font-size="9">currency CHAR(3)</text>
  <text x="20" y="145" fill="#94a3b8" font-size="9">created_at TIMESTAMPTZ</text>

  <!-- users -->
  <rect x="10" y="200" width="160" height="150" rx="6" fill="#0c1a2e" stroke="#3b82f6" stroke-width="1.5"/>
  <rect x="10" y="200" width="160" height="28" rx="6" fill="#3b82f6"/>
  <text x="90" y="218" text-anchor="middle" fill="white" font-size="11" font-weight="bold">users</text>
  <text x="20" y="245" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="20" y="260" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="20" y="275" fill="#94a3b8" font-size="9">email VARCHAR</text>
  <text x="20" y="290" fill="#94a3b8" font-size="9">name VARCHAR</text>
  <text x="20" y="305" fill="#94a3b8" font-size="9">role VARCHAR</text>
  <text x="20" y="320" fill="#94a3b8" font-size="9">active BOOLEAN</text>

  <!-- categories -->
  <rect x="200" y="10" width="160" height="120" rx="6" fill="#0c1a2e" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="200" y="10" width="160" height="28" rx="6" fill="#f59e0b"/>
  <text x="280" y="28" text-anchor="middle" fill="#001a09" font-size="11" font-weight="bold">categories</text>
  <text x="210" y="55" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="210" y="70" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="210" y="85" fill="#94a3b8" font-size="9">name VARCHAR</text>
  <text x="210" y="100" fill="#94a3b8" font-size="9">color CHAR(7)</text>
  <text x="210" y="115" fill="#94a3b8" font-size="9">created_at TIMESTAMPTZ</text>

  <!-- products -->
  <rect x="200" y="155" width="170" height="200" rx="6" fill="#0c1a2e" stroke="#8b5cf6" stroke-width="1.5"/>
  <rect x="200" y="155" width="170" height="28" rx="6" fill="#8b5cf6"/>
  <text x="285" y="173" text-anchor="middle" fill="white" font-size="11" font-weight="bold">products</text>
  <text x="210" y="200" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="210" y="215" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="210" y="230" fill="#94a3b8" font-size="9">🔗 category_id UUID FK</text>
  <text x="210" y="245" fill="#94a3b8" font-size="9">name VARCHAR</text>
  <text x="210" y="260" fill="#94a3b8" font-size="9">sku VARCHAR (UNIQUE)</text>
  <text x="210" y="275" fill="#94a3b8" font-size="9">price NUMERIC</text>
  <text x="210" y="290" fill="#94a3b8" font-size="9">stock INTEGER ≥ 0</text>
  <text x="210" y="305" fill="#94a3b8" font-size="9">min_stock INTEGER</text>
  <text x="210" y="320" fill="#94a3b8" font-size="9">tags TEXT[]</text>
  <text x="210" y="335" fill="#94a3b8" font-size="9">active BOOLEAN</text>

  <!-- sales -->
  <rect x="400" y="10" width="170" height="165" rx="6" fill="#0c1a2e" stroke="#ec4899" stroke-width="1.5"/>
  <rect x="400" y="10" width="170" height="28" rx="6" fill="#ec4899"/>
  <text x="485" y="28" text-anchor="middle" fill="white" font-size="11" font-weight="bold">sales</text>
  <text x="410" y="55" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="410" y="70" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="410" y="85" fill="#94a3b8" font-size="9">customer_name VARCHAR</text>
  <text x="410" y="100" fill="#94a3b8" font-size="9">customer_phone VARCHAR</text>
  <text x="410" y="115" fill="#94a3b8" font-size="9">channel VARCHAR</text>
  <text x="410" y="130" fill="#94a3b8" font-size="9">status VARCHAR</text>
  <text x="410" y="145" fill="#94a3b8" font-size="9">total NUMERIC</text>
  <text x="410" y="160" fill="#94a3b8" font-size="9">created_at TIMESTAMPTZ</text>

  <!-- sale_items -->
  <rect x="400" y="200" width="170" height="130" rx="6" fill="#0c1a2e" stroke="#10b981" stroke-width="1.5"/>
  <rect x="400" y="200" width="170" height="28" rx="6" fill="#10b981"/>
  <text x="485" y="218" text-anchor="middle" fill="#001a09" font-size="11" font-weight="bold">sale_items</text>
  <text x="410" y="245" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="410" y="260" fill="#94a3b8" font-size="9">🔗 sale_id UUID FK</text>
  <text x="410" y="275" fill="#94a3b8" font-size="9">🔗 product_id UUID FK</text>
  <text x="410" y="290" fill="#94a3b8" font-size="9">quantity INTEGER</text>
  <text x="410" y="305" fill="#94a3b8" font-size="9">unit_price NUMERIC</text>

  <!-- inventory_movements -->
  <rect x="600" y="10" width="185" height="200" rx="6" fill="#0c1a2e" stroke="#f59e0b" stroke-width="1.5"/>
  <rect x="600" y="10" width="185" height="28" rx="6" fill="#f59e0b"/>
  <text x="692" y="28" text-anchor="middle" fill="#001a09" font-size="11" font-weight="bold">inventory_movements</text>
  <text x="610" y="55" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="610" y="70" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="610" y="85" fill="#94a3b8" font-size="9">🔗 product_id UUID FK</text>
  <text x="610" y="100" fill="#94a3b8" font-size="9">type VARCHAR</text>
  <text x="610" y="115" fill="#94a3b8" font-size="9">quantity_before INT</text>
  <text x="610" y="130" fill="#94a3b8" font-size="9">quantity_after INT</text>
  <text x="610" y="145" fill="#94a3b8" font-size="9">delta INTEGER</text>
  <text x="610" y="160" fill="#94a3b8" font-size="9">justification TEXT</text>
  <text x="610" y="175" fill="#94a3b8" font-size="9">created_by UUID FK</text>
  <text x="610" y="190" fill="#94a3b8" font-size="9">created_at TIMESTAMPTZ</text>

  <!-- whatsapp_templates -->
  <rect x="600" y="230" width="185" height="130" rx="6" fill="#0c1a2e" stroke="#25D366" stroke-width="1.5"/>
  <rect x="600" y="230" width="185" height="28" rx="6" fill="#25D366"/>
  <text x="692" y="248" text-anchor="middle" fill="#001a09" font-size="11" font-weight="bold">whatsapp_templates</text>
  <text x="610" y="275" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="610" y="290" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="610" y="305" fill="#94a3b8" font-size="9">name VARCHAR</text>
  <text x="610" y="320" fill="#94a3b8" font-size="9">body TEXT</text>
  <text x="610" y="335" fill="#94a3b8" font-size="9">is_default BOOLEAN</text>

  <!-- activity_logs -->
  <rect x="200" y="385" width="560" height="110" rx="6" fill="#0c1a2e" stroke="#64748b" stroke-width="1.5"/>
  <rect x="200" y="385" width="560" height="28" rx="6" fill="#4a6080"/>
  <text x="480" y="403" text-anchor="middle" fill="white" font-size="11" font-weight="bold">activity_logs (audit trail)</text>
  <text x="210" y="430" fill="#e2e8f0" font-size="9">🔑 id UUID PK</text>
  <text x="350" y="430" fill="#94a3b8" font-size="9">🔗 tenant_id UUID FK</text>
  <text x="510" y="430" fill="#94a3b8" font-size="9">🔗 user_id UUID FK</text>
  <text x="210" y="448" fill="#94a3b8" font-size="9">action VARCHAR</text>
  <text x="350" y="448" fill="#94a3b8" font-size="9">entity VARCHAR</text>
  <text x="510" y="448" fill="#94a3b8" font-size="9">entity_id UUID</text>
  <text x="210" y="466" fill="#94a3b8" font-size="9">details JSONB</text>
  <text x="350" y="466" fill="#94a3b8" font-size="9">created_at TIMESTAMPTZ</text>

  <!-- Relationship lines -->
  <line x1="170" y1="80" x2="200" y2="80" stroke="#25D366" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="170" y1="270" x2="200" y2="270" stroke="#3b82f6" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="285" y1="130" x2="285" y2="155" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="370" y1="255" x2="400" y2="255" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="370" y1="230" x2="400" y2="95" stroke="#ec4899" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="485" y1="175" x2="485" y2="200" stroke="#ec4899" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="570" y1="275" x2="600" y2="90" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
</svg>`;

export default function TechDocs() {
  const [tab, setTab] = useState<'arch' | 'er' | 'ddl' | 'api'>('arch');

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-hi">Documentación Técnica</h1>
        <p className="text-xs text-dim font-mono mt-0.5">Arquitectura, esquema de BD y API</p>
      </div>

      <div className="flex gap-1 bg-surface border border-edge rounded-lg p-0.5 w-fit flex-wrap">
        {[
          { k: 'arch', l: '🏗 Arquitectura' },
          { k: 'er', l: '🗂 Diagrama ER' },
          { k: 'ddl', l: '💾 DDL SQL' },
          { k: 'api', l: '🔌 API Endpoints' },
        ].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as typeof tab)}
            className={`px-4 py-1.5 text-xs rounded cursor-pointer transition-all ${tab === k ? 'bg-panel text-hi font-medium' : 'text-dim hover:text-mid'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'arch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-surface border border-edge rounded-xl p-5">
              <h2 className="text-sm font-bold text-hi mb-3">Stack Tecnológico</h2>
              <div className="space-y-2">
                {[
                  { layer: 'Frontend', tech: 'React 19 + TypeScript + Vite + Tailwind CSS v4', color: 'text-info' },
                  { layer: 'Backend', tech: 'Node.js + NestJS + TypeORM', color: 'text-ok' },
                  { layer: 'Base de Datos', tech: 'PostgreSQL 16 + Row-Level Security (RLS)', color: 'text-warn' },
                  { layer: 'Autenticación', tech: 'JWT HS256 + bcrypt + OAuth2 (Google)', color: 'text-purple' },
                  { layer: 'Almacenamiento', tech: 'AWS S3 / Cloudinary para imágenes', color: 'text-danger' },
                  { layer: 'Cache', tech: 'Redis — catálogo público y sesiones', color: 'text-wapp' },
                  { layer: 'Deploy', tech: 'Vercel (frontend) + Railway (backend + DB)', color: 'text-mid' },
                ].map(({ layer, tech, color }) => (
                  <div key={layer} className="flex gap-3 items-start">
                    <span className={`text-xs font-mono font-bold ${color} w-28 shrink-0`}>{layer}</span>
                    <span className="text-xs text-mid">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-edge rounded-xl p-5">
              <h2 className="text-sm font-bold text-hi mb-3">Modelo Multi-Tenant</h2>
              <div className="text-xs text-mid space-y-2 font-inter leading-relaxed">
                <p><strong className="text-hi">Shared Database, Row-Level Isolation:</strong> Todas las tablas incluyen una columna <code className="font-mono text-wapp bg-wapp/10 px-1 rounded">tenant_id UUID</code> con FK a <code className="font-mono text-wapp bg-wapp/10 px-1 rounded">tenants</code>.</p>
                <p><strong className="text-hi">Row-Level Security (RLS):</strong> PostgreSQL aplica políticas que filtran automáticamente por <code className="font-mono text-wapp bg-wapp/10 px-1 rounded">current_setting('app.current_tenant_id')</code>.</p>
                <p><strong className="text-hi">JWT Claims:</strong> El token incluye <code className="font-mono text-wapp bg-wapp/10 px-1 rounded">tenant_id</code> y <code className="font-mono text-wapp bg-wapp/10 px-1 rounded">role</code>; el middleware los inyecta en el contexto PostgreSQL.</p>
                <p><strong className="text-hi">Constraints:</strong> Unicidades compuestas como <code className="font-mono text-wapp bg-wapp/10 px-1 rounded">UNIQUE(tenant_id, sku)</code> garantizan aislamiento a nivel de índice.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-surface border border-edge rounded-xl p-5">
              <h2 className="text-sm font-bold text-hi mb-3">Fases de Desarrollo</h2>
              {[
                { phase: 'FASE 1 — MVP', items: ['Auth + registro de tenants', 'CRUD productos + imágenes', 'Dashboard básico', 'Links WhatsApp', 'Inventario básico'], color: 'border-wapp text-wapp' },
                { phase: 'FASE 2 — Avanzado', items: ['Carga masiva CSV/Excel', 'Analytics avanzados', 'WhatsApp Business API webhooks', 'Notificaciones push', 'Múltiples métodos de pago'], color: 'border-info text-info' },
                { phase: 'FASE 3 — Escala', items: ['Suscripciones + billing', 'API pública + webhooks', 'App móvil nativa (React Native)', 'Marketplace de plantillas'], color: 'border-purple text-purple' },
              ].map(({ phase, items, color }) => (
                <div key={phase} className={`border-l-2 pl-4 mb-4 ${color}`}>
                  <p className="text-xs font-bold font-mono mb-2">{phase}</p>
                  <ul className="space-y-1">
                    {items.map(i => <li key={i} className="text-xs text-mid flex items-center gap-1.5"><span className="text-[8px]">●</span>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-surface border border-edge rounded-xl p-5">
              <h2 className="text-sm font-bold text-hi mb-3">Roles y Permisos (RBAC)</h2>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-edge">
                    <th className="text-left py-2 text-dim font-mono">Módulo</th>
                    <th className="text-center py-2 text-dim font-mono">Admin</th>
                    <th className="text-center py-2 text-dim font-mono">Vendedor</th>
                    <th className="text-center py-2 text-dim font-mono">Auditor</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Dashboard', '✓', '—', '✓'],
                    ['Catálogo (CRUD)', '✓', 'R/W', 'R'],
                    ['Inventario (ajustar)', '✓', '✓', 'R'],
                    ['Punto de Venta', '✓', '✓', '—'],
                    ['WhatsApp Manager', '✓', '✓', '—'],
                    ['Tienda pública', '✓', '✓', '✓'],
                    ['Configuración', '✓', '—', '—'],
                    ['Exportar datos', '✓', '—', '✓'],
                  ].map(([m, a, s, v]) => (
                    <tr key={m} className="border-b border-edge/30">
                      <td className="py-1.5 text-mid">{m}</td>
                      <td className="py-1.5 text-center text-ok">{a}</td>
                      <td className="py-1.5 text-center text-info">{s}</td>
                      <td className="py-1.5 text-center text-purple">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'er' && (
        <div className="bg-surface border border-edge rounded-xl p-6">
          <h2 className="text-sm font-bold text-hi mb-4">Diagrama Entidad-Relación</h2>
          <p className="text-xs text-dim font-mono mb-4">Arquitectura: Shared Database — Row-Level Tenant Isolation · PostgreSQL 16 + RLS</p>
          <div className="overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: ER_SVG }} style={{ minWidth: 800 }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { color: '#25D366', label: 'tenants / templates' },
              { color: '#3b82f6', label: 'users' },
              { color: '#f59e0b', label: 'categories / movements' },
              { color: '#8b5cf6', label: 'products' },
              { color: '#ec4899', label: 'sales' },
              { color: '#10b981', label: 'sale_items' },
              { color: '#64748b', label: 'activity_logs' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-dim font-mono">
                <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'ddl' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="px-3 py-1 text-xs bg-panel border border-edge rounded font-mono text-dim">database/001_schema_inicial.sql</span>
            <span className="px-3 py-1 text-xs bg-panel border border-edge rounded font-mono text-dim">database/seed.sql</span>
          </div>
          <div className="bg-panel border border-edge rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-edge bg-surface">
              <span className="text-xs font-mono text-wapp">001_schema_inicial.sql</span>
              <button onClick={() => navigator.clipboard.writeText(DDL)} className="text-xs text-dim hover:text-hi cursor-pointer px-2 py-1 rounded hover:bg-panel transition-colors">
                Copiar
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-mid overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto">
              <code>{DDL}</code>
            </pre>
          </div>
          <div className="bg-panel border border-edge rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-edge bg-surface">
              <span className="text-xs font-mono text-wapp">seed.sql</span>
              <button onClick={() => navigator.clipboard.writeText(SEED)} className="text-xs text-dim hover:text-hi cursor-pointer px-2 py-1 rounded hover:bg-panel transition-colors">
                Copiar
              </button>
            </div>
            <pre className="p-4 text-[11px] font-mono text-mid overflow-x-auto leading-relaxed">
              <code>{SEED}</code>
            </pre>
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div className="bg-surface border border-edge rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="text-sm font-bold text-hi">API RESTful — Endpoints</h2>
            <p className="text-xs text-dim font-mono mt-0.5">Base URL: <span className="text-wapp">https://api.catalogopro.app/v1</span></p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left px-5 py-3 text-[11px] font-mono text-dim uppercase tracking-wider">Método</th>
                <th className="text-left px-5 py-3 text-[11px] font-mono text-dim uppercase tracking-wider">Ruta</th>
                <th className="text-left px-5 py-3 text-[11px] font-mono text-dim uppercase tracking-wider">Descripción</th>
                <th className="text-left px-5 py-3 text-[11px] font-mono text-dim uppercase tracking-wider">Auth</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTS.map((e, i) => (
                <tr key={i} className="border-b border-edge/50 hover:bg-panel/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${methodColor[e.method]}`}>{e.method}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-mid">{e.path}</td>
                  <td className="px-5 py-3 text-xs text-mid">{e.desc}</td>
                  <td className="px-5 py-3">
                    {e.auth
                      ? <span className="text-[10px] font-mono text-warn bg-warn/10 px-2 py-0.5 rounded border border-warn/30">JWT Bearer</span>
                      : <span className="text-[10px] font-mono text-ok bg-ok/10 px-2 py-0.5 rounded border border-ok/30">Público</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
