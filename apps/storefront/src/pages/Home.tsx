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
import { DropCountdown } from '../components/DropCountdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';
import { BRAND_TAGLINE } from '../lib/brand';

const HERO = '/NMRC.png';

export function Home() {
  const t = useT();
  useDocumentTitle(undefined, BRAND_TAGLINE);
  const { data: products } = useProducts();
  const { data: collections } = useCollections();
  const lead = collections?.[0];
  const latestDrop = products?.slice(0, 8) ?? [];

  const scrollToWaitlist = () =>
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <motion.img
          src={HERO}
          alt="NMRC — No Mercy"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/80 via-noir/55 to-noir/90" />
        {/* Scrim central para que el texto siempre tenga contraste (sobre todo en móvil) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,11,10,0.55),transparent_72%)]" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-bone px-6">
          <motion.h1
            className="font-varsity text-7xl md:text-9xl leading-[0.85] uppercase"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            NMRC
          </motion.h1>
          <motion.p
            className="font-condensed text-xl md:text-3xl uppercase tracking-[0.4em] text-bone/90 mt-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.45 }}
          >
            No Mercy
          </motion.p>
          <motion.p
            className="mt-8 max-w-md text-bone/80 text-sm md:text-base leading-relaxed uppercase tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            {t('hero.tagline')}
            <span className="block mt-2 text-bone font-medium">{t('hero.sub')}</span>
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95 }}
          >
            <button onClick={scrollToWaitlist} className="btn-ink">
              {t('hero.joinWaitlist')}
            </button>
            <Link
              to="/shop"
              className="btn-outline border-bone/40 text-bone hover:bg-bone hover:text-noir"
            >
              {t('hero.shopDrops')}
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-bone/60 text-[10px] uppercase tracking-wide2">
          <motion.span
            className="inline-block"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            {t('hero.scroll')} ↓
          </motion.span>
        </div>
      </section>

      {/* BENEFICIOS */}
      <BenefitsBar />

      {/* TICKER NMRC */}
      <Marquee />

      {/* COMPRAR POR CATEGORÍA */}
      <CategoryMosaic />

      {/* ÚLTIMO DROP */}
      <section className="max-w-editorial mx-auto px-5 md:px-10 pb-24 md:pb-32">
        <Reveal className="flex items-end justify-between mb-12">
          <div>
            <span className="eyebrow">{t('home.justLanded')}</span>
            <h2 className="font-display text-4xl md:text-5xl mt-3 uppercase">{t('home.latestDrop')}</h2>
          </div>
          <Link to="/shop" className="hidden md:inline text-[11px] uppercase tracking-luxe link-underline">
            {t('home.viewAll')}
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
          {latestDrop.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="bg-coal border-y border-bone/10">
        <div className="max-w-editorial mx-auto px-5 md:px-10 py-24 md:py-36">
          <Reveal>
            <p className="font-condensed uppercase text-3xl md:text-5xl leading-tight max-w-4xl mx-auto text-center tracking-wide">
              {t('home.manifesto')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* COUNTDOWN DROP 001 */}
      <DropCountdown />

      {/* COLECCIÓN DESTACADA */}
      {lead && (
        <section className="relative">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[80vh] overflow-hidden bg-graphite">
              {lead.heroImage && (
                <img src={lead.heroImage} alt={lead.name} loading="lazy" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex items-center bg-smoke text-bone px-8 md:px-20 py-20">
              <Reveal>
                <span className="eyebrow text-bone/50">{t('home.collection')}</span>
                <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 uppercase">{lead.name}</h2>
                <p className="text-bone/70 leading-relaxed max-w-md mb-10">{lead.description}</p>
                <Link
                  to={`/shop?collection=${lead.slug}`}
                  className="btn-outline border-bone/40 text-bone hover:bg-bone hover:text-noir"
                >
                  {t('home.viewCollection')}
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* VISTOS RECIENTEMENTE */}
      <RecentlyViewed />

      {/* WAITLIST */}
      <Newsletter />
    </div>
  );
}
