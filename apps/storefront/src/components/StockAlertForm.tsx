import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../store/toast';
import { useT } from '../i18n';
import type { Product } from '../lib/types';

// "Notify me": captura demanda de tallas agotadas
export function StockAlertForm({ product }: { product: Product }) {
  const t = useT();
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
      showToast(t('alert.success'));
    } catch {
      showToast(t('alert.error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-5 border border-bone/10 p-4">
      {done ? (
        <p className="text-sm text-bone">✓ {t('alert.successLong', { size })}</p>
      ) : !open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
        >
          {t('alert.trigger')}
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="text-[11px] uppercase tracking-luxe text-stone">{t('alert.title')}</p>
          <div className="flex gap-2">
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="field w-24 bg-coal"
              aria-label={t('pdp.size')}
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
              placeholder={t('waitlist.placeholder')}
              className="field flex-1"
            />
          </div>
          <button type="submit" disabled={sending} className="btn-outline w-full py-3 text-[11px]">
            {sending ? t('alert.sending') : t('alert.cta')}
          </button>
        </form>
      )}
    </div>
  );
}
