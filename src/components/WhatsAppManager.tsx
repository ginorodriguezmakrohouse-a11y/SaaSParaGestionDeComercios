import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WhatsAppTemplate } from '../types';

const VARS = ['{nombre_tienda}', '{producto}', '{precio}', '{sku}', '{descripcion}', '{link_producto}', '{link_catalogo}'];

function TemplateEditor({
  template, onSave, onCancel,
}: {
  template?: WhatsAppTemplate;
  onSave: (name: string, body: string, isDefault: boolean) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name ?? '');
  const [body, setBody] = useState(template?.body ?? '');
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false);
  const ref = (r: HTMLTextAreaElement | null) => { if (r) (TemplateEditor as any)._ref = r; };

  const insertVar = (v: string) => {
    const ta: HTMLTextAreaElement = (TemplateEditor as any)._ref;
    if (!ta) { setBody(b => b + v); return; }
    const { selectionStart: s, selectionEnd: e } = ta;
    setBody(b => b.slice(0, s) + v + b.slice(e));
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = s + v.length; }, 0);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-dim font-mono mb-1 block">Nombre de la plantilla</label>
        <input className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp" value={name} onChange={e => setName(e.target.value)} placeholder="Presentación de producto" />
      </div>
      <div>
        <label className="text-xs text-dim font-mono mb-2 block">Variables disponibles</label>
        <div className="flex flex-wrap gap-1.5">
          {VARS.map(v => (
            <button key={v} onClick={() => insertVar(v)} className="text-[10px] font-mono px-2 py-1 rounded bg-wapp/10 text-wapp border border-wapp/30 hover:bg-wapp/20 cursor-pointer transition-colors">
              {v}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-dim font-mono mb-1 block">Cuerpo del mensaje</label>
        <textarea
          ref={ref}
          rows={8}
          className="w-full bg-panel border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp resize-none font-mono"
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Escribí el mensaje..."
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
          <div className="w-9 h-5 bg-edge peer-checked:bg-wapp rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
        <span className="text-sm text-mid">Marcar como plantilla predeterminada</span>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 text-sm border border-edge rounded-lg text-mid hover:text-hi cursor-pointer">Cancelar</button>
        <button onClick={() => { if (name && body) onSave(name, body, isDefault); }} className="flex-1 py-2 text-sm bg-wapp text-canvas font-bold rounded-lg cursor-pointer hover:bg-wapp/90 transition-colors">
          {template ? 'Guardar Cambios' : 'Crear Plantilla'}
        </button>
      </div>
    </div>
  );
}

export default function WhatsAppManager() {
  const { tenantTemplates, tenantProducts, currentTenant, formatCurrency, addTemplate, updateTemplate, deleteTemplate, currentRole } = useApp();
  const [tab, setTab] = useState<'templates' | 'generator'>('templates');
  const [editTpl, setEditTpl] = useState<WhatsAppTemplate | undefined>();
  const [showEditor, setShowEditor] = useState(false);
  const [selectedTpl, setSelectedTpl] = useState(tenantTemplates[0]?.id || '');
  const [selectedProduct, setSelectedProduct] = useState(tenantProducts[0]?.id || '');
  const [copied, setCopied] = useState(false);

  const canEdit = currentRole !== 'viewer';
  const catalogUrl = `https://catalogo.catalogopro.app/${currentTenant.slug}`;

  const getPreview = (tpl?: WhatsAppTemplate, productId?: string) => {
    if (!tpl) return '';
    const p = tenantProducts.find(x => x.id === productId);
    return tpl.body
      .replace('{nombre_tienda}', currentTenant.name)
      .replace('{producto}', p?.name ?? '[producto]')
      .replace('{precio}', p ? formatCurrency(p.price) : '[precio]')
      .replace('{sku}', p?.sku ?? '[sku]')
      .replace('{descripcion}', p ? p.description.slice(0, 100) + '...' : '[descripcion]')
      .replace('{link_producto}', `${catalogUrl}/p/${p?.sku ?? 'sku'}`)
      .replace('{link_catalogo}', catalogUrl);
  };

  const tpl = tenantTemplates.find(t => t.id === selectedTpl);
  const preview = getPreview(tpl, selectedProduct);
  const waLink = `https://wa.me/${currentTenant.phone}?text=${encodeURIComponent(preview)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(waLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (name: string, body: string, isDefault: boolean) => {
    if (editTpl) {
      updateTemplate({ ...editTpl, name, body, isDefault });
    } else {
      addTemplate({ tenantId: currentTenant.id, name, body, isDefault });
    }
    setShowEditor(false);
    setEditTpl(undefined);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-hi">Integración WhatsApp</h1>
        <p className="text-xs text-dim font-mono mt-0.5">Plantillas y generador de enlaces para {currentTenant.phone}</p>
      </div>

      <div className="flex gap-1 bg-surface border border-edge rounded-lg p-0.5 w-fit">
        {[{ k: 'templates', l: '📝 Plantillas' }, { k: 'generator', l: '🔗 Generador de Enlace' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as 'templates' | 'generator')}
            className={`px-4 py-1.5 text-xs rounded cursor-pointer transition-all ${tab === k ? 'bg-panel text-hi font-medium' : 'text-dim hover:text-mid'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-hi">Plantillas de Mensaje</h2>
              {canEdit && !showEditor && (
                <button onClick={() => { setEditTpl(undefined); setShowEditor(true); }} className="px-3 py-1.5 text-xs bg-wapp text-canvas font-bold rounded-lg cursor-pointer hover:bg-wapp/90 transition-colors">
                  + Nueva
                </button>
              )}
            </div>

            {showEditor ? (
              <div className="bg-surface border border-edge rounded-xl p-5">
                <h3 className="text-sm font-semibold text-hi mb-4">{editTpl ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
                <TemplateEditor
                  template={editTpl}
                  onSave={handleSave}
                  onCancel={() => { setShowEditor(false); setEditTpl(undefined); }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {tenantTemplates.map(t => (
                  <div key={t.id} className={`bg-surface border rounded-xl p-4 transition-all ${selectedTpl === t.id ? 'border-wapp/50' : 'border-edge hover:border-edge'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button onClick={() => setSelectedTpl(t.id)} className="text-left flex-1 min-w-0 cursor-pointer">
                          <div className="font-medium text-hi text-sm flex items-center gap-2">
                            {t.name}
                            {t.isDefault && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-wapp/20 text-wapp">DEFAULT</span>}
                          </div>
                          <p className="text-xs text-dim mt-1 line-clamp-2 font-mono">{t.body.slice(0, 80)}...</p>
                        </button>
                      </div>
                      {canEdit && (
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => { setEditTpl(t); setShowEditor(true); }} className="p-1.5 text-xs text-mid hover:text-hi cursor-pointer">✏</button>
                          {!t.isDefault && (
                            <button onClick={() => deleteTemplate(t.id)} className="p-1.5 text-xs text-danger hover:bg-danger/15 rounded cursor-pointer">🗑</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-hi">Vista previa en tiempo real</h2>
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Producto de ejemplo</label>
              <select
                className="w-full bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
              >
                {tenantProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="rounded-2xl overflow-hidden" style={{
              background: "linear-gradient(135deg, #0a1628 0%, #0d2040 100%)",
              minHeight: 300,
            }}>
              <div className="bg-[#1f2937]/80 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-wapp/30 flex items-center justify-center text-wapp text-sm font-bold">
                  {currentTenant.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{currentTenant.name}</p>
                  <p className="text-[10px] text-white/50 font-mono">en línea</p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3 min-h-[200px] justify-end">
                {tpl ? (
                  <div className="ml-auto max-w-[85%] bg-[#005c4b] rounded-2xl rounded-br-sm px-3 py-2 shadow-lg">
                    <p className="text-[11px] text-white leading-relaxed whitespace-pre-wrap font-inter">{getPreview(tpl, selectedProduct)}</p>
                    <p className="text-[9px] text-white/50 mt-1 text-right font-mono">
                      {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                    </p>
                  </div>
                ) : (
                  <p className="text-center text-white/30 text-xs">Seleccioná una plantilla</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-hi">Generador de enlace wa.me</h2>
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Plantilla</label>
              <select className="w-full bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp" value={selectedTpl} onChange={e => setSelectedTpl(e.target.value)}>
                {tenantTemplates.map(t => <option key={t.id} value={t.id}>{t.name}{t.isDefault ? ' ★' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Producto</label>
              <select className="w-full bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-hi outline-none focus:border-wapp" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                {tenantProducts.map(p => <option key={p.id} value={p.id}>{p.name} — {p.sku}</option>)}
              </select>
            </div>

            <div className="bg-panel border border-edge rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-dim">Destino</span>
                <span className="text-xs font-mono text-hi">wa.me/{currentTenant.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-dim">Catálogo público</span>
                <span className="text-xs font-mono text-wapp truncate max-w-[200px]">{catalogUrl}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-dim">Mensaje codificado</span>
                <span className="text-xs font-mono text-mid truncate max-w-[200px]">{encodeURIComponent(preview).slice(0, 30)}...</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-dim font-mono mb-1 block">Enlace generado</label>
              <div className="flex gap-2">
                <input readOnly className="flex-1 bg-panel border border-edge rounded-lg px-3 py-2 text-xs text-dim font-mono outline-none" value={waLink} />
                <button onClick={copyLink} className={`px-3 py-2 text-xs rounded-lg border cursor-pointer transition-all whitespace-nowrap ${copied ? 'bg-wapp/20 border-wapp/50 text-wapp' : 'border-edge text-mid hover:text-hi'}`}>
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-wapp text-canvas font-bold text-sm rounded-xl hover:bg-wapp/90 transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
              </svg>
              Abrir en WhatsApp
            </a>

            {/* QR code placeholder */}
            <div className="bg-surface border border-edge rounded-xl p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-canvas font-mono text-[8px] text-center leading-tight p-1 shrink-0">
                [QR CODE<br/>wa.me link]
              </div>
              <div>
                <p className="text-xs font-semibold text-hi">Código QR</p>
                <p className="text-[10px] text-dim mt-0.5">Compartí el enlace escaneando el código QR con la cámara de WhatsApp</p>
                <p className="text-[10px] text-dim font-mono mt-2">(En producción: biblioteca qrcode.react)</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h2 className="text-sm font-semibold text-hi mb-3">Mensaje generado</h2>
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d2040 100%)" }}>
              <div className="bg-[#1f2937]/80 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-wapp/30 flex items-center justify-center text-wapp font-bold">
                  {currentTenant.name.charAt(0)}
                </div>
                <p className="text-xs font-bold text-white">{currentTenant.name}</p>
              </div>
              <div className="p-4 min-h-[300px] flex flex-col justify-end">
                <div className="ml-auto max-w-[90%] bg-[#005c4b] rounded-2xl rounded-br-sm px-3 py-2 shadow-lg">
                  <p className="text-[11px] text-white leading-relaxed whitespace-pre-wrap font-inter">{preview || 'Seleccioná plantilla y producto...'}</p>
                  <p className="text-[9px] text-white/50 mt-1 text-right font-mono">
                    {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
