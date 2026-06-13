import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, formatCRC } from '../lib/api';
import { usePrice } from '../lib/currency';
import { useConfig } from '../hooks/useConfig';
import { StripeCheckout } from '../components/StripeCheckout';
import { PayPalCheckout } from '../components/PayPalCheckout';
import { useT } from '../i18n';
import type { Order } from '../lib/types';

export function OrderConfirmation() {
  const t = useT();
  const price = usePrice();
  const config = useConfig();
  const { id = '' } = useParams();
  const location = useLocation();
  const passed = (location.state as { order?: Order } | null)?.order;
  const [order, setOrder] = useState<Order | null>(passed ?? null);

  const refetch = () => {
    if (id) api.get<Order>(`/orders/mine/${id}`).then(({ data }) => setOrder(data)).catch(() => undefined);
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
            <StripeCheckout
              orderId={order.id}
              publishableKey={config.stripePublishableKey!}
              amountLabel={price(order.totalCents)}
              onPaid={refetch}
            />
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
            <PayPalCheckout orderId={order.id} clientId={config.paypalClientId!} onPaid={refetch} />
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
