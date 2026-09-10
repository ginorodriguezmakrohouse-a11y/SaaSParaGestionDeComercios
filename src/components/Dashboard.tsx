import { useApp } from '../context/AppContext';
import { WEEKLY_SALES } from '../mockData';
import { SaleChannel, SaleStatus } from '../types';

const channelLabels: Record<SaleChannel, string> = { whatsapp: 'WhatsApp', pos: 'POS', web: 'Web' };
const statusColors: Record<SaleStatus, string> = {
  pending: 'text-warn bg-warn/10 border-warn/30',
  confirmed: 'text-info bg-info/10 border-info/30',
  delivered: 'text-ok bg-ok/10 border-ok/30',
  cancelled: 'text-danger bg-danger/10 border-danger/30',
};
const statusLabels: Record<SaleStatus, string> = { pending: 'Pendiente', confirmed: 'Confirmado', delivered: 'Entregado', cancelled: 'Cancelado' };

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-28">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end group">
            <div className="w-full flex flex-col justify-end h-[calc(100%-20px)] relative">
              <div
                className={`w-full rounded-t-sm transition-all duration-700 ${isLast ? 'bg-wapp' : 'bg-wapp/30 group-hover:bg-wapp/50'}`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-[9px] text-dim font-mono">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) {
  return (
    <div className="bg-surface border border-edge rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-dim font-mono uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${color}`}>{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-hi font-mono tracking-tight">{value}</div>
        {sub && <div className="text-xs text-dim mt-1">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { tenantProducts, tenantSales, tenantCategories, formatCurrency, currentTenantId, currentTenant } = useApp();

  const today = new Date().toISOString().slice(0, 10);
  const todaySales = tenantSales.filter(s => s.createdAt.slice(0, 10) >= '2025-05-03');
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const lowStockProducts = tenantProducts.filter(p => p.stock > 0 && p.stock <= p.minStock);
  const outOfStock = tenantProducts.filter(p => p.stock === 0);
  const weekData = WEEKLY_SALES[currentTenantId as 't1' | 't2'] ?? WEEKLY_SALES.t1;

  const whatsappSales = tenantSales.filter(s => s.channel === 'whatsapp').length;
  const totalSalesQty = tenantSales.length;
  const whatsappPct = totalSalesQty ? Math.round((whatsappSales / totalSalesQty) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-hi">Dashboard</h1>
        <p className="text-sm text-dim font-mono mt-0.5">{currentTenant.name} · {currentTenant.address}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Ingresos Hoy"
          value={formatCurrency(todayRevenue)}
          sub={`${todaySales.length} ventas registradas`}
          color="bg-wapp/20 text-wapp"
          icon="💰"
        />
        <MetricCard
          label="Productos Activos"
          value={tenantProducts.filter(p => p.active).length.toString()}
          sub={`${tenantCategories.length} categorías`}
          color="bg-info/20 text-info"
          icon="📦"
        />
        <MetricCard
          label="Stock Bajo"
          value={lowStockProducts.length.toString()}
          sub={`${outOfStock.length} sin stock`}
          color="bg-warn/20 text-warn"
          icon="⚠️"
        />
        <MetricCard
          label="Ventas WhatsApp"
          value={`${whatsappPct}%`}
          sub={`${whatsappSales} de ${totalSalesQty} ventas`}
          color="bg-ok/20 text-ok"
          icon="📱"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly chart */}
        <div className="bg-surface border border-edge rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-hi">Ventas — Últimos 7 días</h2>
              <p className="text-xs text-dim font-mono mt-0.5">
                Total: {formatCurrency(weekData.reduce((s, d) => s + d.value, 0))}
              </p>
            </div>
            <span className="text-xs text-dim font-mono bg-panel px-2 py-1 rounded border border-edge">
              {currentTenant.currency}
            </span>
          </div>
          <BarChart data={weekData} />
          <div className="mt-3 flex items-center gap-4 text-[11px] text-dim font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-wapp inline-block" /> Hoy</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-wapp/30 inline-block" /> Días anteriores</span>
          </div>
        </div>

        {/* Stock alerts */}
        <div className="bg-surface border border-edge rounded-xl p-5">
          <h2 className="text-sm font-semibold text-hi mb-3">Alertas de Stock</h2>
          <div className="space-y-2">
            {outOfStock.length === 0 && lowStockProducts.length === 0 ? (
              <p className="text-xs text-dim py-4 text-center">✓ Todos los productos tienen stock normal</p>
            ) : (
              <>
                {outOfStock.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/20">
                    <span className="text-danger text-xs font-bold font-mono shrink-0">OUT</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-hi truncate">{p.name}</p>
                      <p className="text-[10px] text-dim font-mono">{p.sku}</p>
                    </div>
                    <span className="text-danger text-xs font-mono font-bold">0</span>
                  </div>
                ))}
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-2 p-2 rounded-lg bg-warn/10 border border-warn/20">
                    <span className="text-warn text-xs font-bold font-mono shrink-0">LOW</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-hi truncate">{p.name}</p>
                      <p className="text-[10px] text-dim font-mono">{p.sku}</p>
                    </div>
                    <span className="text-warn text-xs font-mono font-bold">{p.stock}/{p.minStock}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-surface border border-edge rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
          <h2 className="text-sm font-semibold text-hi">Ventas Recientes</h2>
          <span className="text-xs text-dim font-mono">{tenantSales.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge">
                {['ID', 'Cliente', 'Canal', 'Productos', 'Total', 'Estado', 'Fecha'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-mono text-dim uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenantSales.slice(0, 8).map(sale => (
                <tr key={sale.id} className="border-b border-edge/50 hover:bg-panel/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-dim">{sale.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-hi text-xs">{sale.customerName}</div>
                    <div className="text-[10px] text-dim font-mono">{sale.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      sale.channel === 'whatsapp' ? 'bg-wapp/15 text-wapp' :
                      sale.channel === 'pos' ? 'bg-info/15 text-info' : 'bg-purple/15 text-purple'}`}>
                      {channelLabels[sale.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-mid">{sale.items.length} ítem(s)</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-hi">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusColors[sale.status]}`}>
                      {statusLabels[sale.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-dim font-mono">
                    {new Date(sale.createdAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
