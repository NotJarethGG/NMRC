import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../store/toast';
import type { Product } from '../lib/types';

// "Avísame cuando vuelva": captura demanda de tallas agotadas
export function StockAlertForm({ product }: { product: Product }) {
  const showToast = useToast((s) => s.show);
  const outSizes = product.variants.filter((v) => v.stock <= 0).map((v) => v.size);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [size, setSize] = useState(outSizes[0] ?? '');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (outSizes.length === 0) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      await api.post('/stock-alerts', { email: email.trim(), productId: product.id, size });
      setDone(true);
      showToast('Te avisaremos cuando vuelva');
    } catch {
      showToast('No se pudo registrar tu correo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-5 border border-bone/10 p-4">
      {done ? (
        <p className="text-sm text-bone">
          ✓ Listo — te avisaremos cuando la talla <span className="uppercase">{size}</span> vuelva a
          estar disponible.
        </p>
      ) : !open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
        >
          ¿Tu talla está agotada? Avísame cuando vuelva →
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-[11px] uppercase tracking-luxe text-stone">Avísame cuando vuelva</p>
          <div className="flex gap-2">
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="field w-24 bg-coal"
              aria-label="Talla agotada"
            >
              {outSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="field flex-1"
            />
          </div>
          <button type="submit" disabled={sending} className="btn-outline w-full py-3 text-[11px]">
            {sending ? 'Enviando…' : 'Avisarme'}
          </button>
        </form>
      )}
    </div>
  );
}
