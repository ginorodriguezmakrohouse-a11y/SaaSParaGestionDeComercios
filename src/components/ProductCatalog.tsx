import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

const UNSPLASH_DEFAULTS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop',
];

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock === 0) return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/30">AGOTADO</span>;
  if (stock <= minStock) return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-warn/15 text-warn border border-warn/30">BAJO MÍN</span>;
  return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-ok/15 text-ok border border-ok/30">NORMAL</span>;
}

function WhatsAppShareModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { tenantTemplates, currentTenant, formatCurrency } = useApp();
  const [selectedTpl, setSelectedTpl] = useState(tenantTemplates.find(t => t.isDefault)?.id ?? tenantTemplates[0]?.id ?? '');

  const tpl = tenantTemplates.find(t => t.id === selectedTpl);
  const catalogUrl = `https://catalogo.catalogopro.app/${currentTenant.slug}`;
  const productUrl = `${catalogUrl}/p/${product.sku}`;

  const preview = tpl?.body
    .replace('{nombre_tienda}', currentTenant.name)
    .replace('{producto}', product.name)
    .replace('{precio}', formatCurrency(product.price))
    .replace('{sku}', product.sku)
    .replace('{descripcion}', product.description.slice(0, 80) + '...')
    .replace('{link_producto}', productUrl)
    .replace('{link_catalogo}', catalogUrl) ?? '';

  const waLink = `https://wa.me/${currentTenant.phone}?text=${encodeURIComponent(preview)}`;

  return (
    <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-edge rounded-xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <div>
            <h2 className="font-bold text-hi">Compartir en WhatsApp</h2>
            <p className="text-xs text-dim mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-mid hover:text-hi cursor-pointer text-xl">✕</button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Plantilla</label>
              <select
                value={selectedTpl}
                onChange={e => setSelectedTpl(e.target.value)}
                className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
              >
                {tenantTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}{t.isDefault ? ' ★' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Mensaje generado</label>
              <textarea
                readOnly
                rows={8}
                className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-xs text-mid font-mono resize-none outline-none"
                value={preview}
              />
            </div>
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Enlace directo</label>
              <div className="flex gap-2">
                <input readOnly className="flex-1 bg-panel border border-edge rounded-lg px-3 py-1.5 text-xs text-dim font-mono outline-none truncate" value={waLink} />
                <button
                  onClick={() => navigator.clipboard.writeText(waLink)}
                  className="px-3 py-1.5 text-xs bg-panel border border-edge rounded-lg text-mid hover:text-hi cursor-pointer"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="text-xs text-dim font-mono mb-2 block">Vista previa</label>
            <div className="bg-[#0d1a2e] rounded-xl p-3 h-full min-h-[280px] flex flex-col" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542435503-956b7fd12b42?w=300&h=400&fit=crop&auto=format&sat=-100&bri=-60')", backgroundSize: 'cover' }}>
              <div className="flex-1 flex flex-col justify-end">
                <div className="ml-auto max-w-[85%] bg-[#005c4b] rounded-2xl rounded-br-sm px-3 py-2 shadow-lg">
                  <p className="text-[11px] text-white leading-relaxed whitespace-pre-wrap font-inter">{preview}</p>
                  <p className="text-[9px] text-white/50 mt-1 text-right font-mono">
                    {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-edge rounded-lg text-mid hover:text-hi cursor-pointer transition-colors">
            Cerrar
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 text-sm bg-wapp text-canvas font-bold rounded-lg hover:bg-wapp/90 transition-colors text-center cursor-pointer"
          >
            Abrir en WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const { tenantCategories, currentTenantId, addProduct, updateProduct, showToast } = useApp();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    cost: product?.cost?.toString() ?? '',
    sku: product?.sku ?? '',
    categoryId: product?.categoryId ?? tenantCategories[0]?.id ?? '',
    imageUrl: product?.imageUrl ?? '',
    stock: product?.stock?.toString() ?? '0',
    minStock: product?.minStock?.toString() ?? '5',
    tags: product?.tags?.join(', ') ?? '',
    active: product?.active ?? true,
  });

  const handleSubmit = () => {
    if (!form.name.trim() || !form.sku.trim() || !form.price) {
      showToast('Nombre, SKU y precio son requeridos', 'error');
      return;
    }
    const data = {
      tenantId: currentTenantId,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      cost: Number(form.cost) || 0,
      sku: form.sku.trim().toUpperCase(),
      categoryId: form.categoryId,
      imageUrl: form.imageUrl || UNSPLASH_DEFAULTS[0],
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 5,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      active: form.active,
    };
    if (product) {
      updateProduct({ ...product, ...data });
    } else {
      addProduct(data);
    }
    onClose();
  };

  const f = (k: keyof typeof form, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-edge rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge sticky top-0 bg-surface z-10">
          <h2 className="font-bold text-hi">{product ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-mid hover:text-hi cursor-pointer text-xl">✕</button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 md:col-span-2">
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Nombre *</label>
              <input className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp" value={form.name} onChange={e => f('name', e.target.value)} placeholder="Campera Bomber..." />
            </div>
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Descripción</label>
              <textarea rows={3} className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp resize-none" value={form.description} onChange={e => f('description', e.target.value)} placeholder="Descripción del producto..." />
            </div>
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">SKU *</label>
            <input className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono uppercase" value={form.sku} onChange={e => f('sku', e.target.value)} placeholder="ROB-001" />
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Categoría</label>
            <select className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp" value={form.categoryId} onChange={e => f('categoryId', e.target.value)}>
              {tenantCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Precio de venta *</label>
            <input type="number" className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono" value={form.price} onChange={e => f('price', e.target.value)} placeholder="89000" />
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Costo</label>
            <input type="number" className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono" value={form.cost} onChange={e => f('cost', e.target.value)} placeholder="42000" />
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Stock inicial</label>
            <input type="number" className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono" value={form.stock} onChange={e => f('stock', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Mínimo de stock (alerta)</label>
            <input type="number" className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono" value={form.minStock} onChange={e => f('minStock', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-dim font-mono mb-1 block">URL de imagen</label>
            <input className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono text-xs" value={form.imageUrl} onChange={e => f('imageUrl', e.target.value)} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-dim font-mono mb-1 block">Etiquetas (separadas por coma)</label>
            <input className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp" value={form.tags} onChange={e => f('tags', e.target.value)} placeholder="invierno, mujer, oferta" />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.active} onChange={e => f('active', e.target.checked)} />
              <div className="w-9 h-5 bg-edge peer-checked:bg-wapp rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
            <span className="text-sm text-mid">Producto activo</span>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-edge rounded-lg text-mid hover:text-hi cursor-pointer">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 text-sm bg-wapp text-canvas font-bold rounded-lg hover:bg-wapp/90 cursor-pointer transition-colors">
            {product ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductCatalog() {
  const { tenantProducts, tenantCategories, currentRole, deleteProduct, formatCurrency, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [onlyLow, setOnlyLow] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [shareProduct, setShareProduct] = useState<Product | undefined>();
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [showCSV, setShowCSV] = useState(false);
  const [csvText, setCsvText] = useState('nombre,sku,precio,stock\nProducto Ejemplo,EJM-001,25000,10');
  const fileRef = useRef<HTMLInputElement>(null);

  const canEdit = currentRole !== 'viewer';

  const filtered = tenantProducts.filter(p => {
    if (onlyLow && p.stock > p.minStock) return false;
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.tags.some(t => t.includes(q));
    }
    return true;
  });

  const getCatName = (id: string) => tenantCategories.find(c => c.id === id)?.name ?? '—';
  const getCatColor = (id: string) => tenantCategories.find(c => c.id === id)?.color ?? '#64748b';

  const handleDelete = (p: Product) => {
    if (window.confirm(`¿Eliminar "${p.name}"?`)) deleteProduct(p.id);
  };

  const margin = (p: Product) => p.cost > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : null;

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-hi">Catálogo de Productos</h1>
          <p className="text-xs text-dim font-mono mt-0.5">{tenantProducts.length} productos · {tenantCategories.length} categorías</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button onClick={() => setShowCSV(true)} className="flex items-center gap-2 px-3 py-2 text-xs border border-edge rounded-lg text-mid hover:text-hi cursor-pointer transition-colors">
              📊 Importar CSV
            </button>
            <button onClick={() => { setEditProduct(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-xs bg-wapp text-canvas font-bold rounded-lg hover:bg-wapp/90 cursor-pointer transition-colors">
              + Nuevo Producto
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp w-56 font-mono"
          placeholder="Buscar nombre o SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {tenantCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          onClick={() => setOnlyLow(v => !v)}
          className={`px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all ${onlyLow ? 'bg-warn/20 border-warn/40 text-warn' : 'border-edge text-mid hover:text-hi'}`}
        >
          ⚠ Solo stock bajo
        </button>
        <div className="flex gap-1 bg-surface border border-edge rounded-lg p-0.5 ml-auto">
          {(['table', 'grid'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-xs rounded cursor-pointer ${view === v ? 'bg-panel text-hi' : 'text-dim hover:text-mid'}`}>
              {v === 'table' ? '≡ Lista' : '⊞ Grid'}
            </button>
          ))}
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-surface border border-edge rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge">
                {['Imagen', 'Producto', 'SKU', 'Categoría', 'Precio', 'Costo', 'Margen', 'Stock', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-mono text-dim uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-edge/50 hover:bg-panel/50 transition-colors">
                  <td className="px-4 py-3">
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-panel" />
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="font-medium text-hi text-xs truncate">{p.name}</div>
                    <div className="text-[10px] text-dim mt-0.5 truncate">{p.description.slice(0, 50)}...</div>
                    {p.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {p.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-panel border border-edge text-dim">{t}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-mid">{p.sku}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: getCatColor(p.categoryId) + '25', color: getCatColor(p.categoryId) }}>
                      {getCatName(p.categoryId)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-hi">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-mid">{formatCurrency(p.cost)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ok">{margin(p) !== null ? `${margin(p)}%` : '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: p.stock === 0 ? '#ef4444' : p.stock <= p.minStock ? '#f59e0b' : '#10b981' }}>
                    {p.stock}
                  </td>
                  <td className="px-4 py-3"><StockBadge stock={p.stock} minStock={p.minStock} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setShareProduct(p)} title="Compartir en WhatsApp" className="p-1.5 rounded text-wapp hover:bg-wapp/15 cursor-pointer transition-colors text-xs">📱</button>
                      {canEdit && (
                        <>
                          <button onClick={() => { setEditProduct(p); setShowForm(true); }} title="Editar" className="p-1.5 rounded text-mid hover:bg-panel cursor-pointer transition-colors text-xs">✏</button>
                          <button onClick={() => handleDelete(p)} title="Eliminar" className="p-1.5 rounded text-danger hover:bg-danger/15 cursor-pointer transition-colors text-xs">🗑</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-dim text-sm">No se encontraron productos con esos filtros</div>
          )}
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-surface border border-edge rounded-xl overflow-hidden hover:border-wapp/40 transition-all group">
              <div className="aspect-square overflow-hidden bg-panel">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <div className="font-medium text-hi text-xs truncate">{p.name}</div>
                <div className="font-mono text-[10px] text-dim mt-0.5">{p.sku}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-mono text-sm font-bold text-hi">{formatCurrency(p.price)}</span>
                  <StockBadge stock={p.stock} minStock={p.minStock} />
                </div>
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => setShareProduct(p)} className="flex-1 py-1.5 text-[10px] bg-wapp/15 text-wapp rounded-lg cursor-pointer hover:bg-wapp/25 transition-colors font-medium">
                    WhatsApp
                  </button>
                  {canEdit && (
                    <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="px-2 py-1.5 text-[10px] bg-panel border border-edge text-mid rounded-lg cursor-pointer hover:text-hi transition-colors">
                      ✏
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowForm(false); setEditProduct(undefined); }}
        />
      )}
      {shareProduct && (
        <WhatsAppShareModal product={shareProduct} onClose={() => setShareProduct(undefined)} />
      )}

      {/* CSV Import Modal */}
      {showCSV && (
        <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-edge rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
              <h2 className="font-bold text-hi">Importar Productos CSV</h2>
              <button onClick={() => setShowCSV(false)} className="text-mid hover:text-hi cursor-pointer text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-panel border border-edge rounded-lg p-3 text-xs text-dim font-mono">
                <p className="text-wapp mb-2 font-bold">Formato requerido:</p>
                <p>nombre, sku, precio, costo (opcional), stock, minStock (opcional), categoría (opcional)</p>
              </div>
              <textarea
                rows={8}
                className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-xs font-mono text-mid outline-none focus:border-wapp resize-none"
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCSV(false)} className="flex-1 py-2 text-sm border border-edge rounded-lg text-mid cursor-pointer">Cancelar</button>
                <button
                  onClick={() => {
                    showToast('Importación CSV simulada — 1 producto procesado (demo)', 'info');
                    setShowCSV(false);
                  }}
                  className="flex-1 py-2 text-sm bg-wapp text-canvas font-bold rounded-lg cursor-pointer"
                >
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
