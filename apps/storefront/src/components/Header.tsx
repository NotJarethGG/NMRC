import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { useCategories, useCollections, useProducts } from '../hooks/useCatalog';

export function Header() {
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const isHome = location.pathname === '/';

  const { data: categories } = useCategories();
  const { data: collections } = useCollections();
  const { data: featured } = useProducts({ featured: true });
  const tile = featured?.[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const solid = !isHome || scrolled || megaOpen || searchOpen;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setTerm('');
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  // Categorías destacadas para accesos directos en el nav
  const shortcuts = ['outerwear', 'knitwear'];
  const directLinks = (categories ?? []).filter((c) => shortcuts.includes(c.slug));

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={() => setMegaOpen(false)}
      className={`fixed top-9 inset-x-0 z-50 transition-colors duration-500 ${
        solid ? 'text-bone bg-noir/90 backdrop-blur-md border-b border-bone/10' : 'text-bone'
      }`}
    >
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        <div className="h-14 md:h-16 flex items-center justify-between gap-6">
          {/* IZQUIERDA: logo + nav */}
          <div className="flex items-center gap-8 xl:gap-10 min-w-0">
            <Link
              to="/"
              className="font-display text-2xl md:text-[26px] uppercase tracking-[0.12em] leading-none shrink-0"
            >
              GosthShop
            </Link>

            <nav className="hidden md:flex items-center gap-6 xl:gap-7 text-[11px] uppercase tracking-luxe">
              <button
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((v) => !v)}
                className={`uppercase link-underline transition-opacity ${megaOpen ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                Tienda
              </button>
              <NavLink
                to="/shop"
                onMouseEnter={() => setMegaOpen(false)}
                className="link-underline opacity-70 hover:opacity-100"
              >
                Novedades
              </NavLink>
              {directLinks.map((c) => (
                <NavLink
                  key={c.id}
                  to={`/shop?category=${c.slug}`}
                  onMouseEnter={() => setMegaOpen(false)}
                  className="hidden lg:inline link-underline opacity-70 hover:opacity-100"
                >
                  {c.name}
                </NavLink>
              ))}
              <NavLink
                to="/collections"
                onMouseEnter={() => setMegaOpen(false)}
                className={({ isActive }) =>
                  `link-underline transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
                }
              >
                Colecciones
              </NavLink>
              <NavLink
                to="/about"
                onMouseEnter={() => setMegaOpen(false)}
                className={({ isActive }) =>
                  `link-underline transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
                }
              >
                Casa
              </NavLink>
            </nav>
          </div>

          {/* DERECHA: buscar + cuenta + bolsa + menú móvil */}
          <div className="flex items-center gap-5 md:gap-6 text-[11px] uppercase tracking-luxe shrink-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Buscar"
              className="opacity-80 hover:opacity-100"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
            <Link
              to={user ? '/account' : '/login'}
              className="link-underline opacity-70 hover:opacity-100 hidden sm:inline"
            >
              {user ? 'Cuenta' : 'Acceder'}
            </Link>
            <button onClick={openCart} className="link-underline opacity-80 hover:opacity-100">
              Bolsa ({count})
            </button>
            <button
              className="md:hidden opacity-90"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-noir/95 backdrop-blur-md border-b border-bone/10"
          >
            <form onSubmit={submitSearch} className="max-w-editorial mx-auto px-5 md:px-10 py-5 flex items-center gap-4">
              <svg className="w-5 h-5 text-stone shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                ref={searchRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar prendas, hoodies, oversize…"
                className="flex-1 bg-transparent text-bone text-lg outline-none placeholder:text-stone/60"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-stone hover:text-bone text-[11px] uppercase tracking-luxe">
                Cerrar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MEGA MENU (desktop) */}
      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block absolute inset-x-0 top-full bg-noir/95 backdrop-blur-md border-b border-bone/10"
          >
            <div className="max-w-editorial mx-auto px-10 py-10 grid grid-cols-[1fr_1fr_1.4fr] gap-12">
              <div>
                <p className="eyebrow mb-5">Categorías</p>
                <ul className="space-y-3">
                  <li>
                    <Link to="/shop" className="text-xs uppercase tracking-luxe text-bone/70 hover:text-bone link-underline">
                      Ver todo
                    </Link>
                  </li>
                  {categories?.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/shop?category=${c.slug}`}
                        className="text-xs uppercase tracking-luxe text-bone/70 hover:text-bone link-underline"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="eyebrow mb-5">Colecciones</p>
                <ul className="space-y-3">
                  {collections?.map((c) => (
                    <li key={c.id}>
                      <Link
                        to={`/shop?collection=${c.slug}`}
                        className="text-xs uppercase tracking-luxe text-bone/70 hover:text-bone link-underline"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {tile && (
                <Link to={`/product/${tile.slug}`} className="group relative block aspect-[16/9] overflow-hidden bg-graphite">
                  {tile.images[0] && (
                    <img
                      src={tile.images[0].url}
                      alt={tile.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <span className="eyebrow text-bone/60">Destacado</span>
                    <p className="font-display text-2xl text-bone mt-1">{tile.name}</p>
                  </div>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENÚ MÓVIL */}
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
              <Link to="/shop">Novedades</Link>
              <span className="eyebrow pt-2">Categorías</span>
              {categories?.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.slug}`}
                  className="text-bone/70 pl-3 text-xs uppercase tracking-luxe"
                >
                  {c.name}
                </Link>
              ))}
              <Link to="/collections" className="pt-2">Colecciones</Link>
              <Link to="/about">Casa</Link>
              <Link to={user ? '/account' : '/login'}>{user ? 'Cuenta' : 'Acceder'}</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
