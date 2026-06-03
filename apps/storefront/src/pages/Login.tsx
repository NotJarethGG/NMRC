import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function Login() {
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/account';

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
      navigate(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Credenciales inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] pt-32 pb-24 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <header className="text-center mb-10">
          <span className="eyebrow">Bienvenido de vuelta</span>
          <h1 className="font-display text-4xl mt-3">Acceder</h1>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">Correo</label>
            <input
              type="email"
              required
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Contraseña</label>
            <input
              type="password"
              required
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? 'Accediendo…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-stone mt-8">
          ¿No tienes cuenta?{' '}
          <Link to={`/register?redirect=${redirect}`} className="text-ink link-underline">
            Crear una
          </Link>
        </p>
      </div>
    </div>
  );
}
