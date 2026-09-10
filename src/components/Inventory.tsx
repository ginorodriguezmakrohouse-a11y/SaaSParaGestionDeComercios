import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MovementType, Product } from '../types';

const MOVEMENT_LABELS: Record<MovementType, string> = {
  COMPRA: 'Compra / Ingreso',
  SALIDA_VENTA: 'Salida por Venta',
  AJUSTE_MANUAL: 'Ajuste Manual',
  MERMA: 'Merma / Pérdida',
  DEVOLUCION: 'Devolución',
};

const MOVEMENT_COLORS: Record<MovementType, string> = {
  COMPRA: 'text-ok bg-ok/10 border-ok/30',
  SALIDA_VENTA: 'text-info bg-info/10 border-info/30',
  AJUSTE_MANUAL: 'text-warn bg-warn/10 border-warn/30',
  MERMA: 'text-danger bg-danger/10 border-danger/30',
  DEVOLUCION: 'text-purple bg-purple/10 border-purple/30',
};

function AdjustModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { adjustStock } = useApp();
  const [type, setType] = useState<MovementType>('AJUSTE_MANUAL');
  const [delta, setDelta] = useState('');
  const [justification, setJustification] = useState('');
  const isPositive = ['COMPRA', 'DEVOLUCION'].includes(type);

  const handleSubmit = () => {
    if (!delta || !justification.trim()) return;
    const d = isPositive ? Math.abs(Number(delta)) : -Math.abs(Number(delta));
    adjustStock(product.id, d, type, justification.trim());
    onClose();
  };

  const newStock = product.stock + (isPositive ? Math.abs(Number(delta) || 0) : -Math.abs(Number(delta) || 0));

  return (
    <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-edge rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <div>
            <h2 className="font-bold text-hi">Ajustar Inventario</h2>
            <p className="text-xs text-dim font-mono mt-0.5">{product.name} · {product.sku}</p>
          </div>
          <button onClick={onClose} className="text-mid hover:text-hi cursor-pointer text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between bg-panel rounded-xl p-4 border border-edge">
            <div>
              <p className="text-xs text-dim font-mono">Stock actual</p>
              <p className="text-3xl font-bold font-mono text-hi">{product.stock}</p>
            </div>
            <div className="text-2xl">→</div>
            <div className="text-right">
              <p className="text-xs text-dim font-mono">Stock resultante</p>
              <p className={`text-3xl font-bold font-mono ${newStock < 0 ? 'text-danger' : newStock === 0 ? 'text-warn' : 'text-wapp'}`}>
                {Math.max(0, newStock)}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Tipo de movimiento</label>
            <select
              className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
              value={type}
              onChange={e => setType(e.target.value as MovementType)}
            >
              {Object.entries(MOVEMENT_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-dim font-mono mb-1 block">
              Cantidad ({isPositive ? '+' : '-'})
            </label>
            <input
              type="number"
              min="1"
              className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp font-mono"
              value={delta}
              onChange={e => setDelta(e.target.value)}
              placeholder="Ej: 10"
            />
          </div>

          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Justificación *</label>
            <textarea
              rows={3}
              className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp resize-none"
              value={justification}
              onChange={e => setJustification(e.target.value)}
              placeholder="Describir el motivo del ajuste..."
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-edge rounded-lg text-mid hover:text-hi cursor-pointer">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={!delta || !justification.trim()}
            className="flex-1 py-2.5 text-sm bg-wapp text-canvas font-bold rounded-lg disabled:opacity-40 cursor-pointer hover:bg-wapp/90 transition-colors"
          >
            Registrar Ajuste
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { tenantProducts, tenantMovements, tenantCategories, formatCurrency, currentRole } = useApp();
  const [tab, setTab] = useState<'stock' | 'kardex'>('stock');
  const [adjustProduct, setAdjustProduct] = useState<Product | undefined>();
  const [filterType, setFilterType] = useState<MovementType | 'all'>('all');
  const [filterProduct, setFilterProduct] = useState('all');

  const canEdit = currentRole !== 'viewer';

  const normal = tenantProducts.filter(p => p.stock > p.minStock).length;
  const low = tenantProducts.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const out = tenantProducts.filter(p => p.stock === 0).length;

  const filteredMovements = tenantMovements.filter(m => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterProduct !== 'all' && m.productId !== filterProduct) return false;
    return true;
  });

  const getCatName = (id: string) => tenantCategories.find(c => c.id === id)?.name ?? '—';

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-hi">Control de Inventario</h1>
        <p className="text-xs text-dim font-mono mt-0.5">Kardex y movimientos en tiempo real</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-ok/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-ok">{normal}</div>
          <div className="text-xs text-dim font-mono mt-1">STOCK NORMAL</div>
        </div>
        <div className="bg-surface border border-warn/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-warn">{low}</div>
          <div className="text-xs text-dim font-mono mt-1">BAJO MÍNIMO</div>
        </div>
        <div className="bg-surface border border-danger/30 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold font-mono text-danger">{out}</div>
          <div className="text-xs text-dim font-mono mt-1">AGOTADOS</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-edge rounded-lg p-0.5 w-fit">
        {[{ k: 'stock', l: '📦 Estado de Stock' }, { k: 'kardex', l: '📋 Kardex (Movimientos)' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as 'stock' | 'kardex')}
            className={`px-4 py-1.5 text-xs rounded cursor-pointer transition-all ${tab === k ? 'bg-panel text-hi font-medium' : 'text-dim hover:text-mid'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <div className="bg-surface border border-edge rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge">
                {['Imagen', 'Producto', 'SKU', 'Categoría', 'Precio', 'Costo', 'Stock', 'Mínimo', 'Valor Inventario', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-mono text-dim uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenantProducts.map(p => {
                const status = p.stock === 0 ? 'out' : p.stock <= p.minStock ? 'low' : 'normal';
                return (
                  <tr key={p.id} className="border-b border-edge/50 hover:bg-panel/50 transition-colors">
                    <td className="px-4 py-3">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-panel" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-hi text-xs">{p.name}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-dim">{p.sku}</td>
                    <td className="px-4 py-3 text-xs text-mid">{getCatName(p.categoryId)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-hi">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mid">{formatCurrency(p.cost)}</td>
                    <td className="px-4 py-3 font-mono text-xl font-bold" style={{
                      color: status === 'out' ? '#ef4444' : status === 'low' ? '#f59e0b' : '#10b981'
                    }}>{p.stock}</td>
                    <td className="px-4 py-3 font-mono text-xs text-dim">{p.minStock}</td>
                    <td className="px-4 py-3 font-mono text-xs text-mid">{formatCurrency(p.stock * p.cost)}</td>
                    <td className="px-4 py-3">
                      {status === 'out' && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/30">AGOTADO</span>}
                      {status === 'low' && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-warn/15 text-warn border border-warn/30">BAJO MÍN</span>}
                      {status === 'normal' && <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-ok/15 text-ok border border-ok/30">NORMAL</span>}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <button onClick={() => setAdjustProduct(p)} className="px-3 py-1.5 text-[10px] font-mono bg-panel border border-edge rounded-lg text-mid hover:text-hi cursor-pointer transition-colors whitespace-nowrap">
                          Ajustar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'kardex' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <select
              className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
              value={filterType}
              onChange={e => setFilterType(e.target.value as MovementType | 'all')}
            >
              <option value="all">Todos los tipos</option>
              {Object.entries(MOVEMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select
              className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
            >
              <option value="all">Todos los productos</option>
              {tenantProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="text-xs text-dim font-mono self-center ml-auto">{filteredMovements.length} registros</span>
          </div>

          <div className="bg-surface border border-edge rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-edge">
                  {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Antes', 'Después', 'Justificación', 'Usuario'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-mono text-dim uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map(m => (
                  <tr key={m.id} className="border-b border-edge/50 hover:bg-panel/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[10px] text-dim whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-hi text-xs">{m.productName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${MOVEMENT_COLORS[m.type]}`}>
                        {MOVEMENT_LABELS[m.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: m.delta > 0 ? '#10b981' : '#ef4444' }}>
                      {m.delta > 0 ? '+' : ''}{m.delta}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-dim">{m.quantityBefore}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-hi">{m.quantityAfter}</td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="text-xs text-mid truncate" title={m.justification}>{m.justification}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-dim">{m.userId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMovements.length === 0 && (
              <div className="text-center py-10 text-dim text-sm">No hay movimientos para los filtros seleccionados</div>
            )}
          </div>
        </div>
      )}

      {adjustProduct && (
        <AdjustModal product={adjustProduct} onClose={() => setAdjustProduct(undefined)} />
      )}
    </div>
  );
}
