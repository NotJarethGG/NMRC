import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePrice } from '../lib/currency';
import { useConfig } from '../hooks/useConfig';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';
import { useLocale } from '../store/locale';
import { SUPPORT_EMAIL } from '../lib/brand';

function LegalLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const t = useT();
  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-5 md:px-10">
        <header className="mb-12">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="font-display text-4xl md:text-6xl mt-3 uppercase">{title}</h1>
        </header>
        <div className="space-y-10">{children}</div>
        <div className="mt-16 pt-8 border-t border-bone/10 text-sm text-stone">
          {t('legal.questions')}{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-bone link-underline">
            {SUPPORT_EMAIL}
          </a>{' '}
          {t('legal.orVisit')} <Link to="/about" className="text-bone link-underline">{t('legal.house')}</Link>.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-condensed text-xl uppercase tracking-wide mb-3">{title}</h2>
      <div className="text-sm text-stone leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function Shipping() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const price = usePrice();
  useDocumentTitle(t('legal.shippingTitle'));
  const config = useConfig();
  const en = locale === 'en';

  return (
    <LegalLayout eyebrow={t('legal.help')} title={t('legal.shippingTitle')}>
      <Section title={en ? 'Coverage & timing' : 'Cobertura y tiempos'}>
        <p>
          {en
            ? 'We ship worldwide from Costa Rica. Domestic orders arrive in 1–4 business days; international orders typically take 7–15 business days depending on destination. Orders are dispatched once payment is verified.'
            : 'Enviamos a todo el mundo desde Costa Rica. Los pedidos nacionales llegan en 1–4 días hábiles; los internacionales suelen tardar 7–15 días hábiles según el destino. Los pedidos se despachan al verificar el pago.'}
        </p>
      </Section>
      <Section title={en ? 'Shipping cost' : 'Costo de envío'}>
        <p>
          {en ? 'Flat rate of ' : 'Tarifa plana de '}
          <span className="text-bone">{price(config.shippingFlatCents)}</span>
          {en ? '. Shipping is ' : '. El envío es '}
          <span className="text-bone">{en ? 'free' : 'gratis'}</span>
          {en ? ' on orders over ' : ' en compras desde '}
          <span className="text-bone">{price(config.freeShippingMinCents)}</span>.
        </p>
      </Section>
      <Section title={en ? 'Exchanges' : 'Cambios'}>
        <p>
          {en
            ? 'You have 7 days from delivery to request a size or item exchange. Pieces must be unworn, unwashed and with tags attached. We coordinate everything with you directly — no friction.'
            : 'Tienes 7 días desde la entrega para solicitar un cambio de talla o de pieza. La prenda debe estar sin uso, sin lavar y con sus etiquetas. Coordinamos todo contigo directamente, sin vueltas.'}
        </p>
        <p>
          {en
            ? 'Limited edition pieces can only be exchanged for size (subject to availability) or store credit. No restocks.'
            : 'Las piezas de edición limitada solo se cambian por talla (sujeto a disponibilidad) o por crédito de tienda. Sin reposiciones.'}
        </p>
      </Section>
      <Section title={en ? 'Payment' : 'Pago'}>
        <p>
          {en
            ? 'Payment instructions are shown at checkout. Your order is prepared once our team verifies the payment.'
            : 'Las instrucciones de pago se muestran al finalizar la compra. Tu pedido se prepara cuando nuestro equipo verifica el pago.'}
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Privacy() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  useDocumentTitle(t('legal.privacyTitle'));
  const en = locale === 'en';

  return (
    <LegalLayout eyebrow={t('legal.legal')} title={t('legal.privacyTitle')}>
      <Section title={en ? 'What we store' : 'Qué datos guardamos'}>
        <p>
          {en
            ? 'Only what we need to fulfill your order: name, email, phone and shipping address. If you sign in with Google we receive your name and email — never your password.'
            : 'Solo lo necesario para operar tu pedido: nombre, correo, teléfono y dirección de entrega. Si entras con Google recibimos tu nombre y correo — nunca tu contraseña.'}
        </p>
      </Section>
      <Section title={en ? 'How we use it' : 'Para qué los usamos'}>
        <p>
          {en
            ? 'To process orders, coordinate deliveries, and — if you join the waitlist — notify you about new drops. No spam, only what matters.'
            : 'Para procesar pedidos, coordinar entregas y, si te unes a la lista, avisarte de nuevos drops. Nada de spam: solo lo esencial.'}
        </p>
      </Section>
      <Section title={en ? 'What we DON’T do' : 'Qué NO hacemos'}>
        <p>
          {en
            ? 'We never sell or share your data with third parties. We don’t store payment data — payments are settled directly between you and us.'
            : 'No vendemos ni compartimos tus datos con terceros. No guardamos datos de pago: el pago se realiza directo entre tú y nosotros.'}
        </p>
      </Section>
      <Section title={en ? 'Your rights' : 'Tus derechos'}>
        <p>
          {en
            ? 'You can request correction or deletion of your data anytime by writing to '
            : 'Puedes pedir la corrección o eliminación de tus datos cuando quieras escribiendo a '}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-bone link-underline">{SUPPORT_EMAIL}</a>.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Terms() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  useDocumentTitle(t('legal.termsTitle'));
  const en = locale === 'en';

  return (
    <LegalLayout eyebrow={t('legal.legal')} title={t('legal.termsTitle')}>
      <Section title={en ? 'Orders & payment' : 'Pedidos y pago'}>
        <p>
          {en
            ? 'Placing an order reserves your piece as “pending payment”. The order is processed once payment is verified for the exact amount. If payment isn’t received within 48 hours the order may be cancelled to release inventory.'
            : 'Al confirmar un pedido se reserva tu pieza en estado «pendiente de pago». El pedido se procesa al verificar el pago por el monto exacto. Si el pago no se recibe en 48 horas, el pedido puede cancelarse para liberar el inventario.'}
        </p>
      </Section>
      <Section title={en ? 'Pricing & availability' : 'Precios y disponibilidad'}>
        <p>
          {en
            ? 'Prices are shown in USD. Pieces are limited edition: displayed availability is real and may sell out during checkout. No restocks.'
            : 'Los precios se muestran en USD. Las piezas son de edición limitada: la disponibilidad mostrada es real y puede agotarse durante la compra. Sin reposiciones.'}
        </p>
      </Section>
      <Section title={en ? 'Cancellations' : 'Cancelaciones'}>
        <p>
          {en
            ? 'You can cancel a pending order from your account. Once payment is confirmed, the 7-day exchange policy applies.'
            : 'Puedes cancelar un pedido pendiente de pago desde tu cuenta. Una vez confirmado el pago, aplica la política de cambios (7 días).'}
        </p>
      </Section>
      <Section title={en ? 'Intellectual property' : 'Propiedad intelectual'}>
        <p>
          {en
            ? 'NMRC, “No Mercy” and all garment designs are property of the brand. Est. 2026, San José, Costa Rica — worldwide.'
            : 'NMRC, «No Mercy» y los diseños de las prendas son propiedad de la marca. Est. 2026, San José, Costa Rica — worldwide.'}
        </p>
      </Section>
    </LegalLayout>
  );
}
