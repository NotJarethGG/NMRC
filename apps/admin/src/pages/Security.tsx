import { useState } from 'react';
import { api } from '../lib/api';

export function Security() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (form.next.length < 8) {
      setMsg({ ok: false, text: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    if (form.next !== form.confirm) {
      setMsg({ ok: false, text: 'Las contraseñas no coinciden.' });
      return;
    }
    setSending(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.current,
        newPassword: form.next,
      });
      setMsg({ ok: true, text: 'Contraseña actualizada correctamente.' });
      setForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setMsg({ ok: false, text: err?.response?.data?.message ?? 'No se pudo actualizar.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Cuenta</span>
        <h1 className="font-display text-4xl mt-1">Seguridad</h1>
      </header>

      <div className="card p-6 max-w-md">
        <p className="eyebrow mb-5">Cambiar contraseña</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Contraseña actual</label>
            <input
              type="password"
              required
              className="field"
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Nueva contraseña (mín. 8)</label>
            <input
              type="password"
              required
              minLength={8}
              className="field"
              value={form.next}
              onChange={(e) => setForm({ ...form, next: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Confirmar nueva contraseña</label>
            <input
              type="password"
              required
              className="field"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          {msg && (
            <p className={`text-sm ${msg.ok ? 'text-ink' : 'text-red-700'}`}>{msg.text}</p>
          )}
          <button type="submit" disabled={sending} className="btn w-full py-3">
            {sending ? 'Guardando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}
