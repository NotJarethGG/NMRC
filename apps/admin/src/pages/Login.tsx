import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

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

          <p className="text-xs text-stone mt-6 leading-relaxed">
            Demo: <span className="text-ink">admin@gosthshop.com</span> /{' '}
            <span className="text-ink">password123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
