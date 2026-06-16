import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, formatCRC } from '../lib/api';
import { useAuth } from '../store/auth';
import type { BestSeller, LowStockRow, Order, Stats } from '../lib/types';

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
const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-clay/15 text-clay',
  PAID: 'bg-ink text-bone',
  FULFILLED: 'bg-sand text-ink',
  CANCELLED: 'bg-red-100 text-red-700',
};

// Tarjeta accionable del "centro de acciones"
function ActionCard({
  icon,
  count,
  label,
  cta,
  to,
  tone,
}: {
  icon: ReactNode;
  count: number;
  label: string;
  cta: string;
  to: string;
  tone: 'urgent' | 'warn' | 'calm';
}) {
  const styles = {
    urgent: 'border-red-200 bg-red-50',
    warn: 'border-clay/30 bg-clay/5',
    calm: 'border-line bg-paper',
  }[tone];
  const dot = { urgent: 'bg-red-500', warn: 'bg-clay', calm: 'bg-ink/30' }[tone];
  return (
    <Link to={to} className={`group rounded border ${styles} p-5 flex items-center gap-4 transition-shadow hover:shadow-sm`}>
      <span className="w-10 h-10 rounded-full bg-bone border border-line flex items-center justify-center text-ink shrink-0">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl leading-none">{count}</span>
          {count > 0 && <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />}
        </div>
        <p className="text-xs text-stone mt-1 leading-tight">{label}</p>
      </div>
      <span className="text-[11px] uppercase tracking-wide text-ink opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {cta} →
      </span>
    </Link>
  );
}

function Trend({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const up = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
        up ? 'bg-ink/5 text-ink' : 'bg-red-50 text-red-700'
      }`}
    >
      <svg viewBox="0 0 24 24" className={`w-3 h-3 ${up ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
      {Math.abs(delta)}%
    </span>
  );
}

