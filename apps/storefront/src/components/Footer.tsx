import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-ink text-bone mt-32">
      <div className="max-w-editorial mx-auto px-5 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-3xl mb-4">GosthShop</div>
            <p className="text-bone/50 text-sm leading-relaxed max-w-xs">
              Prendas exclusivas en edición limitada. Diseñadas con intención, hechas para perdurar.
            </p>
          </div>

          <div>
            <div className="eyebrow text-bone/40 mb-5">Comprar</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link to="/shop" className="link-underline">Todo</Link></li>
              <li><Link to="/collections" className="link-underline">Colecciones</Link></li>
              <li><Link to="/shop?category=outerwear" className="link-underline">Outerwear</Link></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-bone/40 mb-5">Casa</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link to="/about" className="link-underline">Filosofía</Link></li>
              <li><Link to="/account" className="link-underline">Mi cuenta</Link></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-bone/40 mb-5">Pago</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li>SINPE Móvil</li>
              <li>Confirmación por WhatsApp</li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-bone/10 flex flex-col md:flex-row justify-between gap-4 text-[11px] uppercase tracking-luxe text-bone/40">
          <span>© {new Date().getFullYear()} GosthShop · Costa Rica</span>
          <span>Edición limitada · Hecho con intención</span>
        </div>
      </div>
    </footer>
  );
}
