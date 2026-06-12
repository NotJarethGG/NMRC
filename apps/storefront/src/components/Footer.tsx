import { Link } from 'react-router-dom';
import { useT } from '../i18n';
import { useLocale } from '../store/locale';
import { HELLO_EMAIL, SUPPORT_EMAIL } from '../lib/brand';

export function Footer() {
  const t = useT();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);

  return (
    <footer className="bg-coal text-bone mt-32 border-t border-bone/10">
      <div className="max-w-editorial mx-auto px-5 md:px-10 py-20 md:py-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="font-varsity text-4xl uppercase tracking-[0.18em] mb-3">NMRC</div>
            <p className="text-bone/40 text-[11px] uppercase tracking-luxe mb-4">{t('footer.tagline')}</p>
            <p className="text-bone/50 text-sm leading-relaxed max-w-xs">{t('footer.desc')}</p>

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
            <div className="eyebrow text-bone/40 mb-5">{t('footer.shop')}</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link to="/shop" className="link-underline">{t('footer.all')}</Link></li>
              <li><Link to="/collections" className="link-underline">{t('footer.collections')}</Link></li>
              <li><Link to="/shop?category=outerwear" className="link-underline">Outerwear</Link></li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-bone/40 mb-5">{t('footer.house')}</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link to="/about" className="link-underline">{t('footer.philosophy')}</Link></li>
              <li><Link to="/account" className="link-underline">{t('footer.myAccount')}</Link></li>
              <li>
                <a href={`mailto:${HELLO_EMAIL}`} className="link-underline">{HELLO_EMAIL}</a>
              </li>
            </ul>
          </div>

          <div>
            <div className="eyebrow text-bone/40 mb-5">{t('footer.help')}</div>
            <ul className="space-y-3 text-sm text-bone/70">
              <li><Link to="/envios" className="link-underline">{t('footer.shippingReturns')}</Link></li>
              <li><Link to="/privacidad" className="link-underline">{t('footer.privacy')}</Link></li>
              <li><Link to="/terminos" className="link-underline">{t('footer.terms')}</Link></li>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="link-underline">{SUPPORT_EMAIL}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-bone/10 flex flex-col md:flex-row md:items-center justify-between gap-5 text-[11px] uppercase tracking-luxe text-bone/40">
          <span>© {new Date().getFullYear()} {t('footer.rights')}</span>

          {/* SELECTOR DE IDIOMA */}
          <div className="flex items-center gap-3" aria-label={t('footer.language')}>
            <svg className="w-4 h-4 text-bone/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
            <button
              onClick={() => setLocale('en')}
              className={`link-underline ${locale === 'en' ? 'text-bone' : 'hover:text-bone/70'}`}
            >
              EN
            </button>
            <span className="text-bone/20">/</span>
            <button
              onClick={() => setLocale('es')}
              className={`link-underline ${locale === 'es' ? 'text-bone' : 'hover:text-bone/70'}`}
            >
              ES
            </button>
          </div>

          <span>{t('footer.limited')}</span>
        </div>
      </div>
    </footer>
  );
}
