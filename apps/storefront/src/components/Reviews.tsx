import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { Reveal } from './Reveal';
import type { Product } from '../lib/types';

export function Stars({ value, className = 'w-4 h-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-bone">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={className}
          fill={i <= Math.round(value) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" />
        </svg>
      ))}
    </span>
  );
}

export function ratingSummary(product: Product) {
  const reviews = product.reviews ?? [];
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
  return { avg, count: reviews.length };
}

export function ReviewsSection({ product, slug }: { product: Product; slug: string }) {
  const user = useAuth((s) => s.user);
  const showToast = useToast((s) => s.show);
  const qc = useQueryClient();
  const reviews = product.reviews ?? [];
  const summary = ratingSummary(product);

  const mine = user ? reviews.find((r) => r.user?.name === user.name) : undefined;
  const [rating, setRating] = useState(mine?.rating ?? 5);
  const [comment, setComment] = useState(mine?.comment ?? '');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post(`/products/${product.id}/reviews`, {
        rating,
        comment: comment.trim() || undefined,
      });
      await qc.invalidateQueries({ queryKey: ['product', slug] });
      showToast(mine ? 'Valoración actualizada' : '¡Gracias por tu valoración!');
    } catch {
      showToast('No se pudo enviar tu valoración');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="reviews" className="px-5 md:px-0 mt-24 md:mt-32">
      <Reveal className="mb-10">
        <span className="eyebrow">Lo que dicen</span>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2 mt-2">
          <h2 className="font-display text-3xl md:text-4xl uppercase">Valoraciones</h2>
          {summary && (
            <span className="flex items-center gap-2 pb-1">
              <Stars value={summary.avg} />
              <span className="text-sm text-stone">
                {summary.avg.toFixed(1)} · {summary.count}{' '}
                {summary.count === 1 ? 'valoración' : 'valoraciones'}
              </span>
            </span>
          )}
        </div>
      </Reveal>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* LISTA */}
        <div>
          {reviews.length > 0 ? (
            <ul className="space-y-6">
              {reviews.map((r) => (
                <li key={r.id} className="border-b border-bone/10 pb-6">
                  <div className="flex items-center justify-between">
                    <Stars value={r.rating} className="w-3.5 h-3.5" />
                    <span className="text-[11px] text-stone">
                      {new Date(r.createdAt).toLocaleDateString('es-CR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-bone/80 mt-3 leading-relaxed">{r.comment}</p>}
                  <p className="text-[11px] uppercase tracking-wide text-stone mt-3">
                    {r.user?.name ?? 'Cliente NMRC'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-stone text-sm">
              Aún no hay valoraciones. Sé la primera persona en contarle al mundo cómo te queda.
            </p>
          )}
        </div>

        {/* FORM */}
        <div className="lg:border-l lg:border-bone/10 lg:pl-12">
          {user ? (
            <form onSubmit={submit} className="max-w-sm">
              <p className="eyebrow mb-4">{mine ? 'Edita tu valoración' : 'Deja tu valoración'}</p>
              <div className="flex gap-1.5 mb-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    aria-label={`${i} estrellas`}
                    className={`transition-colors ${i <= rating ? 'text-bone' : 'text-bone/25 hover:text-bone/60'}`}
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill={i <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.3">
                      <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                rows={4}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Cómo te quedó? ¿Qué tal la calidad?"
                className="field resize-none"
              />
              <button type="submit" disabled={sending} className="btn-ink w-full mt-5">
                {sending ? 'Enviando…' : mine ? 'Actualizar valoración' : 'Enviar valoración'}
              </button>
            </form>
          ) : (
            <div className="max-w-sm">
              <p className="eyebrow mb-3">Deja tu valoración</p>
              <p className="text-sm text-stone mb-6">
                Inicia sesión para contar tu experiencia con esta pieza.
              </p>
              <Link to="/login" className="btn-outline">
                Acceder
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
