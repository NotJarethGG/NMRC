import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { GoogleButton } from '../components/GoogleButton';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';

export function Login() {
  const t = useT();
  useDocumentTitle(t('auth.signIn'));
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
      setError(err?.response?.data?.message ?? t('auth.invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] pt-32 pb-24 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <header className="text-center mb-10">
          <span className="eyebrow">{t('auth.welcomeBack')}</span>
          <h1 className="font-display text-4xl mt-3 uppercase">{t('auth.signIn')}</h1>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">{t('auth.email')}</label>
            <input
              type="email"
              required
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="eyebrow">{t('auth.password')}</label>
              <Link
                to="/forgot-password"
                className="text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
              >
                {t('auth.forgot')}
              </Link>
            </div>
            <input
              type="password"
              required
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? t('auth.entering') : t('auth.enter')}
          </button>
        </form>

        <GoogleButton />

        <p className="text-center text-sm text-stone mt-8">
          {t('auth.noAccount')}{' '}
          <Link to={`/register?redirect=${redirect}`} className="text-bone link-underline">
            {t('auth.createOne')}
          </Link>
        </p>
      </div>
    </div>
  );
}
