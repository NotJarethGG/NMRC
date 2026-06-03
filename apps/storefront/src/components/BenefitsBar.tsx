import type { ReactNode } from 'react';

function Item({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 justify-center px-4 py-6">
      <span className="text-bone/70 shrink-0">{icon}</span>
      <div className="text-left">
        <p className="text-[12px] uppercase tracking-wide text-bone">{title}</p>
        <p className="text-[11px] text-stone">{sub}</p>
      </div>
    </div>
  );
}

const ic = 'w-5 h-5';

export function BenefitsBar() {
  return (
    <section className="border-y border-bone/10 bg-coal">
      <div className="max-w-editorial mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-bone/10">
        <Item
          title="Envío nacional"
          sub="A todo Costa Rica"
          icon={
            <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
              <circle cx="7" cy="17" r="1.6" />
              <circle cx="17" cy="17" r="1.6" />
            </svg>
          }
        />
        <Item
          title="Pago SINPE"
          sub="Móvil y seguro"
          icon={
            <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 9h18" />
            </svg>
          }
        />
        <Item
          title="Cambios fáciles"
          sub="Dentro de 7 días"
          icon={
            <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4" />
              <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" />
            </svg>
          }
        />
        <Item
          title="Edición limitada"
          sub="Números contados"
          icon={
            <svg className={ic} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9-2.8.9-5.5-4-3.9 5.5-.8z" />
            </svg>
          }
        />
      </div>
    </section>
  );
}
