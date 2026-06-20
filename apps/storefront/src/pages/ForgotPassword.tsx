import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';

export function ForgotPassword() {
  const t = useT();
  useDocumentTitle(t('forgot.title'));
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
    } catch {
      /* respondemos igual aunque falle: no revelamos si el correo existe */
    } finally {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] pt-32 pb-24 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <header className="text-center mb-10">
          <span className="eyebrow">{t('auth.forgot')}</span>
          <h1 className="font-display text-4xl mt-3 uppercase">{t('forgot.title')}</h1>
        </header>

        {sent ? (
          <div className="text-center">
            <p className="text-stone leading-relaxed mb-8">{t('forgot.done')}</p>
            <Link to="/login" className="btn-ink">
              {t('forgot.backToLogin')}
            </Link>
          </div>
        ) : (
          <>
            <p className="text-stone text-sm text-center mb-8">{t('forgot.sub')}</p>
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
              <button type="submit" disabled={loading} className="btn-ink w-full">
                {loading ? t('forgot.sending') : t('forgot.send')}
              </button>
            </form>
            <p className="text-center text-sm text-stone mt-8">
              <Link to="/login" className="text-bone link-underline">
                {t('forgot.backToLogin')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
