import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../store/cart';
import { useAuth } from '../store/auth';
import { useWishlist } from '../store/wishlist';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { usePrice } from '../lib/currency';
import { cldUrl } from '../lib/img';
import { useT, useLocalize } from '../i18n';

export function Header() {
  const t = useT();
  const L = useLocalize();
  const price = usePrice();
  const count = useCart((s) => s.count());
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const user = useAuth((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();
  const { data: featured } = useProducts({ featured: true });
  const { data: allProducts } = useProducts();
  const tile = featured?.[0];

  // Imagen representativa por categoría (primera pieza con foto)
  const categoryImage = (slug?: string) =>
    (allProducts ?? []).find((p) => p.category?.slug === slug && p.images[0])?.images[0]?.url;
  // Categorías con más piezas primero (para el mega-menú y el buscador)
  const topCategories = (categories ?? [])
    .map((c) => ({
      ...c,
      count: (allProducts ?? []).filter((p) => p.category?.slug === c.slug).length,
      image: categoryImage(c.slug),
    }))
    .sort((a, b) => b.count - a.count);
  const topFeatured = (featured ?? []).slice(0, 4);

  // Sugerencias en vivo (mínimo 2 caracteres)
  const suggestions =
    term.trim().length >= 2
      ? (allProducts ?? [])
          .filter((p) => p.name.toLowerCase().includes(term.trim().toLowerCase()))
          .slice(0, 5)
      : [];

  const goToProduct = (slug: string) => {
    setSearchOpen(false);
    setTerm('');
    navigate(`/product/${slug}`);
  };

  useEffect(() => {
    const onScroll = () => undefined;
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

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setTerm('');
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onMouseLeave={() => setMegaOpen(false)}
      className="fixed top-9 inset-x-0 z-50 transition-colors duration-500 text-bone bg-noir border-b border-bone/10"
    >
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        <div className="h-14 md:h-16 flex items-center justify-between gap-6">
          {/* IZQUIERDA: logo + nav */}
          <div className="flex items-center gap-8 xl:gap-10 min-w-0">
            <Link
              to="/"
              className="font-varsity text-2xl md:text-[26px] uppercase tracking-[0.22em] leading-none shrink-0"
            >
              NMRC
            </Link>

            <nav className="hidden md:flex items-center gap-6 xl:gap-7 text-[11px] uppercase tracking-luxe">
              {/* Hover abre el mega-menú; clic navega a la tienda */}
              <NavLink
                to="/shop"
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen(false)}
                className={`uppercase link-underline transition-opacity ${megaOpen ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
              >
                {t('nav.shop')}
              </NavLink>
              <NavLink
                to="/shop"
                onMouseEnter={() => setMegaOpen(false)}
                className="link-underline opacity-70 hover:opacity-100"
              >
                {t('nav.newArrivals')}
              </NavLink>
              <NavLink
                to="/collections"
                onMouseEnter={() => setMegaOpen(false)}
                className={({ isActive }) =>
                  `link-underline transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
                }
              >
                {t('nav.collections')}
              </NavLink>
              <NavLink
                to="/about"
                onMouseEnter={() => setMegaOpen(false)}
                className={({ isActive }) =>
                  `link-underline transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
                }
              >
                {t('nav.about')}
              </NavLink>
            </nav>
          </div>

          {/* DERECHA: buscar + cuenta + bolsa + menú móvil */}
          <div className="flex items-center gap-5 md:gap-6 text-[11px] uppercase tracking-luxe shrink-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={t('nav.search')}
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
              {user ? t('nav.account') : t('nav.signIn')}
            </Link>
            <Link
              to="/wishlist"
              aria-label={t('nav.wishlist')}
              className="relative opacity-80 hover:opacity-100 hidden sm:flex items-center"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.2 5c2 0 3.3 1.1 4.1 2.3l.7 1 .7-1C11.5 6.1 12.8 5 14.8 5 18 5 19.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
              </svg>
              {wishCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-bone text-noir text-[9px] font-semibold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishCount}
                </span>
              )}
            </Link>
            <button onClick={openCart} className="link-underline opacity-80 hover:opacity-100">
              {t('nav.bag')} (
              <motion.span
                key={count}
                initial={{ scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block"
              >
                {count}
              </motion.span>
              )
            </button>
            <button
              className="md:hidden opacity-90"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t('nav.menu')}
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
                placeholder={t('nav.searchPlaceholder')}
                className="flex-1 bg-transparent text-bone text-lg outline-none placeholder:text-stone/60"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-stone hover:text-bone text-[11px] uppercase tracking-luxe">
                {t('nav.close')}
              </button>
            </form>

            {/* ESTADO VACÍO: categorías populares + tendencias */}
            {term.trim().length < 2 && (
              <div className="max-w-editorial mx-auto px-5 md:px-10 pb-6 border-t border-bone/10 pt-5">
                <p className="eyebrow mb-3">{t('search.popular')}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {topCategories.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setTerm('');
                        navigate(`/shop?category=${c.slug}`);
                      }}
                      className="text-[11px] uppercase tracking-wide border border-bone/20 hover:border-bone px-3 py-1.5 text-bone/80 hover:text-bone transition-colors"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                {topFeatured.length > 0 && (
                  <>
                    <p className="eyebrow mb-3">{t('search.trending')}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {topFeatured.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => goToProduct(p.slug)}
                          className="text-left group/tr"
                        >
                          <div className="aspect-[3/4] bg-graphite overflow-hidden mb-2">
                            {p.images[0] && (
                              <img
                                src={cldUrl(p.images[0].url, 400)}
                                alt={L.name(p)}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/tr:scale-105"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-bone/90 truncate">{L.name(p)}</p>
                          <p className="text-[11px] text-stone">{price(p.priceCents)}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* SUGERENCIAS EN VIVO */}
            {suggestions.length > 0 && (
              <div className="max-w-editorial mx-auto px-5 md:px-10 pb-5">
                <ul className="divide-y divide-bone/5 border-t border-bone/10">
                  {suggestions.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => goToProduct(p.slug)}
                        className="w-full flex items-center gap-4 py-2.5 px-1 text-left hover:bg-bone/5 transition-colors"
                      >
                        <div className="w-10 h-12 bg-graphite overflow-hidden shrink-0">
                          {p.images[0] && (
                            <img src={cldUrl(p.images[0].url, 100)} alt="" loading="lazy" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-bone truncate">{L.name(p)}</p>
                          <p className="text-[10px] uppercase tracking-wide text-stone">
                            {p.category?.name}
                          </p>
                        </div>
                        <span className="text-sm text-bone shrink-0">{price(p.priceCents)}</span>
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => {
                        const q = term.trim();
                        if (!q) return;
                        setSearchOpen(false);
                        setTerm('');
                        navigate(`/shop?search=${encodeURIComponent(q)}`);
                      }}
                      className="w-full py-3 text-[11px] uppercase tracking-luxe text-stone hover:text-bone text-left px-1"
                    >
                      {t('nav.seeAllResults')}
                    </button>
                  </li>
                </ul>
              </div>
            )}
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
            <div className="max-w-editorial mx-auto px-10 py-10">
              <div className="flex items-center justify-between mb-6">
                <p className="eyebrow">{t('nav.categories')}</p>
                <Link to="/shop" className="text-[11px] uppercase tracking-luxe text-bone/70 hover:text-bone link-underline">
                  {t('nav.viewAll')} →
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {/* Tarjetas de categoría con imagen */}
                {topCategories.slice(0, 3).map((c) => (
                  <Link
                    key={c.id}
                    to={`/shop?category=${c.slug}`}
                    className="group/cat relative block aspect-[4/5] overflow-hidden bg-graphite"
                  >
                    {c.image && (
                      <img
                        src={cldUrl(c.image, 500)}
                        alt={c.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-luxe group-hover/cat:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="font-display text-xl text-bone uppercase leading-tight">{c.name}</p>
                      <span className="text-[10px] uppercase tracking-luxe text-bone/60">
                        {c.count} {c.count === 1 ? t('home.piece') : t('home.pieces')}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Pieza destacada */}
                {tile && (
                  <Link
                    to={`/product/${tile.slug}`}
                    className="group/feat relative block aspect-[4/5] overflow-hidden bg-graphite"
                  >
                    {tile.images[0] && (
                      <img
                        src={cldUrl(tile.images[0].url, 500)}
                        alt={L.name(tile)}
                        className="w-full h-full object-cover transition-transform duration-700 ease-luxe group-hover/feat:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-bone text-noir text-[9px] uppercase tracking-luxe px-2.5 py-1">
                        {t('nav.featured')}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <p className="font-display text-xl text-bone uppercase leading-tight">{L.name(tile)}</p>
                      <span className="text-[10px] uppercase tracking-luxe text-bone/60">
                        {price(tile.priceCents)}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
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
              <Link to="/shop">{t('nav.newArrivals')}</Link>
              <span className="eyebrow pt-2">{t('nav.categories')}</span>
              {categories?.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.slug}`}
                  className="text-bone/70 pl-3 text-xs uppercase tracking-luxe"
                >
                  {c.name}
                </Link>
              ))}
              <Link to="/collections" className="pt-2">{t('nav.collections')}</Link>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/wishlist">{t('nav.wishlist')}{wishCount > 0 ? ` (${wishCount})` : ''}</Link>
              <Link to={user ? '/account' : '/login'}>{user ? t('nav.account') : t('nav.signIn')}</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
