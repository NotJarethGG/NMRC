import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { api, formatCRC } from '../lib/api';
import { useConfig, shippingFor } from '../hooks/useConfig';
import { useToast } from '../store/toast';
import type { Order } from '../lib/types';

export function Checkout() {
  const { lines, totalCents, clear } = useCart();
  const config = useConfig();
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);
  const navigate = useNavigate();
  const showToast = useToast((s) => s.show);

  const [form, setForm] = useState({
    shippingName: user?.name ?? '',
    shippingPhone: user?.phone ?? '',
    shippingAddress: user?.address ?? '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cupón de descuento
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; percentOff: number } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const subtotal = totalCents();
  const discount = coupon ? Math.round((subtotal * coupon.percentOff) / 100) : 0;
  const shipping = shippingFor(subtotal - discount, config);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code || checkingCoupon) return;
    setCheckingCoupon(true);
    try {
      const { data } = await api.post('/discounts/validate', { code, subtotalCents: subtotal });
      if (data.valid) {
        setCoupon({ code: data.code, percentOff: data.percentOff });
        showToast(`Código ${data.code} aplicado: −${data.percentOff}%`);
      } else {
        setCoupon(null);
        showToast('Código inválido o vencido');
      }
    } catch {
      showToast('No se pudo validar el código');
    } finally {
      setCheckingCoupon(false);
    }
  };

  if (!loading && !user) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <span className="eyebrow">Un paso más</span>
        <h1 className="font-display text-4xl md:text-5xl mt-4 mb-6">Inicia sesión para continuar</h1>
        <p className="text-stone max-w-sm mx-auto mb-10">
          Necesitas una cuenta para finalizar tu pedido y seguir su estado.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login?redirect=/checkout" className="btn-ink">Acceder</Link>
          <Link to="/register?redirect=/checkout" className="btn-outline">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="pt-40 pb-32 text-center px-6">
        <h1 className="font-display text-4xl md:text-5xl mb-6">Tu bolsa está vacía</h1>
        <Link to="/shop" className="btn-ink">Explorar la colección</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post<Order>('/orders', {
        items: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
        })),
        ...form,
        couponCode: coupon?.code,
      });
      clear();
      navigate(`/order/${data.id}`, { state: { order: data } });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No pudimos procesar tu pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-28 md:pt-36 pb-32">
      <div className="max-w-editorial mx-auto px-5 md:px-10 grid lg:grid-cols-[1.2fr_1fr] gap-16">
        {/* FORM */}
        <div>
          <span className="eyebrow">Finalizar compra</span>
          <h1 className="font-display text-4xl md:text-5xl mt-3 mb-10">Datos de envío</h1>

          <form onSubmit={submit} className="space-y-7 max-w-lg">
            <div>
              <label className="eyebrow block mb-2">Nombre completo</label>
              <input
                required
                className="field"
                value={form.shippingName}
                onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Teléfono (WhatsApp)</label>
              <input
                required
                className="field"
                placeholder="8888-8888"
                value={form.shippingPhone}
                onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Dirección de entrega</label>
              <textarea
                required
                rows={3}
                className="field resize-none"
                value={form.shippingAddress}
                onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Notas (opcional)</label>
              <input
                className="field"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-ink w-full">
              {submitting ? 'Procesando…' : 'Confirmar pedido'}
            </button>
            <p className="text-[11px] text-stone text-center tracking-wide">
              El pago se realiza por SINPE Móvil tras confirmar. Recibirás las instrucciones en la
              siguiente pantalla.
            </p>
          </form>
        </div>

        {/* SUMMARY */}
        <div className="lg:border-l lg:border-bone/10 lg:pl-12">
          <span className="eyebrow">Tu pedido</span>
          <ul className="mt-6 space-y-5">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-4">
                <div className="w-16 h-20 bg-graphite overflow-hidden shrink-0">
                  {l.image && <img src={l.image} alt={l.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-stone mt-1">Talla {l.size} · ×{l.quantity}</p>
                  </div>
                  <span className="text-sm">{formatCRC(l.priceCents * l.quantity)}</span>
                </div>
              </li>
            ))}
          </ul>
          {/* CUPÓN */}
          <div className="mt-8 pt-6 border-t border-bone/10">
            {coupon ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-bone">
                  Código <span className="uppercase tracking-wide">{coupon.code}</span> · −{coupon.percentOff}%
                </span>
                <button
                  onClick={() => setCoupon(null)}
                  className="text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyCoupon())}
                  placeholder="Código de descuento"
                  className="field flex-1 uppercase"
                />
                <button
                  onClick={applyCoupon}
                  disabled={checkingCoupon || !couponInput.trim()}
                  className="btn-outline px-5 py-0 text-[11px] disabled:opacity-40"
                >
                  {checkingCoupon ? '…' : 'Aplicar'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-bone/10 space-y-2 text-sm">
            <div className="flex justify-between text-stone">
              <span>Subtotal</span>
              <span className="text-bone">{formatCRC(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-stone">
                <span>Descuento ({coupon?.code})</span>
                <span className="text-clay">−{formatCRC(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone">
              <span>Envío</span>
              <span className="text-bone">{shipping === 0 ? 'Gratis' : formatCRC(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-[11px] text-clay pt-1">
                Envío gratis en compras desde {formatCRC(config.freeShippingMinCents)}.
              </p>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-bone/10 flex justify-between items-center">
            <span className="eyebrow">Total</span>
            <span className="text-2xl">{formatCRC(subtotal - discount + shipping)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
