import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, formatCRC } from '../lib/api';
import type { Order } from '../lib/types';

export function OrderConfirmation() {
  const { id = '' } = useParams();
  const location = useLocation();
  const passed = (location.state as { order?: Order } | null)?.order;
  const [order, setOrder] = useState<Order | null>(passed ?? null);

  useEffect(() => {
    if (!order && id) {
      api.get<Order>(`/orders/mine/${id}`).then(({ data }) => setOrder(data)).catch(() => undefined);
    }
  }, [id, order]);

  if (!order) {
    return <div className="pt-40 pb-32 text-center text-stone">Cargando tu pedido…</div>;
  }

  const payment = order.payment;

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

        <span className="eyebrow">Pedido recibido</span>
        <h1 className="font-display text-4xl md:text-5xl mt-3 mb-4">Gracias por tu compra</h1>
        <p className="text-stone">
          Pedido <span className="text-bone font-medium">#{order.id.slice(-8).toUpperCase()}</span> ·
          Estado: pendiente de pago
        </p>

        {/* INSTRUCCIONES SINPE */}
        <div className="mt-12 bg-smoke text-bone text-left p-8 md:p-10">
          <span className="eyebrow text-bone/50">Completa tu pago por SINPE Móvil</span>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-bone/50 text-xs uppercase tracking-wide mb-1">Número SINPE</p>
              <p className="font-display text-3xl">{payment?.sinpeNumber}</p>
            </div>
            <div>
              <p className="text-bone/50 text-xs uppercase tracking-wide mb-1">Monto exacto</p>
              <p className="font-display text-3xl">{payment?.totalText ?? formatCRC(order.totalCents)}</p>
            </div>
          </div>

          <ol className="mt-8 space-y-2 text-sm text-bone/70 list-decimal list-inside">
            <li>Realiza el SINPE Móvil al número indicado por el monto exacto.</li>
            <li>Envíanos el comprobante por WhatsApp con el botón de abajo.</li>
            <li>Confirmamos tu pago y preparamos tu pedido.</li>
          </ol>

          {payment?.whatsappUrl && (
            <a
              href={payment.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ink bg-bone text-ink hover:bg-bone/90 hover:text-ink w-full mt-8"
            >
              Enviar comprobante por WhatsApp
            </a>
          )}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/account" className="btn-outline">Ver mis pedidos</Link>
          <Link to="/shop" className="text-[11px] uppercase tracking-luxe link-underline self-center">
            Seguir explorando
          </Link>
        </div>
      </div>
    </div>
  );
}
