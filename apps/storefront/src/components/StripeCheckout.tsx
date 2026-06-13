import { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { api } from '../lib/api';
import { useToast } from '../store/toast';
import { useT } from '../i18n';

// Cache del objeto Stripe por clave publicable (se carga una vez)
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe(pk: string) {
  if (!stripePromise) stripePromise = loadStripe(pk);
  return stripePromise;
}

function PaymentForm({
  orderId,
  amountLabel,
  onPaid,
}: {
  orderId: string;
  amountLabel: string;
  onPaid: () => void;
}) {
  const t = useT();
  const stripe = useStripe();
  const elements = useElements();
  const showToast = useToast((s) => s.show);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: { return_url: window.location.href },
    });
    if (err) {
      setError(err.message ?? t('pay.error'));
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirma el pago en el servidor (no depende del webhook → funciona en demo)
      await api
        .post('/payments/confirm', { orderId, paymentIntentId: paymentIntent.id })
        .catch(() => undefined);
      showToast(t('pay.success'));
      onPaid();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={!stripe || submitting} className="btn-ink w-full">
        {submitting ? t('pay.processing') : t('pay.pay', { amount: amountLabel })}
      </button>
      <p className="text-[11px] text-stone text-center tracking-wide">
        🔒 {t('pay.securedBy')} · {t('pay.cardApprox')}
      </p>
    </form>
  );
}

interface Props {
  orderId: string;
  publishableKey: string;
  amountLabel: string;
  onPaid: () => void;
}

export function StripeCheckout({ orderId, publishableKey, amountLabel, onPaid }: Props) {
  const t = useT();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .post<{ clientSecret: string }>('/payments/create-intent', { orderId })
      .then(({ data }) => {
        if (active) setClientSecret(data.clientSecret);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (failed) return null; // si Stripe falla, el cliente sigue con SINPE más abajo

  return (
    <div className="bg-coal border border-bone/10 p-8 md:p-10 text-left">
      <span className="eyebrow text-bone/50">{t('pay.cardTitle')}</span>
      <p className="text-sm text-stone mt-2 mb-6">{t('pay.cardSub')}</p>
      {clientSecret ? (
        <Elements
          stripe={getStripe(publishableKey)}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: { colorPrimary: '#EDE8DD', borderRadius: '0px', fontFamily: 'Inter, sans-serif' },
            },
          }}
        >
          <PaymentForm orderId={orderId} amountLabel={amountLabel} onPaid={onPaid} />
        </Elements>
      ) : (
        <div className="h-32 flex items-center justify-center">
          <span className="text-stone text-sm">{t('pay.processing')}</span>
        </div>
      )}
    </div>
  );
}