function Metric({
  label,
  value,
  delta = null,
  spark,
}: {
  label: string;
  value: string;
  delta?: number | null;
  spark?: number[];
}) {
  const data = (spark ?? []).map((v, i) => ({ i, v }));
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        <Trend delta={delta} />
      </div>
      <p className="font-display text-4xl mt-2">{value}</p>
      {data.length > 1 && (
        <div className="h-10 mt-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
              <Line type="monotone" dataKey="v" stroke="#22201C" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function Overview() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get<Stats>('/orders/stats')).data,
  });
  const { data: best } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: async () => (await api.get<BestSeller[]>('/orders/best-sellers')).data,
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

  const maxUnits = Math.max(1, ...(best?.map((b) => b.units) ?? [1]));

  // Tendencia de ingresos: últimos 7 días vs los 7 anteriores (sobre revenueByDay de 14 días)
  const byDay = stats?.revenueByDay ?? [];
  const revSpark = byDay.map((d) => d.revenueCents / 100);
  const ordSpark = byDay.map((d) => d.orders);
  const last7 = byDay.slice(-7).reduce((n, d) => n + d.revenueCents, 0);
  const prev7 = byDay.slice(-14, -7).reduce((n, d) => n + d.revenueCents, 0);
  const revDelta =
    byDay.length >= 14 && prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : null;
  const ordLast7 = byDay.slice(-7).reduce((n, d) => n + d.orders, 0);
  const ordPrev7 = byDay.slice(-14, -7).reduce((n, d) => n + d.orders, 0);
  const ordDelta =
    byDay.length >= 14 && ordPrev7 > 0 ? Math.round(((ordLast7 - ordPrev7) / ordPrev7) * 100) : null;

  // Centro de acciones: lo que requiere atención hoy
  const firstName = useAuth((s) => s.user?.name?.split(' ')[0]);
  const pendingCount =
    stats?.ordersByStatus.find((s) => s.status === 'PENDING')?.count ?? 0;
  const outOfStock = (lowStock ?? []).filter((r) => r.stock === 0).length;
  const lowCount = (lowStock ?? []).length;
  const today = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      {/* SALUDO + ESTADO */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">No Mercy · Panel</span>
          <h1 className="font-display text-4xl mt-1">
            {firstName ? `Hola, ${firstName}` : 'Resumen'}
          </h1>
          <p className="text-sm text-stone mt-1 capitalize">{today}</p>
        </div>
        <Link to="/products" className="btn py-2.5">
          + Nuevo producto
        </Link>
      </header>

      {/* CENTRO DE ACCIONES */}
      <div className="mb-8">
        <p className="eyebrow mb-3">Requiere tu atención</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <ActionCard
            tone={pendingCount > 0 ? 'urgent' : 'calm'}
            count={pendingCount}
            label="Pedidos pendientes de pago por confirmar"
            cta="Revisar"
            to="/orders"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            }
          />
          <ActionCard
            tone={outOfStock > 0 ? 'warn' : 'calm'}
            count={outOfStock}
            label="Tallas agotadas para reponer"
            cta="Reponer"
            to="/products"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7" />
              </svg>
            }
          />
          <ActionCard
            tone="calm"
            count={lowCount}
            label="Piezas con inventario bajo (≤ 5)"
            cta="Ver"
            to="/products"
            icon={
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Metric
          label="Ingresos confirmados"
          value={formatCRC(stats?.revenueCents ?? 0)}
          delta={revDelta}
          spark={revSpark}
        />
        <Metric label="Ticket promedio" value={formatCRC(stats?.avgOrderCents ?? 0)} />
        <Metric
          label="Pedidos totales"
          value={String(stats?.totalOrders ?? 0)}
          delta={ordDelta}
          spark={ordSpark}
        />
        <Metric label="Productos" value={String(stats?.totalProducts ?? 0)} />
      </div>

      {/* VENTAS ÚLTIMOS 14 DÍAS */}
      <div className="card p-6 mb-6">
        <div className="flex items-baseline justify-between mb-6">
          <p className="eyebrow">Ventas confirmadas · últimos 14 días</p>
          <span className="text-xs text-stone">
            {formatCRC(stats?.revenueByDay?.reduce((n, d) => n + d.revenueCents, 0) ?? 0)} en el período
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={(stats?.revenueByDay ?? []).map((d) => ({
                ...d,
                label: new Date(d.date + 'T12:00:00').toLocaleDateString('es-CR', {
                  day: '2-digit',
                  month: 'short',
                }),
                colones: d.revenueCents / 100,
              }))}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22201C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22201C" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6F6557' }} axisLine={false} tickLine={false} interval={1} />
              <YAxis
                tick={{ fontSize: 10, fill: '#6F6557' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`}
                width={52}
              />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === 'colones' ? [`₡${v.toLocaleString('es-CR')}`, 'Ventas'] : [v, 'Pedidos']
                }
                labelStyle={{ fontSize: 12 }}
                contentStyle={{ fontSize: 12, border: '1px solid #E6E1D6' }}
              />
              <Area type="monotone" dataKey="colones" stroke="#22201C" strokeWidth={1.6} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* CHART */}
        <div className="card p-6 lg:col-span-2">
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
          <div className="flex items-baseline justify-between mb-5">
            <p className="eyebrow">Bajo inventario (≤ 5)</p>
            {lowStock && lowStock.length > 0 && (
              <span className="text-[11px] text-stone">{lowStock.length} alertas</span>
            )}
          </div>
          {lowStock && lowStock.length > 0 ? (
            <ul className="space-y-3.5">
              {lowStock.slice(0, 7).map((row) => {
                const out = row.stock === 0;
                const pct = Math.min(100, (row.stock / 5) * 100);
                return (
                  <li key={row.id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="truncate">
                        {row.product.name} <span className="text-stone">· {row.size}</span>
                      </span>
                      <span className={`shrink-0 ml-2 font-medium ${out ? 'text-red-700' : 'text-stone'}`}>
                        {out ? 'Agotado' : `${row.stock} uds`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-line rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${out ? 'bg-red-500' : pct <= 40 ? 'bg-clay' : 'bg-ink'}`}
                        style={{ width: `${out ? 100 : pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-stone">Todo el inventario está saludable.</p>
          )}
        </div>
      </div>

      {/* BEST SELLERS */}
      <div className="card p-6 mb-6">
        <p className="eyebrow mb-5">Productos más vendidos</p>
        {best && best.length > 0 ? (
          <ul className="space-y-4">
            {best.map((b, i) => (
              <li key={b.productId} className="flex items-center gap-4">
                <span className="font-display text-2xl w-7 text-stone">{i + 1}</span>
                <div className="w-11 h-14 bg-sand overflow-hidden shrink-0">
                  {b.image && <img src={b.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  <div className="mt-1.5 h-1.5 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ink rounded-full"
                      style={{ width: `${(b.units / maxUnits) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium">{b.units} uds</p>
                  <p className="text-xs text-stone">{formatCRC(b.revenueCents)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone">
            Aún no hay ventas confirmadas. Marca pedidos como pagados para ver el ranking.
          </p>
        )}
      </div>

      {/* RECENT ORDERS */}
      <div className="card">
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
                  <span className={`badge ${STATUS_BADGE[o.status] ?? 'bg-sand text-stone'}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
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
