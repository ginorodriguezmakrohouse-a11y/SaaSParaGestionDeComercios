import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CartItem, SaleChannel } from '../types';

export default function POS() {
  const { tenantProducts, tenantCategories, addSale, formatCurrency, currentTenant } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<SaleChannel>('pos');
  const [lastSale, setLastSale] = useState<{ total: number; items: CartItem[]; customer: string; phone: string } | null>(null);

  const filtered = tenantProducts.filter(p =>
    p.active && p.stock > 0 &&
    (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: typeof tenantProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const handleSale = () => {
    if (cart.length === 0 || !customer.trim()) return;
    const items = cart.map(i => ({ productId: i.product.id, quantity: i.quantity }));
    const ok = addSale(items, customer.trim(), phone.trim(), channel);
    if (ok) {
      setLastSale({ total, items: cart, customer: customer.trim(), phone: phone.trim() });
      setCart([]);
      setCustomer('');
      setPhone('');
    }
  };

  const waConfirmLink = lastSale ? (() => {
    const itemsText = lastSale.items.map(i =>
      `• ${i.product.name} x${i.quantity} = ${formatCurrency(i.product.price * i.quantity)}`
    ).join('\n');
    const msg = `✅ *Confirmación de pedido — ${currentTenant.name}*\n\nCliente: ${lastSale.customer}\n\nProductos:\n${itemsText}\n\n💰 *Total: ${formatCurrency(lastSale.total)}*\n\n¡Gracias por tu compra! Te contactaremos pronto para coordinar la entrega.`;
    return `https://wa.me/${lastSale.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  })() : '';

  const getCatName = (id: string) => tenantCategories.find(c => c.id === id)?.name ?? '';

  return (
    <div className="flex h-full min-h-0">
      {/* Product grid */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-hi">Punto de Venta</h1>
          <p className="text-xs text-dim font-mono mt-0.5">Registrar ventas por mostrador o WhatsApp</p>
        </div>

        <input
          className="w-full bg-surface border border-edge rounded-lg px-4 py-2.5 text-sm text-hi outline-none focus:border-wapp font-mono"
          placeholder="Buscar producto por nombre o SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(p => {
            const inCart = cart.find(i => i.product.id === p.id)?.quantity ?? 0;
            const maxReached = inCart >= p.stock;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={maxReached}
                className={`bg-surface border rounded-xl p-3 text-left transition-all cursor-pointer group relative
                  ${maxReached ? 'border-edge opacity-50 cursor-not-allowed' : 'border-edge hover:border-wapp/50 hover:bg-panel'}`}
              >
                {inCart > 0 && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-wapp text-canvas text-[10px] font-bold flex items-center justify-center font-mono">
                    {inCart}
                  </div>
                )}
                <img src={p.imageUrl} alt={p.name} className="w-full aspect-square object-cover rounded-lg mb-2 bg-panel" />
                <p className="text-xs font-medium text-hi truncate">{p.name}</p>
                <p className="text-[10px] text-dim font-mono">{p.sku} · {getCatName(p.categoryId)}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-mono text-sm font-bold text-wapp">{formatCurrency(p.price)}</span>
                  <span className={`text-[10px] font-mono ${p.stock <= p.minStock ? 'text-warn' : 'text-dim'}`}>Stock: {p.stock}</span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-dim text-sm">No hay productos disponibles con esos criterios</div>
        )}

        {/* Last sale confirmation */}
        {lastSale && (
          <div className="bg-ok/10 border border-ok/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-ok text-lg">✓</span>
              <div>
                <p className="font-semibold text-ok text-sm">Venta registrada exitosamente</p>
                <p className="text-xs text-dim font-mono">Cliente: {lastSale.customer} · Total: {formatCurrency(lastSale.total)}</p>
              </div>
            </div>
            {lastSale.phone && (
              <a
                href={waConfirmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-wapp text-canvas text-sm font-bold rounded-lg hover:bg-wapp/90 transition-colors cursor-pointer"
              >
                📱 Enviar confirmación por WhatsApp
              </a>
            )}
            <button onClick={() => setLastSale(null)} className="w-full py-2 text-xs text-dim hover:text-mid cursor-pointer">
              Descartar
            </button>
          </div>
        )}
      </div>

      {/* Cart sidebar */}
      <aside className="w-72 bg-surface border-l border-edge flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-edge">
          <h2 className="font-bold text-hi">Carrito</h2>
          <p className="text-xs text-dim font-mono">{cart.length} producto(s) seleccionados</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-dim text-xs">Seleccioná productos del catálogo</div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex gap-2 p-2 bg-panel border border-edge rounded-lg">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 rounded-md object-cover bg-edge shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-hi truncate">{item.product.name}</p>
                  <p className="text-[10px] text-dim font-mono">{formatCurrency(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-5 h-5 rounded bg-edge text-hi text-xs flex items-center justify-center cursor-pointer hover:bg-dim">−</button>
                    <span className="font-mono text-xs text-hi w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-5 h-5 rounded bg-edge text-hi text-xs flex items-center justify-center cursor-pointer hover:bg-dim disabled:opacity-30"
                    >+</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-hi">{formatCurrency(item.product.price * item.quantity)}</p>
                  <button onClick={() => updateQty(item.product.id, 0)} className="text-danger text-[10px] mt-1 hover:underline cursor-pointer">Quitar</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-edge space-y-3">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-mid">Total</span>
            <span className="font-mono text-lg font-bold text-wapp">{formatCurrency(total)}</span>
          </div>

          {/* Customer info */}
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Nombre del cliente *</label>
            <input
              className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-xs text-hi outline-none focus:border-wapp"
              placeholder="Valentina Ríos"
              value={customer}
              onChange={e => setCustomer(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Teléfono WhatsApp</label>
            <input
              className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-xs text-hi outline-none focus:border-wapp font-mono"
              placeholder="1167891234"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-dim font-mono mb-1 block">Canal de venta</label>
            <div className="flex gap-1">
              {(['pos', 'whatsapp', 'web'] as SaleChannel[]).map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`flex-1 py-1.5 text-[10px] font-mono rounded-lg cursor-pointer transition-all border ${
                    channel === c ? 'bg-wapp/20 border-wapp/50 text-wapp' : 'border-edge text-dim hover:text-mid'
                  }`}
                >
                  {c === 'pos' ? 'POS' : c === 'whatsapp' ? 'WhatsApp' : 'Web'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSale}
            disabled={cart.length === 0 || !customer.trim()}
            className="w-full py-3 bg-wapp text-canvas font-bold text-sm rounded-xl disabled:opacity-40 cursor-pointer hover:bg-wapp/90 transition-colors"
          >
            Registrar Venta
          </button>
        </div>
      </aside>
    </div>
  );
}
