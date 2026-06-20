import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

// Destino del redirect OAuth del admin: lee el token del fragmento (#token=...)
// y solo deja entrar si el rol es ADMIN/STAFF.
export function AuthCallback() {
  const navigate = useNavigate();
  const applyToken = useAuth((s) => s.applyToken);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get('token');
    window.history.replaceState(null, '', window.location.pathname);

    if (!token) {
      setError('No se pudo iniciar sesión con Google.');
      return;
    }
    applyToken(token).then((ok) => {
      if (ok) navigate('/', { replace: true });
      else setError('Esa cuenta de Google no tiene acceso al panel.');
    });
  }, [applyToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      {error ? (
        <div className="text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <button onClick={() => navigate('/login', { replace: true })} className="btn">
            Volver a inicio de sesión
          </button>
        </div>
      ) : (
        <p className="text-stone uppercase tracking-wide text-sm">Iniciando sesión…</p>
      )}
    </div>
  );
}
