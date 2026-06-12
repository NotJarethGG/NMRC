import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../lib/api';
import { useAuth } from '../store/auth';
import { useToast } from '../store/toast';
import { useT } from '../i18n';

// Destino del redirect OAuth: lee el token del fragmento (#token=...)
export function AuthCallback() {
  const t = useT();
  const navigate = useNavigate();
  const init = useAuth((s) => s.init);
  const showToast = useToast((s) => s.show);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get('token');

    if (token) {
      setToken(token);
      // limpiar el token de la URL antes de continuar
      window.history.replaceState(null, '', window.location.pathname);
      init().then(() => {
        showToast(t('auth.welcome'));
        navigate('/account', { replace: true });
      });
    } else {
      showToast(t('auth.googleFailed'));
      navigate('/login', { replace: true });
    }
  }, [init, navigate, showToast]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-24">
      <p className="text-stone text-sm uppercase tracking-luxe">{t('auth.signingIn')}</p>
    </div>
  );
}
