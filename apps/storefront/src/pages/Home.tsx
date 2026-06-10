import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts, useCollections } from '../hooks/useCatalog';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { BenefitsBar } from '../components/BenefitsBar';
import { CategoryMosaic } from '../components/CategoryMosaic';
import { Newsletter } from '../components/Newsletter';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { Marquee } from '../components/Marquee';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const HERO = '/NMRC.png';

export function Home() {
  useDocumentTitle(undefined, 'NMRC — No Mercy. Streetwear sin concesiones. Edición limitada · Est. 2026.');
  const { data: products } = useProducts();
  const { data: collections } = useCollections();
  const lead = collections?.[0];
  const novedades = products?.slice(0, 8) ?? [];

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <motion.img
          src={HERO}
          alt="NMRC"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/70 via-noir/40 to-noir/80" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-bone px-6">
          <motion.h1
            className="font-varsity text-6xl md:text-8xl lg:text-9xl leading-[0.85] uppercase max-w-5xl"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            Forjado, no regalado
          </motion.h1>
          <motion.p
            className="mt-6 max-w-md text-bone/80 text-sm md:text-base leading-relaxed uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            Streetwear sin concesiones. Para quienes entrenan, crean y no piden permiso.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <Link to="/shop" className="btn-ink">
              Comprar ahora
            </Link>
            <Link
              to="/collections"
              className="btn-outline border-bone/40 text-bone hover:bg-bone hover:text-noir"
            >
              Ver colecciones
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-bone/60 text-[10px] uppercase tracking-wide2">
          <motion.span
            className="inline-block"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            Desliza ↓
          </motion.span>
        </div>
      </section>

      {/* BENEFICIOS */}
      <BenefitsBar />

      {/* TICKER NMRC */}
      <Marquee />

      {/* COMPRAR POR CATEGORÍA */}
      <CategoryMosaic />

      {/* NOVEDADES */}
      <section className="max-w-editorial mx-auto px-5 md:px-10 pb-24 md:pb-32">
        <Reveal className="flex items-end justify-between mb-12">
          <div>
            <span className="eyebrow">Recién llegado</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3">Novedades</h2>
          </div>
          <Link to="/shop" className="hidden md:inline text-[11px] uppercase tracking-luxe link-underline">
            Ver todo
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {novedades.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-coal border-y border-bone/10">
        <div className="max-w-editorial mx-auto px-5 md:px-10 py-24 md:py-36">
          <Reveal>
            <p className="font-condensed uppercase text-3xl md:text-5xl leading-tight max-w-4xl mx-auto text-center tracking-wide">
              No excuses. No limits. No mercy. La nueva era se construye con hierro y paciencia.
            </p>
          </Reveal>
        </div>
      </section>

      {/* COLECCIÓN DESTACADA */}
      {lead && (
        <section className="relative">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[80vh] overflow-hidden bg-graphite">
              {lead.heroImage && (
                <img src={lead.heroImage} alt={lead.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex items-center bg-smoke text-bone px-8 md:px-20 py-20">
              <Reveal>
                <span className="eyebrow text-bone/50">Colección</span>
                <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6">{lead.name}</h2>
                <p className="text-bone/70 leading-relaxed max-w-md mb-10">{lead.description}</p>
                <Link
                  to={`/shop?collection=${lead.slug}`}
                  className="btn-outline border-bone/40 text-bone hover:bg-bone hover:text-noir"
                >
                  Ver la colección
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* VISTOS RECIENTEMENTE */}
      <RecentlyViewed />

      {/* NEWSLETTER */}
      <Newsletter />
    </div>
  );
}
