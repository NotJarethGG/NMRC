import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, formatCRC } from '../lib/api';
import type { LowStockRow, Order, Stats } from '../lib/types';

const STATUS_COLOR: Record<string, string> = {
  PENDING: '#C9C1B4',
  PAID: '#6F6557',
  FULFILLED: '#141414',
  CANCELLED: '#B45454',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendientes',
  PAID: 'Pagados',
  FULFILLED: 'Enviados',
  CANCELLED: 'Cancelados',
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-6">
      <p className="eyebrow">{label}</p>
      <p className="font-display text-4xl mt-2">{value}</p>
    </div>
  );
}

export function Overview() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get<Stats>('/orders/stats')).data,
  });
  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => (await api.get<LowStockRow[]>('/products/low-stock')).data,
  });
  const { data: recent } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => (await api.get<Order[]>('/orders')).data,
  });

  const chartData =
    stats?.ordersByStatus.map((s) => ({
      name: STATUS_LABEL[s.status] ?? s.status,
      status: s.status,
      count: s.count,
    })) ?? [];

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Panel</span>
        <h1 className="font-display text-4xl mt-1">Resumen</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Metric label="Ingresos confirmados" value={formatCRC(stats?.revenueCents ?? 0)} />
        <Metric label="Pedidos totales" value={String(stats?.totalOrders ?? 0)} />
        <Metric label="Productos" value={String(stats?.totalProducts ?? 0)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CHART */}
        <div className="card p-6">
          <p className="eyebrow mb-6">Pedidos por estado</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6F6557' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6F6557' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#00000008' }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.status} fill={STATUS_COLOR[d.status] ?? '#141414'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="card p-6">
          <p className="eyebrow mb-5">Bajo inventario (≤ 5)</p>
          {lowStock && lowStock.length > 0 ? (
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 7).map((row) => (
                <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    {row.product.name} <span className="text-stone">· {row.size}</span>
                  </span>
                  <span className={`badge ${row.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-sand text-stone'}`}>
                    {row.stock} uds
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone">Todo el inventario está saludable.</p>
          )}
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="card mt-6">
        <div className="px-6 py-4 border-b border-line">
          <p className="eyebrow">Pedidos recientes</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone text-[11px] uppercase tracking-wide">
              <th className="px-6 py-3 font-normal">Pedido</th>
              <th className="px-6 py-3 font-normal">Cliente</th>
              <th className="px-6 py-3 font-normal">Total</th>
              <th className="px-6 py-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recent?.slice(0, 6).map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="px-6 py-3">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="px-6 py-3">{o.user?.name ?? o.shippingName}</td>
                <td className="px-6 py-3">{formatCRC(o.totalCents)}</td>
                <td className="px-6 py-3">
                  <span className="badge bg-sand text-stone">{STATUS_LABEL[o.status]}</span>
                </td>
              </tr>
            ))}
            {(!recent || recent.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-stone">
                  Aún no hay pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
