import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { apiBaseURL } from '../lib/api';

export function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-bone p-14">
        <span className="font-varsity text-3xl uppercase tracking-[0.16em]">NMRC</span>
        <div>
          <p className="font-varsity text-7xl uppercase leading-[0.85]">No<br />Mercy</p>
          <p className="text-bone/50 mt-6 max-w-sm uppercase tracking-wide text-xs">
            Panel de control · Inventario, pedidos y operación
          </p>
        </div>
        <span className="text-[11px] uppercase tracking-luxe text-bone/40">
          Acceso restringido · Est. 2026
        </span>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h1 className="font-display text-4xl uppercase tracking-wide mb-1">Acceder</h1>
          <p className="text-stone text-sm mb-8">Ingresa con tu cuenta de staff o administrador.</p>

          <div className="space-y-5">
            <div>
              <label className="label">Correo</label>
              <input
                type="email"
                required
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={loading} className="btn w-full py-3">
              {loading ? 'Accediendo…' : 'Entrar'}
            </button>
          </div>

          {/* Acceso rápido con Google (solo correos autorizados como ADMIN/STAFF) */}
          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-line" />
            <span className="text-[10px] uppercase tracking-luxe text-stone">o</span>
            <span className="flex-1 h-px bg-line" />
          </div>
          <a
            href={`${apiBaseURL}/auth/google?state=admin`}
            className="btn-ghost w-full py-3 flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z" />
              <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.4-2.6c-.9.6-2 1-3.2 1-2.5 0-4.6-1.7-5.3-4H3.2v2.6A10 10 0 0 0 12 22z" />
              <path fill="#FBBC05" d="M6.7 13.9a6 6 0 0 1 0-3.8V7.5H3.2a10 10 0 0 0 0 9z" />
              <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.2 7.5l3.5 2.6C7.4 7.8 9.5 6 12 6z" />
            </svg>
            Continuar con Google
          </a>
        </form>
      </div>
    </div>
  );
}
