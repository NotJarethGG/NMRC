import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { downloadCSV } from '../lib/csv';
import type { AdminReview, StockAlert, Subscriber } from '../lib/types';

function StarsInline({ value }: { value: number }) {
  return (
    <span className="text-ink text-xs tracking-[0.15em]" aria-label={`${value} de 5`}>
      {'★'.repeat(value)}
      <span className="text-line">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

export function Community() {
  const qc = useQueryClient();

  const { data: reviews } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => (await api.get<AdminReview[]>('/reviews')).data,
  });
  const { data: subscribers } = useQuery({
    queryKey: ['admin-subscribers'],
    queryFn: async () => (await api.get<Subscriber[]>('/newsletter')).data,
  });
  const { data: alerts } = useQuery({
    queryKey: ['admin-stock-alerts'],
    queryFn: async () => (await api.get<StockAlert[]>('/stock-alerts')).data,
  });

  const removeAlert = async (id: string) => {
    await api.delete(`/stock-alerts/${id}`);
    qc.invalidateQueries({ queryKey: ['admin-stock-alerts'] });
  };

  const removeReview = async (r: AdminReview) => {
    if (!confirm(`¿Eliminar la valoración de ${r.user?.name ?? 'cliente'} sobre "${r.product?.name}"?`))
      return;
    await api.delete(`/reviews/${r.id}`);
    qc.invalidateQueries({ queryKey: ['admin-reviews'] });
  };

  const exportSubscribers = () => {
    const rows: (string | number)[][] = [['Correo', 'Fecha de suscripción']];
    (subscribers ?? []).forEach((s) =>
      rows.push([s.email, new Date(s.createdAt).toLocaleDateString('es-CR')]),
    );
    downloadCSV('nmrc-suscriptores.csv', rows);
  };

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Clientes</span>
        <h1 className="font-display text-4xl mt-1">Comunidad</h1>
      </header>

      <div className="grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        {/* VALORACIONES */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <p className="eyebrow">Valoraciones ({reviews?.length ?? 0})</p>
          </div>
          {reviews && reviews.length > 0 ? (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.product?.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <StarsInline value={r.rating} />
                        <span className="text-[11px] text-stone">
                          {r.user?.name} · {new Date(r.createdAt).toLocaleDateString('es-CR')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeReview(r)}
                      className="text-red-700 text-xs hover:underline shrink-0"
                    >
                      Eliminar
                    </button>
                  </div>
                  {r.comment && <p className="text-sm text-stone mt-2 leading-relaxed">“{r.comment}”</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-10 text-center text-stone text-sm">Aún no hay valoraciones.</p>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
        {/* SUSCRIPTORES */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <p className="eyebrow">Newsletter ({subscribers?.length ?? 0})</p>
            <button
              onClick={exportSubscribers}
              disabled={!subscribers?.length}
              className="text-xs uppercase tracking-wide text-ink hover:underline disabled:opacity-40"
            >
              Exportar CSV
            </button>
          </div>
          {subscribers && subscribers.length > 0 ? (
            <ul className="divide-y divide-line">
              {subscribers.map((s) => (
                <li key={s.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <span className="truncate">{s.email}</span>
                  <span className="text-[11px] text-stone shrink-0 ml-3">
                    {new Date(s.createdAt).toLocaleDateString('es-CR')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-10 text-center text-stone text-sm">Sin suscriptores todavía.</p>
          )}
        </div>

        {/* AVÍSAME CUANDO VUELVA */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-line">
            <p className="eyebrow">Avísame cuando vuelva ({alerts?.length ?? 0})</p>
          </div>
          {alerts && alerts.length > 0 ? (
            <ul className="divide-y divide-line">
              {alerts.map((a) => (
                <li key={a.id} className="px-6 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{a.email}</span>
                    <button
                      onClick={() => removeAlert(a.id)}
                      className="text-red-700 text-xs hover:underline shrink-0"
                      title="Eliminar (ya notificado)"
                    >
                      Listo
                    </button>
                  </div>
                  <p className="text-[11px] text-stone mt-0.5">
                    {a.product?.name}
                    {a.size ? ` · talla ${a.size}` : ''} ·{' '}
                    {new Date(a.createdAt).toLocaleDateString('es-CR')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-10 text-center text-stone text-sm">
              Nadie espera reposiciones por ahora.
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
