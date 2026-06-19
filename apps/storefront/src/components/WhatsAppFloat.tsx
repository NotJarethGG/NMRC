import { useLocation } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';
import { useT } from '../i18n';

// Rutas donde el botón flotante taparía un CTA principal (lo ocultamos ahí)
const HIDDEN_ON = ['/checkout', '/order/', '/login', '/register', '/auth'];

// Botón flotante de contacto (canal principal de la tienda)
export function WhatsAppFloat() {
  const t = useT();
  const config = useConfig();
  const { pathname } = useLocation();
  if (!config.whatsappNumber) return null;
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const msg = encodeURIComponent('Hi NMRC, I have a question about a piece.');
  return (
    <a
      href={`https://wa.me/${config.whatsappNumber}?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      aria-label={t('misc.whatsapp')}
      className="fixed bottom-24 md:bottom-6 left-5 md:left-6 z-40 w-12 h-12 rounded-full bg-bone text-noir flex items-center justify-center shadow-lg hover:bg-taupe transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" />
        <path d="M8.8 9.2c.3 2.4 3.6 5.6 6 6l1.4-1.4-2-1.3-1 .7c-.9-.5-1.9-1.5-2.4-2.4l.7-1-1.3-2z" />
      </svg>
    </a>
  );
}
