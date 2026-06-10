import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { api, formatCRC } from '../lib/api';
import type { Order } from '../lib/types';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pago confirmado',
  FULFILLED: 'Enviado',
  CANCELLED: 'Cancelado',
};

export function Account() {
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  const qc = useQueryClient();
  const showToast = useToast((s) => s.show);

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get<Order[]>('/orders/mine')).data,
    enabled: !!user,
  });

  const cancelOrder = async (id: string) => {
    if (!confirm('¿Cancelar este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await api.patch(`/orders/mine/${id}/cancel`);
      await qc.invalidateQueries({ queryKey: ['my-orders'] });
      showToast('Pedido cancelado');
    } catch {
      showToast('No se pudo cancelar el pedido');
    }
  };

  if (!loading && !user) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <h1 className="font-display text-4xl mb-6">Tu cuenta</h1>
        <Link to="/login" className="btn-ink">Acceder</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-32">
      <div className="max-w-3xl mx-auto px-5 md:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="eyebrow">Mi cuenta</span>
            <h1 className="font-display text-4xl md:text-5xl mt-3">Hola, {user?.name?.split(' ')[0]}</h1>
            <p className="text-stone text-sm mt-2">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-[11px] uppercase tracking-luxe link-underline text-stone hover:text-bone"
          >
            Cerrar sesión
          </button>
        </div>

        <h2 className="eyebrow mb-6">Mis pedidos</h2>

        {orders && orders.length > 0 ? (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="border border-bone/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">#{o.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-stone mt-1">
                      {new Date(o.createdAt).toLocaleDateString('es-CR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-luxe px-3 py-1 ${
                      o.status === 'PENDING'
                        ? 'bg-clay/20 text-taupe'
                        : o.status === 'CANCELLED'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-bone text-noir'
                    }`}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone">
                    {o.items.length} {o.items.length === 1 ? 'pieza' : 'piezas'}
                  </span>
                  <span>{formatCRC(o.totalCents)}</span>
                </div>

                {/* TIMELINE DE ESTADO (Pendiente → Pagado → Enviado) */}
                {o.status !== 'CANCELLED' &&
                  (() => {
                    const STEPS = ['PENDING', 'PAID', 'FULFILLED'] as const;
                    const LABELS = ['Pendiente', 'Pagado', 'Enviado'];
                    const idx = STEPS.indexOf(o.status as (typeof STEPS)[number]);
                    return (
                      <div className="mt-5">
                        <div className="flex items-center">
                          {STEPS.map((s, i) => (
                            <div key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                              <div
                                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                                  i <= idx ? 'bg-bone' : 'bg-bone/20'
                                }`}
                              />
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-px mx-1.5 ${i < idx ? 'bg-bone' : 'bg-bone/20'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] uppercase tracking-wide text-stone">
                          {LABELS.map((l, i) => (
                            <span key={l} className={i <= idx ? 'text-bone/80' : ''}>
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                {o.status === 'PENDING' && (
                  <div className="flex items-center gap-6 mt-4">
                    <Link
                      to={`/order/${o.id}`}
                      className="text-[11px] uppercase tracking-luxe link-underline"
                    >
                      Completar pago →
                    </Link>
                    <button
                      onClick={() => cancelOrder(o.id)}
                      className="text-[11px] uppercase tracking-luxe text-stone hover:text-red-400 transition-colors"
                    >
                      Cancelar pedido
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-bone/10 p-12 text-center">
            <p className="text-stone mb-6">Aún no tienes pedidos.</p>
            <Link to="/shop" className="btn-ink">Explorar la colección</Link>
          </div>
        )}
      </div>
    </div>
  );
}
