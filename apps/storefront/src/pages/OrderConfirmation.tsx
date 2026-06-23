import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, formatCRC } from '../lib/api';
import { usePrice } from '../lib/currency';
import { useConfig } from '../hooks/useConfig';
import { useT } from '../i18n';
import type { Order } from '../lib/types';

// Los SDKs de pago se descargan solo cuando hay una pasarela activa
const StripeCheckout = lazy(() =>
  import('../components/StripeCheckout').then((m) => ({ default: m.StripeCheckout })),
);
const PayPalCheckout = lazy(() =>
  import('../components/PayPalCheckout').then((m) => ({ default: m.PayPalCheckout })),
);

export function OrderConfirmation() {
  const t = useT();
  const price = usePrice();
  const config = useConfig();
  const { id = '' } = useParams();
  const location = useLocation();
  const passed = (location.state as { order?: Order } | null)?.order;
  const [order, setOrder] = useState<Order | null>(passed ?? null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refetch = () => {
    if (id) api.get<Order>(`/orders/mine/${id}`).then(({ data }) => setOrder(data)).catch(() => undefined);
  };

  const uploadProof = async (file: File) => {
    setUploadingProof(true);
    setProofError(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post<Order>(`/orders/mine/${id}/proof`, fd);
      setOrder(data);
    } catch {
      setProofError(true);
    } finally {
      setUploadingProof(false);
    }
  };

  useEffect(() => {
    if (!order && id) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!order) {
    return <div className="pt-40 pb-32 text-center text-stone">{t('order.loading')}</div>;
  }

  const payment = order.payment;
  const pending = order.status === 'PENDING';
  const showStripe = pending && config.stripeEnabled && !!config.stripePublishableKey;
  const showPayPal = pending && config.paypalEnabled && !!config.paypalClientId;

  return (
    <div className="pt-28 md:pt-36 pb-32">
      <div className="max-w-2xl mx-auto px-5 md:px-10 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-16 h-16 mx-auto rounded-full border border-bone/30 flex items-center justify-center mb-8"
        >
          <span className="font-display text-2xl">✓</span>
        </motion.div>

        <span className="eyebrow">{t('order.received')}</span>
        <h1 className="font-display text-4xl md:text-5xl mt-3 mb-4 uppercase">{t('order.thanks')}</h1>
        <p className="text-stone">
          {t('order.order')}{' '}
          <span className="text-bone font-medium">#{order.id.slice(-8).toUpperCase()}</span> ·{' '}
          {pending ? t('order.pendingPayment') : t('account.status.paid')}
        </p>

        {/* DESGLOSE */}
        {order.subtotalCents != null && (
          <div className="mt-10 max-w-sm mx-auto text-left text-sm space-y-2">
            <div className="flex justify-between text-stone">
              <span>{t('order.subtotal')}</span>
              <span className="text-bone">{price(order.subtotalCents)}</span>
            </div>
            {!!order.discountCents && (
              <div className="flex justify-between text-stone">
                <span>{t('order.discount')}{order.discountCode ? ` (${order.discountCode})` : ''}</span>
                <span className="text-clay">−{price(order.discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone">
              <span>{t('order.shipping')}</span>
              <span className="text-bone">
                {order.shippingCents ? price(order.shippingCents) : t('order.free')}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-bone/10">
              <span className="uppercase tracking-wide">{t('order.total')}</span>
              <span className="text-bone">{price(order.totalCents)}</span>
            </div>
          </div>
        )}

        {/* PAGO CON TARJETA (Stripe) — internacional */}
        {showStripe && (
          <div className="mt-10">
            <Suspense fallback={<div className="h-40 bg-coal border border-bone/10 animate-pulse" />}>
              <StripeCheckout
                orderId={order.id}
                publishableKey={config.stripePublishableKey!}
                amountLabel={price(order.totalCents)}
                onPaid={refetch}
              />
            </Suspense>
          </div>
        )}

        {/* PAGO CON PAYPAL — internacional (opera en CR) */}
        {showPayPal && (
          <div className="mt-6">
            {showStripe && (
              <div className="flex items-center gap-4 mb-6">
                <span className="flex-1 h-px bg-bone/10" />
                <span className="text-[10px] uppercase tracking-luxe text-stone">{t('pay.or')}</span>
                <span className="flex-1 h-px bg-bone/10" />
              </div>
            )}
            <Suspense fallback={<div className="h-32 bg-coal border border-bone/10 animate-pulse" />}>
              <PayPalCheckout orderId={order.id} clientId={config.paypalClientId!} onPaid={refetch} />
            </Suspense>
          </div>
        )}

        {/* Separador hacia SINPE si hay alguna pasarela activa */}
        {(showStripe || showPayPal) && pending && (
          <div className="flex items-center gap-4 my-8">
            <span className="flex-1 h-px bg-bone/10" />
            <span className="text-[10px] uppercase tracking-luxe text-stone">{t('pay.orSinpe')}</span>
            <span className="flex-1 h-px bg-bone/10" />
          </div>
        )}

        {/* INSTRUCCIONES SINPE — el monto exacto va en colones (moneda de la transferencia) */}
        {pending && (
        <div className="mt-10 bg-smoke text-bone text-left p-8 md:p-10">
          <span className="eyebrow text-bone/50">{t('order.completeSinpe')}</span>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-bone/50 text-xs uppercase tracking-wide mb-1">{t('order.sinpeNumber')}</p>
              <p className="font-display text-3xl">{payment?.sinpeNumber}</p>
            </div>
            <div>
              <p className="text-bone/50 text-xs uppercase tracking-wide mb-1">{t('order.exactAmount')}</p>
              <p className="font-display text-3xl">{payment?.totalText ?? formatCRC(order.totalCents)}</p>
            </div>
          </div>

          <ol className="mt-8 space-y-2 text-sm text-bone/70 list-decimal list-inside">
            <li>{t('order.step1')}</li>
            <li>{t('order.step2')}</li>
            <li>{t('order.step3')}</li>
          </ol>

          {payment?.whatsappUrl && (
            <a
              href={payment.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ink bg-bone text-ink hover:bg-bone/90 hover:text-ink w-full mt-8"
            >
              {t('order.whatsapp')}
            </a>
          )}

          {/* SUBIR COMPROBANTE — alternativa directa a WhatsApp */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadProof(f);
              e.target.value = '';
            }}
          />
          {order.sinpeProofUrl ? (
            <div className="mt-4 flex items-center gap-3 bg-bone/5 border border-bone/10 p-3">
              <a href={order.sinpeProofUrl} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={order.sinpeProofUrl} alt="" className="w-12 h-12 object-cover" />
              </a>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-bone/80">{t('order.proofReceived')}</p>
                <div className="flex gap-4 mt-1">
                  <a
                    href={order.sinpeProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] uppercase tracking-luxe text-bone/50 hover:text-bone link-underline"
                  >
                    {t('order.proofView')}
                  </a>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingProof}
                    className="text-[11px] uppercase tracking-luxe text-bone/50 hover:text-bone link-underline disabled:opacity-40"
                  >
                    {uploadingProof ? t('order.proofUploading') : t('order.proofReplace')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingProof}
                className="w-full mt-4 border border-bone/30 text-bone text-[11px] uppercase tracking-luxe py-3.5 hover:bg-bone hover:text-ink transition-colors disabled:opacity-40"
              >
                {uploadingProof ? t('order.proofUploading') : t('order.uploadProof')}
              </button>
              <p className="text-[11px] text-bone/40 mt-2 text-center">{t('order.uploadProofHint')}</p>
            </>
          )}
          {proofError && (
            <p className="text-[11px] text-red-400 mt-2 text-center">{t('order.proofError')}</p>
          )}
        </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/account" className="btn-outline">{t('order.viewOrders')}</Link>
          <Link to="/shop" className="text-[11px] uppercase tracking-luxe link-underline self-center">
            {t('order.keepShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
