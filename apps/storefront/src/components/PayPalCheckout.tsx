import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { api } from '../lib/api';
import { useToast } from '../store/toast';
import { useT } from '../i18n';

interface Props {
  orderId: string;
  clientId: string;
  onPaid: () => void;
}

// Pago con PayPal (config-gated). Opera en Costa Rica.
export function PayPalCheckout({ orderId, clientId, onPaid }: Props) {
  const t = useT();
  const showToast = useToast((s) => s.show);

  return (
    <div className="bg-coal border border-bone/10 p-8 md:p-10 text-left">
      <span className="eyebrow text-bone/50">{t('pay.paypalTitle')}</span>
      <p className="text-sm text-stone mt-2 mb-6">{t('pay.paypalSub')}</p>
      <PayPalScriptProvider options={{ clientId, currency: 'USD', intent: 'capture' }}>
        <PayPalButtons
          style={{ layout: 'vertical', color: 'white', shape: 'rect', label: 'pay' }}
          createOrder={async () => {
            const { data } = await api.post<{ paypalOrderId: string }>(
              '/payments/paypal/create-order',
              { orderId },
            );
            return data.paypalOrderId;
          }}
          onApprove={async (data) => {
            try {
              await api.post('/payments/paypal/capture', {
                paypalOrderId: data.orderID,
                orderId,
              });
              showToast(t('pay.success'));
              onPaid();
            } catch {
              showToast(t('pay.error'));
            }
          }}
          onError={() => showToast(t('pay.error'))}
        />
      </PayPalScriptProvider>
    </div>
  );
}
