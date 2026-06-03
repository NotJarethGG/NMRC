import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';

const nav = [
  { to: '/shop', label: 'Tienda' },
  { to: '/collections', label: 'Colecciones' },
  { to: '/about', label: 'Casa' },
];

export function Header() {
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const light = isHome && !scrolled;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-700 ${
        light ? 'text-bone' : 'text-bone bg-noir/80 backdrop-blur-md border-b border-bone/10'
      }`}
    >
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        <div className="h-16 md:h-20 flex items-center justify-between">
          <button
            className="md:hidden text-[11px] uppercase tracking-luxe"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? 'Cerrar' : 'Menú'}
          </button>

          <nav className="hidden md:flex items-center gap-9 text-[11px] uppercase tracking-luxe">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `link-underline transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 font-display text-2xl md:text-[28px] tracking-wide leading-none"
          >
            GosthShop
          </Link>

          <div className="flex items-center gap-5 md:gap-7 text-[11px] uppercase tracking-luxe">
            <Link
              to={user ? '/account' : '/login'}
              className="link-underline opacity-70 hover:opacity-100 hidden sm:inline"
            >
              {user ? 'Cuenta' : 'Acceder'}
            </Link>
            <button onClick={openCart} className="link-underline opacity-80 hover:opacity-100">
              Bolsa ({count})
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-noir text-bone border-t border-bone/10"
          >
            <div className="px-5 py-6 flex flex-col gap-5 text-sm uppercase tracking-luxe">
              {nav.map((n) => (
                <Link key={n.to} to={n.to}>
                  {n.label}
                </Link>
              ))}
              <Link to={user ? '/account' : '/login'}>{user ? 'Cuenta' : 'Acceder'}</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
