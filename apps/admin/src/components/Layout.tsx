import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../store/auth';

const links = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/products', label: 'Productos' },
  { to: '/orders', label: 'Pedidos' },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/community', label: 'Comunidad' },
  { to: '/users', label: 'Usuarios', adminOnly: true },
];

function NavIcon({ to }: { to: string }) {
  const common = 'w-[18px] h-[18px] shrink-0';
  const p: Record<string, JSX.Element> = {
    '/': <path d="M3 12l9-8 9 8M5 10v10h14V10" />,
    '/products': <path d="M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10" />,
    '/orders': <path d="M6 2l1.5 3h9L18 2M5 5h14l-1 15H6zM9 10h6" />,
    '/catalog': <path d="M4 5h7v14H4zM13 5h7v14h-7" />,
    '/community': <path d="M21 11a8 8 0 0 1-11.6 7.2L4 20l1.8-5.4A8 8 0 1 1 21 11zM8.5 11h.01M12 11h.01M15.5 11h.01" />,
    '/users': <path d="M16 19v-2a4 4 0 0 0-8 0v2M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />,
  };
  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {p[to]}
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 bg-ink text-bone flex flex-col fixed h-screen">
        <div className="px-7 h-20 flex flex-col justify-center border-b border-bone/10">
          <span className="font-varsity text-3xl uppercase tracking-[0.16em] leading-none">NMRC</span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-bone/40 mt-1.5">
            No Mercy · Panel
          </span>
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
                  `flex items-center gap-3 px-3 py-2.5 text-[13px] uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'bg-bone text-ink font-medium'
                      : 'text-bone/60 hover:bg-bone/10 hover:text-bone'
                  }`
                }
              >
                <NavIcon to={l.to} />
                {l.label}
              </NavLink>
            ))}
        </nav>
        <div className="px-7 py-5 border-t border-bone/10">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-[10px] text-bone/50 uppercase tracking-[0.2em] mt-0.5">{user?.role}</p>
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
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-6xl mx-auto px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
