import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CartItem } from '../types';

export default function PublicCatalog() {
  const { tenantProducts, tenantCategories, currentTenant, formatCurrency } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);

  const activeProducts = tenantProducts.filter(p => p.active && p.stock > 0);
  const filtered = activeProducts.filter(p => {
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addToCart = (product: typeof tenantProducts[0]) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) {
        if (ex.quantity >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== productId));
    else setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const getCatName = (id: string) => tenantCategories.find(c => c.id === id)?.name ?? '';
  const getCatColor = (id: string) => tenantCategories.find(c => c.id === id)?.color ?? '#64748b';

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    const lines = cart.map(i => `• ${i.product.name} x${i.quantity} — ${formatCurrency(i.product.price * i.quantity)}`).join('\n');
    const msg = `¡Hola! Quiero hacer un pedido desde el catálogo web:\n\n${lines}\n\n💰 *Total: ${formatCurrency(total)}*\n\n¿Me podés confirmar disponibilidad?`;
    window.open(`https://wa.me/${currentTenant.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-full bg-canvas">
      {/* Public storefront header */}
      <header className="bg-surface border-b border-edge">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-canvas" style={{ background: currentTenant.primaryColor }}>
              {currentTenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-hi text-base">{currentTenant.name}</h1>
              <p className="text-xs text-dim font-mono">{currentTenant.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={`https://wa.me/${currentTenant.phone}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-wapp/15 text-wapp border border-wapp/30 rounded-lg hover:bg-wapp/25 transition-colors cursor-pointer font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              </svg>
              Contactar
            </a>
            <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 px-3 py-1.5 text-xs bg-surface border border-edge rounded-lg text-mid hover:text-hi cursor-pointer transition-colors">
              🛒 Carrito
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-wapp text-canvas text-[9px] font-bold flex items-center justify-center">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Info banner */}
        <div className="bg-wapp/5 border border-wapp/20 rounded-xl p-4 flex items-center gap-3 text-sm text-mid">
          <span className="text-wapp text-lg">📱</span>
          <span>Este es el catálogo público de <strong className="text-hi">{currentTenant.name}</strong>. Agregá productos al carrito y enviá tu pedido por WhatsApp.</span>
        </div>

        {/* Search & categories */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            className="bg-surface border border-edge rounded-lg px-4 py-2 text-sm text-hi outline-none focus:border-wapp w-56 font-mono"
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCatFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-full border cursor-pointer transition-all ${catFilter === 'all' ? 'bg-hi text-canvas border-hi' : 'border-edge text-mid hover:border-mid'}`}
            >
              Todos
            </button>
            {tenantCategories.map(c => (
              <button
                key={c.id}
                onClick={() => setCatFilter(c.id)}
                className={`px-3 py-1.5 text-xs rounded-full border cursor-pointer transition-all ${catFilter === c.id ? 'text-canvas border-transparent' : 'border-edge text-mid hover:border-mid'}`}
                style={catFilter === c.id ? { background: c.color, borderColor: c.color } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
          <span className="text-xs text-dim font-mono ml-auto">{filtered.length} productos</span>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => {
            const inCart = cart.find(i => i.product.id === p.id)?.quantity ?? 0;
            return (
              <div key={p.id} className="bg-surface border border-edge rounded-xl overflow-hidden hover:border-wapp/30 transition-all group">
                <div className="aspect-square overflow-hidden bg-panel relative">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: getCatColor(p.categoryId) + '33', color: getCatColor(p.categoryId) }}>
                      {getCatName(p.categoryId)}
                    </span>
                  </div>
                  {inCart > 0 && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-wapp text-canvas text-xs font-bold flex items-center justify-center">
                      {inCart}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-hi text-sm leading-tight">{p.name}</p>
                  <p className="text-[10px] text-dim font-mono mt-0.5">{p.sku}</p>
                  <p className="text-xs text-mid mt-1 line-clamp-2">{p.description}</p>
                  {p.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {p.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-panel border border-edge text-dim">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-mono font-bold text-hi">{formatCurrency(p.price)}</span>
                    <span className="text-[10px] text-dim font-mono">Stock: {p.stock}</span>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={inCart >= p.stock}
                    className="mt-2 w-full py-2 text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: inCart > 0 ? '#25D36625' : '#25D366', color: inCart > 0 ? '#25D366' : '#001a09', border: inCart > 0 ? '1px solid #25D36650' : 'none' }}
                  >
                    {inCart > 0 ? `En carrito (${inCart})` : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-dim">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-canvas/70 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-80 bg-surface border-l border-edge flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
              <h2 className="font-bold text-hi">Tu Carrito</h2>
              <button onClick={() => setShowCart(false)} className="text-mid hover:text-hi cursor-pointer text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-dim text-sm">Tu carrito está vacío</div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-panel border border-edge rounded-xl">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover bg-edge shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-hi truncate">{item.product.name}</p>
                      <p className="text-[10px] text-dim font-mono">{formatCurrency(item.product.price)} c/u</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-6 h-6 rounded bg-edge text-hi text-sm flex items-center justify-center cursor-pointer hover:bg-dim">−</button>
                        <span className="font-mono text-sm text-hi w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="w-6 h-6 rounded bg-edge text-hi text-sm flex items-center justify-center cursor-pointer hover:bg-dim disabled:opacity-30">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-hi">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-edge space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-mid font-medium">Total</span>
                <span className="font-mono text-xl font-bold text-wapp">{formatCurrency(total)}</span>
              </div>
              <button
                onClick={handleWhatsAppOrder}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-wapp text-canvas font-bold text-sm rounded-xl disabled:opacity-40 cursor-pointer hover:bg-wapp/90 transition-colors"
              >
                📱 Pedir por WhatsApp
              </button>
              <p className="text-[10px] text-dim text-center font-mono">Se abrirá WhatsApp con tu pedido listo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
