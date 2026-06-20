import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../store/toast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';

export function ResetPassword() {
  const t = useT();
  useDocumentTitle(t('reset.title'));
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const showToast = useToast((s) => s.show);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-[80vh] pt-32 pb-24 flex flex-col items-center justify-center px-5 text-center">
        <p className="text-stone mb-6">{t('reset.noToken')}</p>
        <Link to="/forgot-password" className="btn-ink">
          {t('forgot.title')}
        </Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t('reset.newPassword'));
      return;
    }
    if (password !== confirm) {
      setError(t('reset.mismatch'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      showToast(t('reset.success'));
      navigate('/login', { replace: true });
    } catch {
      setError(t('reset.invalidLink'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] pt-32 pb-24 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <header className="text-center mb-10">
          <span className="eyebrow">NMRC</span>
          <h1 className="font-display text-4xl mt-3 uppercase">{t('reset.title')}</h1>
          <p className="text-stone text-sm mt-3">{t('reset.sub')}</p>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="eyebrow block mb-2">{t('reset.newPassword')}</label>
            <input
              type="password"
              required
              minLength={8}
              className="field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="eyebrow block mb-2">{t('reset.confirm')}</label>
            <input
              type="password"
              required
              className="field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button type="submit" disabled={loading} className="btn-ink w-full">
            {loading ? t('reset.saving') : t('reset.cta')}
          </button>
        </form>
      </div>
    </div>
  );
}
