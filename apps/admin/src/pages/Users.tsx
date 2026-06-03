import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useUsers } from '../hooks/useAdmin';
import { useAuth } from '../store/auth';
import type { Role } from '../lib/types';

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-ink text-bone',
  STAFF: 'bg-stone text-bone',
  CUSTOMER: 'bg-sand text-stone',
};

export function Users() {
  const me = useAuth((s) => s.user);
  const { data: users } = useUsers();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' as Role });
  const [error, setError] = useState<string | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-users'] });

  if (me?.role !== 'ADMIN') {
    return (
      <div className="card p-12 text-center text-stone">
        Solo los administradores pueden gestionar usuarios.
      </div>
    );
  }

  const createStaff = async () => {
    setError(null);
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'STAFF' });
      refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo crear el usuario.');
    }
  };

  const changeRole = async (id: string, role: Role) => {
    await api.patch(`/users/${id}`, { role });
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar usuario?')) return;
    await api.delete(`/users/${id}`);
    refresh();
  };

  return (
    <div>
      <header className="mb-8">
        <span className="eyebrow">Equipo y clientes</span>
        <h1 className="font-display text-4xl mt-1">Usuarios</h1>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone text-[11px] uppercase tracking-wide border-b border-line">
                <th className="px-6 py-3 font-normal">Nombre</th>
                <th className="px-6 py-3 font-normal">Correo</th>
                <th className="px-6 py-3 font-normal">Rol</th>
                <th className="px-6 py-3 font-normal text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-6 py-3 font-medium">{u.name}</td>
                  <td className="px-6 py-3 text-stone">{u.email}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    {u.id !== me?.id && (
                      <>
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value as Role)}
                          className="text-xs border border-line rounded-sm px-2 py-1 mr-3 bg-paper"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="STAFF">STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <button onClick={() => remove(u.id)} className="text-red-700 text-xs hover:underline">
                          Eliminar
                        </button>
                      </>
                    )}
                    {u.id === me?.id && <span className="text-[11px] text-stone">Tú</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-6 h-fit">
          <p className="eyebrow mb-5">Añadir staff</p>
          <div className="space-y-3">
            <input
              className="field"
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="field"
              type="email"
              placeholder="Correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="field"
              type="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              className="field"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            >
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button onClick={createStaff} disabled={!form.name || !form.email || !form.password} className="btn w-full">
              Crear usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
