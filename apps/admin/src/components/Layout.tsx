import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../store/auth';

const links = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/products', label: 'Productos' },
  { to: '/orders', label: 'Pedidos' },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/users', label: 'Usuarios', adminOnly: true },
];

export function Layout({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 bg-smoke text-bone flex flex-col fixed h-screen">
        <div className="px-7 h-20 flex items-center border-b border-bone/10">
          <span className="font-display text-2xl">GosthShop</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {links
            .filter((l) => !l.adminOnly || user?.role === 'ADMIN')
            .map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `block px-3 py-2.5 text-sm rounded-sm transition-colors ${
                    isActive ? 'bg-bone text-ink' : 'text-bone/70 hover:bg-bone/10 hover:text-bone'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
        </nav>
        <div className="px-7 py-5 border-t border-bone/10">
          <p className="text-sm">{user?.name}</p>
          <p className="text-[11px] text-bone/50 uppercase tracking-wide mt-0.5">{user?.role}</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-3 text-[11px] uppercase tracking-wide text-bone/60 hover:text-bone"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 ml-60 min-h-screen">
        <div className="max-w-6xl mx-auto px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
