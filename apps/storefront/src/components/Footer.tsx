import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-coal text-bone mt-32 border-t border-bone/10">
      <div className="max-w-editorial mx-auto px-5 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-varsity text-4xl uppercase tracking-[0.18em] mb-3">NMRC</div>
            <p className="text-bone/40 text-[11px] uppercase tracking-luxe mb-4">No Mercy · Est. 2026</p>
            <p className="text-bone/50 text-sm leading-relaxed max-w-xs">
              Streetwear sin concesiones. Construcción honesta, actitud sin límites. Hecho para
              quienes no piden permiso.
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
          <span>© {new Date().getFullYear()} NMRC · No Mercy · Costa Rica</span>
          <span>Edición limitada · Hecho con intención</span>
        </div>
      </div>
    </footer>
  );
}
