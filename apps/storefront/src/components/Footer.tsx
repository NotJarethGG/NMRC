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

            {/* REDES */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border border-bone/15 flex items-center justify-center text-bone/60 hover:text-bone hover:border-bone/50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 border border-bone/15 flex items-center justify-center text-bone/60 hover:text-bone hover:border-bone/50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12a4 4 0 1 0 4 4V4c.8 2.4 2.6 4 5 4.4" />
                </svg>
              </a>
              <a
                href="https://wa.me/50688888888"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-9 h-9 border border-bone/15 flex items-center justify-center text-bone/60 hover:text-bone hover:border-bone/50 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" />
                  <path d="M8.8 9.2c.3 2.4 3.6 5.6 6 6l1.4-1.4-2-1.3-1 .7c-.9-.5-1.9-1.5-2.4-2.4l.7-1-1.3-2z" />
                </svg>
              </a>
            </div>
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
            <div className="eyebrow text-bone/40 mb-5">Ayuda</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link to="/envios" className="link-underline">Envíos y cambios</Link></li>
              <li><Link to="/privacidad" className="link-underline">Privacidad</Link></li>
              <li><Link to="/terminos" className="link-underline">Términos</Link></li>
              <li>Pago: SINPE Móvil</li>
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
