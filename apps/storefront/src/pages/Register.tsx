import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/auth';

export function Register() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') ?? '/account';

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate(redirect);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No pudimos crear tu cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-[80vh] pt-32 pb-24 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <header className="text-center mb-10">
          <span className="eyebrow">Únete a la casa</span>
          <h1 className="font-display text-4xl mt-3">Crear cuenta</h1>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">Nombre completo</label>
            <input required className="field" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="eyebrow block mb-2">Correo</label>
            <input type="email" required className="field" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="eyebrow block mb-2">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              className="field"
              value={form.password}
              onChange={set('password')}
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">Teléfono (opcional)</label>
            <input className="field" value={form.phone} onChange={set('phone')} />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-stone mt-8">
          ¿Ya tienes cuenta?{' '}
          <Link to={`/login?redirect=${redirect}`} className="text-ink link-underline">
            Acceder
          </Link>
        </p>
      </div>
    </div>
  );
}
