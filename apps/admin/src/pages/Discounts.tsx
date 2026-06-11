import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { DiscountCode } from '../lib/types';

export function Discounts() {
  const qc = useQueryClient();
  const { data: codes } = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: async () => (await api.get<DiscountCode[]>('/discounts')).data,
  });

  const [form, setForm] = useState({ code: '', percentOff: 10, expiresAt: '', maxUses: '' });
  const [error, setError] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-discounts'] });

  const create = async () => {
    setError(null);
    try {
      await api.post('/discounts', {
        code: form.code,
        percentOff: Number(form.percentOff),
        expiresAt: form.expiresAt || undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      });
      setForm({ code: '', percentOff: 10, expiresAt: '', maxUses: '' });
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo crear el código');
    }
  };

  const toggle = async (c: DiscountCode) => {
    await api.patch(`/discounts/${c.id}`, { active: !c.active });
    refresh();
  };

  const remove = async (c: DiscountCode) => {
    if (!confirm(`¿Eliminar el código ${c.code}?`)) return;
    await api.delete(`/discounts/${c.id}`);
    refresh();
  };

  const estado = (c: DiscountCode) => {
    if (!c.active) return { t: 'INACTIVO', cls: 'bg-line text-stone' };
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { t: 'VENCIDO', cls: 'bg-red-100 text-red-700' };
    if (c.maxUses != null && c.uses >= c.maxUses) return { t: 'AGOTADO', cls: 'bg-sand text-stone' };
    return { t: 'ACTIVO', cls: 'bg-ink text-bone' };
  };

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Promociones</span>
        <h1 className="font-display text-4xl mt-1">Descuentos</h1>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        {/* TABLA */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone text-[11px] uppercase tracking-wide border-b border-line">
                <th className="px-5 py-3 font-normal">Código</th>
                <th className="px-5 py-3 font-normal">Desc.</th>
                <th className="px-5 py-3 font-normal">Usos</th>
                <th className="px-5 py-3 font-normal">Expira</th>
                <th className="px-5 py-3 font-normal">Estado</th>
                <th className="px-5 py-3 font-normal text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {codes?.map((c) => {
                const e = estado(c);
                return (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper">
                    <td className="px-5 py-3 font-medium uppercase tracking-wide">{c.code}</td>
                    <td className="px-5 py-3">{c.percentOff}%</td>
                    <td className="px-5 py-3 text-stone">
                      {c.uses}
                      {c.maxUses != null ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="px-5 py-3 text-stone">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('es-CR') : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggle(c)} title="Activar/desactivar" className={`badge ${e.cls} hover:opacity-80`}>
                        {e.t}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => remove(c)} className="text-red-700 text-xs hover:underline">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {codes && codes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-stone">
                    Sin códigos. Crea el primero para tu próximo drop.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FORM */}
        <div className="card p-6">
          <p className="eyebrow mb-5">Nuevo código</p>
          <div className="space-y-4">
            <div>
              <label className="label">Código</label>
              <input
                className="field uppercase"
                placeholder="NOMERCY10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Porcentaje de descuento (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                className="field"
                value={form.percentOff}
                onChange={(e) => setForm({ ...form, percentOff: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Expira (opcional)</label>
              <input
                type="date"
                className="field"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Usos máximos (opcional)</label>
              <input
                type="number"
                min={1}
                className="field"
                placeholder="Ilimitado"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button onClick={create} disabled={!form.code.trim()} className="btn w-full py-3">
              Crear código
            </button>
            <p className="text-[11px] text-stone leading-relaxed">
              Toca el estado en la tabla para activar/desactivar un código. El descuento se aplica
              sobre el subtotal; el envío se calcula sobre el monto ya descontado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
