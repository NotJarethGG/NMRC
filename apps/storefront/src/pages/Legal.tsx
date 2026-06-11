import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatCRC } from '../lib/api';
import { useConfig } from '../hooks/useConfig';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function LegalLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="pt-28 md:pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-5 md:px-10">
        <header className="mb-12">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="font-display text-4xl md:text-6xl mt-3 uppercase">{title}</h1>
        </header>
        <div className="space-y-10">{children}</div>
        <div className="mt-16 pt-8 border-t border-bone/10 text-sm text-stone">
          ¿Dudas? Escríbenos por{' '}
          <a
            href="https://wa.me/50688888888"
            target="_blank"
            rel="noreferrer"
            className="text-bone link-underline"
          >
            WhatsApp
          </a>{' '}
          o revisa la <Link to="/about" className="text-bone link-underline">Casa NMRC</Link>.
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
  useDocumentTitle('Envíos y cambios');
  const config = useConfig();
  return (
    <LegalLayout eyebrow="Ayuda" title="Envíos y cambios">
      <Section title="Cobertura y tiempos">
        <p>
          Enviamos a todo Costa Rica por Correos de Costa Rica o encomienda, según tu zona. Los
          pedidos se despachan al confirmar el pago: 1–2 días hábiles dentro del GAM y 2–4 días
          hábiles para el resto del país.
        </p>
      </Section>
      <Section title="Costo de envío">
        <p>
          Tarifa plana de <span className="text-bone">{formatCRC(config.shippingFlatCents)}</span>.
          El envío es <span className="text-bone">gratis</span> en compras desde{' '}
          <span className="text-bone">{formatCRC(config.freeShippingMinCents)}</span>.
        </p>
      </Section>
      <Section title="Cambios">
        <p>
          Tienes <span className="text-bone">7 días</span> desde la entrega para solicitar un cambio
          de talla o de pieza. La prenda debe estar sin uso, sin lavar y con sus etiquetas.
          Coordinamos todo por WhatsApp, sin vueltas.
        </p>
        <p>
          Las piezas de edición limitada solo se cambian por talla (sujeto a disponibilidad) o por
          crédito de tienda.
        </p>
      </Section>
      <Section title="Pago">
        <p>
          Pagas por <span className="text-bone">SINPE Móvil</span> al confirmar tu pedido y nos
          envías el comprobante por WhatsApp. Tu pedido se prepara al verificar el pago.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Privacy() {
  useDocumentTitle('Privacidad');
  return (
    <LegalLayout eyebrow="Legal" title="Privacidad">
      <Section title="Qué datos guardamos">
        <p>
          Solo lo necesario para operar tu pedido: nombre, correo, teléfono y dirección de entrega.
          Si entras con Google, recibimos tu nombre y correo — nunca tu contraseña.
        </p>
      </Section>
      <Section title="Para qué los usamos">
        <p>
          Para procesar pedidos, coordinar entregas por WhatsApp y, si te suscribes, avisarte de
          nuevos drops. Nada de spam: solo lo esencial.
        </p>
      </Section>
      <Section title="Qué NO hacemos">
        <p>
          No vendemos ni compartimos tus datos con terceros. No guardamos datos de pago: el SINPE
          se hace directo entre tu banco y nosotros.
        </p>
      </Section>
      <Section title="Tus derechos">
        <p>
          Puedes pedir la corrección o eliminación de tus datos cuando quieras escribiéndonos por
          WhatsApp o al correo de la tienda.
        </p>
      </Section>
    </LegalLayout>
  );
}

export function Terms() {
  useDocumentTitle('Términos');
  return (
    <LegalLayout eyebrow="Legal" title="Términos">
      <Section title="Pedidos y pago">
        <p>
          Al confirmar un pedido se reserva tu pieza en estado «pendiente de pago». El pedido se
          procesa al verificar el SINPE por el monto exacto. Si el pago no se recibe en 48 horas,
          el pedido puede cancelarse para liberar el inventario.
        </p>
      </Section>
      <Section title="Precios y disponibilidad">
        <p>
          Los precios están en colones (CRC) e incluyen impuestos. Las piezas son de edición
          limitada: la disponibilidad mostrada es real y puede agotarse durante el proceso de
          compra.
        </p>
      </Section>
      <Section title="Cancelaciones">
        <p>
          Puedes cancelar un pedido pendiente de pago desde tu cuenta. Una vez confirmado el pago,
          aplica la política de cambios (7 días).
        </p>
      </Section>
      <Section title="Propiedad intelectual">
        <p>
          NMRC, «No Mercy» y los diseños de las prendas son propiedad de la marca. Est. 2026, San
          José, Costa Rica.
        </p>
      </Section>
    </LegalLayout>
  );
}
