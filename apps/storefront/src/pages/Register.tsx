import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { GoogleButton } from '../components/GoogleButton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';

export function Register() {
  const t = useT();
  useDocumentTitle(t('auth.createAccount'));
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
      setError(err?.response?.data?.message ?? t('auth.registerFailed'));
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
          <span className="eyebrow">{t('auth.joinHouse')}</span>
          <h1 className="font-display text-4xl mt-3 uppercase">{t('auth.createAccount')}</h1>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">{t('auth.fullName')}</label>
            <input required className="field" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="eyebrow block mb-2">{t('auth.email')}</label>
            <input type="email" required className="field" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="eyebrow block mb-2">{t('auth.password')}</label>
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
            <label className="eyebrow block mb-2">{t('auth.phoneOptional')}</label>
            <input className="field" value={form.phone} onChange={set('phone')} />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? t('auth.creating') : t('auth.createAccount')}
          </button>
        </form>

        <GoogleButton label={t('auth.googleRegister')} />

        <p className="text-center text-sm text-stone mt-8">
          {t('auth.haveAccount')}{' '}
          <Link to={`/login?redirect=${redirect}`} className="text-bone link-underline">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
