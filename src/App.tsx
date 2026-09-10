import { useState } from 'react';
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ProductCatalog from './components/ProductCatalog';
import Inventory from './components/Inventory';
import POS from './components/POS';
import WhatsAppManager from './components/WhatsAppManager';
import PublicCatalog from './components/PublicCatalog';
import TechDocs from './components/TechDocs';
import UnitTests from './components/UnitTests';
import { Module } from './types';

const NAV_ITEMS: { module: Module; label: string; icon: string; roles: string[] }[] = [
  { module: 'dashboard', label: 'Dashboard', icon: 'M3 13l4-4 4 4 4-6 4 4', roles: ['admin', 'viewer'] },
  { module: 'products', label: 'Catálogo', icon: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM4 7V5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v2', roles: ['admin', 'seller', 'viewer'] },
  { module: 'inventory', label: 'Inventario', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', roles: ['admin', 'seller', 'viewer'] },
  { module: 'pos', label: 'Punto de Venta', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z', roles: ['admin', 'seller'] },
  { module: 'whatsapp', label: 'WhatsApp', icon: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z', roles: ['admin', 'seller'] },
  { module: 'public', label: 'Tienda Pública', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles: ['admin', 'seller', 'viewer'] },
  { module: 'techdocs', label: 'Arquitectura', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4', roles: ['admin', 'viewer'] },
  { module: 'tests', label: 'Tests Unitarios', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', roles: ['admin'] },
];

function SvgIcon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={d} />
    </svg>
  );
}

function AppShell() {
  const { currentTenant, currentRole, currentModule, setModule, sidebarOpen, toggleSidebar,
    tenants, selectTenant, setRole, toast, currentUser, showToast, addTenant, clearPersistedData } = useApp();

  const [showTenantModal, setShowTenantModal] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantAddress, setNewTenantAddress] = useState('');

  const visibleNav = NAV_ITEMS.filter(n => n.roles.includes(currentRole));
  const planColors = { starter: 'bg-dim/30 text-mid', pro: 'bg-wapp/20 text-wapp', enterprise: 'bg-purple/20 text-purple' };

  const handleCreateTenant = () => {
    if (!newTenantName.trim() || !newTenantPhone.trim()) return;
    addTenant(newTenantName.trim(), newTenantPhone.trim(), newTenantAddress.trim());
    setShowTenantModal(false);
    setNewTenantName(''); setNewTenantPhone(''); setNewTenantAddress('');
  };

  const moduleComponents: Record<Module, React.ReactElement> = {
    dashboard: <Dashboard />,
    products: <ProductCatalog />,
    inventory: <Inventory />,
    pos: <POS />,
    whatsapp: <WhatsAppManager />,
    public: <PublicCatalog />,
    techdocs: <TechDocs />,
    tests: <UnitTests />,
  };

  return (
    <div className="flex h-full bg-canvas text-hi overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} transition-all duration-300 flex flex-col bg-surface border-r border-edge shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-edge min-h-[57px]">
          <div className="w-8 h-8 rounded-lg bg-wapp flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          {sidebarOpen && <span className="font-bold text-sm text-hi tracking-tight">CatalogoPro</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {visibleNav.map(item => (
            <button
              key={item.module}
              onClick={() => setModule(item.module)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-md text-sm transition-all cursor-pointer
                ${currentModule === item.module
                  ? 'bg-wapp/15 text-wapp border border-wapp/30'
                  : 'text-mid hover:text-hi hover:bg-panel'
                }`}
            >
              <SvgIcon d={item.icon} size={18} />
              {sidebarOpen && <span className="truncate font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom user */}
        {sidebarOpen && (
          <div className="p-3 border-t border-edge">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-wapp/20 text-wapp flex items-center justify-center text-xs font-bold font-mono shrink-0">
                {currentUser.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-hi truncate">{currentUser.name}</p>
                <p className="text-[10px] text-dim font-mono">{currentRole}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-edge bg-surface shrink-0">
          <button onClick={toggleSidebar} className="text-mid hover:text-hi transition-colors cursor-pointer p-1 rounded">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          {/* Tenant selector */}
          <div className="flex items-center gap-2 flex-1">
            <select
              value={currentTenant.id}
              onChange={e => e.target.value === '__new__' ? setShowTenantModal(true) : selectTenant(e.target.value)}
              className="bg-panel border border-edge text-hi text-sm rounded-md px-3 py-1.5 cursor-pointer outline-none focus:border-wapp font-medium max-w-xs"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
              <option value="__new__">+ Agregar comercio...</option>
            </select>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${planColors[currentTenant.plan]}`}>
              {currentTenant.plan.toUpperCase()}
            </span>
          </div>

          {/* Role switcher */}
          <div className="flex items-center gap-1 bg-panel border border-edge rounded-md p-0.5">
            {(['admin', 'seller', 'viewer'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`px-3 py-1 text-xs rounded font-medium transition-all cursor-pointer capitalize
                  ${currentRole === r ? 'bg-wapp text-canvas' : 'text-mid hover:text-hi'}`}
              >
                {r === 'admin' ? 'Admin' : r === 'seller' ? 'Vendedor' : 'Auditor'}
              </button>
            ))}
          </div>

          <div className="text-xs text-dim font-mono hidden md:block">📍 Perú · PEN</div>

          <button
            onClick={() => { if (window.confirm('¿Restaurar todos los datos al estado inicial de demo?')) clearPersistedData(); }}
            title="Restaurar datos iniciales"
            className="text-[10px] font-mono text-dim hover:text-warn border border-edge rounded px-2 py-1 cursor-pointer transition-colors"
          >
            ↺ Reset
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {moduleComponents[currentModule]}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border text-sm font-medium max-w-sm
          ${toast.type === 'success' ? 'bg-ok/10 border-ok/30 text-ok' :
            toast.type === 'error' ? 'bg-danger/10 border-danger/30 text-danger' :
            'bg-info/10 border-info/30 text-info'}`}>
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* New Tenant Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-edge rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-hi mb-4">Nuevo Comercio</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-dim mb-1 block font-mono">Nombre del comercio *</label>
                <input
                  className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
                  placeholder="Mi Tienda Online"
                  value={newTenantName}
                  onChange={e => setNewTenantName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-dim mb-1 block font-mono">WhatsApp (con código de país) *</label>
                <input
                  className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono"
                  placeholder="5491112345678"
                  value={newTenantPhone}
                  onChange={e => setNewTenantPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-dim mb-1 block font-mono">Dirección</label>
                <input
                  className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
                  placeholder="Av. Corrientes 1234, CABA"
                  value={newTenantAddress}
                  onChange={e => setNewTenantAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowTenantModal(false)} className="flex-1 py-2 text-sm text-mid hover:text-hi border border-edge rounded-lg transition-colors cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={handleCreateTenant}
                disabled={!newTenantName.trim() || !newTenantPhone.trim()}
                className="flex-1 py-2 text-sm bg-wapp text-canvas font-semibold rounded-lg hover:bg-wapp/90 transition-colors disabled:opacity-40 cursor-pointer"
              >
                Crear Comercio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
