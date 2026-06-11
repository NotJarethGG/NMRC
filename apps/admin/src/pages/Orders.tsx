import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, formatCRC } from '../lib/api';
import { useOrders } from '../hooks/useAdmin';
import { downloadCSV } from '../lib/csv';
import type { Order, OrderStatus } from '../lib/types';

const STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'PAID', label: 'Pagados' },
  { value: 'FULFILLED', label: 'Enviados' },
  { value: 'CANCELLED', label: 'Cancelados' },
];

const BADGE: Record<string, string> = {
  PENDING: 'bg-sand text-stone',
  PAID: 'bg-ink text-bone',
  FULFILLED: 'bg-stone text-bone',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function Orders() {
  const [filter, setFilter] = useState('');
  const { data: orders, isLoading } = useOrders(filter);
  const [selected, setSelected] = useState<Order | null>(null);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  // Abre el detalle trayendo la orden completa desde la API (autoritativa)
  const openOrder = async (order: Order) => {
    setSelected(order);
    try {
      const { data } = await api.get<Order>(`/orders/${order.id}`);
      setSelected(data);
    } catch {
      /* se mantiene el dato de la lista */
    }
  };

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setBusy(true);
    try {
      const { data } = await api.patch<Order>(`/orders/${order.id}/status`, { status });
      setSelected(data);
      qc.invalidateQueries({ queryKey: ['admin-orders'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['low-stock'] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <header className="flex items-end justify-between mb-8">
        <div>
          <span className="eyebrow">Operación</span>
          <h1 className="font-display text-4xl mt-1">Pedidos</h1>
        </div>
        <button
          onClick={() => {
            const rows: (string | number)[][] = [
              ['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Dirección', 'Piezas', 'Subtotal', 'Envío', 'Total', 'Estado'],
            ];
            (orders ?? []).forEach((o) =>
              rows.push([
                `#${o.id.slice(-8).toUpperCase()}`,
                new Date(o.createdAt).toLocaleDateString('es-CR'),
                o.user?.name ?? o.shippingName,
                o.shippingPhone,
                o.shippingAddress,
                o.items.reduce((n, it) => n + it.quantity, 0),
                (o.subtotalCents ?? o.totalCents) / 100,
                (o.shippingCents ?? 0) / 100,
                o.totalCents / 100,
                o.status,
              ]),
            );
            downloadCSV(`nmrc-pedidos${filter ? '-' + filter.toLowerCase() : ''}.csv`, rows);
          }}
          disabled={!orders?.length}
          className="btn-ghost py-2.5 disabled:opacity-40"
        >
          Exportar CSV
        </button>
      </header>

      <div className="flex gap-6 mb-6 text-sm">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`uppercase tracking-wide text-[11px] pb-1 border-b-2 ${
              filter === s.value ? 'border-ink text-ink' : 'border-transparent text-stone'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone text-[11px] uppercase tracking-wide border-b border-line">
              <th className="px-6 py-3 font-normal">Pedido</th>
              <th className="px-6 py-3 font-normal">Cliente</th>
              <th className="px-6 py-3 font-normal">Fecha</th>
              <th className="px-6 py-3 font-normal">Total</th>
              <th className="px-6 py-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-stone">Cargando…</td>
              </tr>
            )}
            {orders?.map((o) => (
              <tr
                key={o.id}
                onClick={() => openOrder(o)}
                className="border-b border-line last:border-0 hover:bg-paper cursor-pointer"
              >
                <td className="px-6 py-3 font-medium">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="px-6 py-3">{o.user?.name ?? o.shippingName}</td>
                <td className="px-6 py-3 text-stone">
                  {new Date(o.createdAt).toLocaleDateString('es-CR')}
                </td>
                <td className="px-6 py-3">{formatCRC(o.totalCents)}</td>
                <td className="px-6 py-3">
                  <span className={`badge ${BADGE[o.status]}`}>{o.status}</span>
                </td>
              </tr>
            ))}
            {orders && orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-stone">Sin pedidos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DETALLE */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-bone h-full overflow-y-auto">
            <div className="px-8 h-16 flex items-center justify-between border-b border-line">
              <h2 className="font-display text-2xl">#{selected.id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelected(null)} className="text-stone hover:text-ink text-sm">
                Cerrar ✕
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`badge ${BADGE[selected.status]}`}>{selected.status}</span>
                <span className="font-display text-2xl">{formatCRC(selected.totalCents)}</span>
              </div>

              <div className="card p-4 text-sm space-y-1">
                <p className="font-medium">{selected.shippingName}</p>
                <p className="text-stone">{selected.shippingPhone}</p>
                <p className="text-stone">{selected.shippingAddress}</p>
                {selected.notes && <p className="text-stone italic mt-2">“{selected.notes}”</p>}
              </div>

              <div>
                <p className="eyebrow mb-3">Artículos</p>
                <ul className="divide-y divide-line">
                  {selected.items.map((it) => (
                    <li key={it.id} className="flex justify-between py-2.5 text-sm">
                      <span>
                        {it.productName} <span className="text-stone">· {it.size} · ×{it.quantity}</span>
                      </span>
                      <span>{formatCRC(it.unitPriceCents * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selected.subtotalCents != null && (
                <div className="text-sm space-y-1.5 border-t border-line pt-4">
                  <div className="flex justify-between text-stone">
                    <span>Subtotal</span>
                    <span className="text-ink">{formatCRC(selected.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between text-stone">
                    <span>Envío</span>
                    <span className="text-ink">
                      {selected.shippingCents ? formatCRC(selected.shippingCents) : 'Gratis'}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-1">
                    <span>Total</span>
                    <span>{formatCRC(selected.totalCents)}</span>
                  </div>
                </div>
              )}

              {selected.user?.phone && (
                <a
                  href={`https://wa.me/${selected.user.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost w-full py-2.5"
                >
                  Escribir al cliente por WhatsApp
                </a>
              )}

              {/* ACCIONES DE ESTADO */}
              <div>
                <p className="eyebrow mb-3">Cambiar estado</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={busy || selected.status === 'PAID'}
                    onClick={() => changeStatus(selected, 'PAID')}
                    className="btn py-2.5"
                  >
                    Confirmar pago
                  </button>
                  <button
                    disabled={busy || selected.status === 'FULFILLED'}
                    onClick={() => changeStatus(selected, 'FULFILLED')}
                    className="btn-ghost py-2.5"
                  >
                    Marcar enviado
                  </button>
                  <button
                    disabled={busy || selected.status === 'CANCELLED'}
                    onClick={() => changeStatus(selected, 'CANCELLED')}
                    className="btn-ghost py-2.5 col-span-2 hover:bg-red-700 hover:border-red-700"
                  >
                    Cancelar pedido
                  </button>
                </div>
                <p className="text-[11px] text-stone mt-3">
                  Al confirmar el pago se descuenta el inventario automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
