import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
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

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => (await api.get<Order[]>('/orders/mine')).data,
    enabled: !!user,
  });

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
            className="text-[11px] uppercase tracking-luxe link-underline text-stone hover:text-ink"
          >
            Cerrar sesión
          </button>
        </div>

        <h2 className="eyebrow mb-6">Mis pedidos</h2>

        {orders && orders.length > 0 ? (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="border border-ink/10 p-6">
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
                        ? 'bg-clay/20 text-stone'
                        : o.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-ink text-bone'
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
                {o.status === 'PENDING' && (
                  <Link
                    to={`/order/${o.id}`}
                    className="inline-block mt-4 text-[11px] uppercase tracking-luxe link-underline"
                  >
                    Completar pago →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="border border-ink/10 p-12 text-center">
            <p className="text-stone mb-6">Aún no tienes pedidos.</p>
            <Link to="/shop" className="btn-ink">Explorar la colección</Link>
          </div>
        )}
      </div>
    </div>
  );
}
