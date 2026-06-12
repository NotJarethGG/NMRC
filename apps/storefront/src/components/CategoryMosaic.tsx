import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useCatalog';
import { Reveal } from './Reveal';
import { useT } from '../i18n';

interface Tile {
  slug: string;
  name: string;
  image?: string;
  count: number;
}

export function CategoryMosaic() {
  const t = useT();
  const { data: products } = useProducts();

  const map = new Map<string, Tile>();
  products?.forEach((p) => {
    if (!p.category) return;
    const existing = map.get(p.category.slug);
    if (existing) existing.count += 1;
    else
      map.set(p.category.slug, {
        slug: p.category.slug,
        name: p.category.name,
        image: p.images[0]?.url,
        count: 1,
      });
  });
  const tiles = [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6);

  if (tiles.length === 0) return null;

  return (
    <section className="max-w-editorial mx-auto px-5 md:px-10 py-24 md:py-32">
      <Reveal className="flex items-end justify-between mb-10">
        <div>
          <span className="eyebrow">{t('home.explore')}</span>
          <h2 className="font-display text-4xl md:text-5xl mt-3 uppercase">{t('home.shopByCategory')}</h2>
        </div>
        <Link to="/shop" className="hidden md:inline text-[11px] uppercase tracking-luxe link-underline">
          {t('home.viewAll')}
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.07 }}
            className={i === 0 ? 'col-span-2 lg:col-span-1' : ''}
          >
            <Link
              to={`/shop?category=${tile.slug}`}
              className="group relative block aspect-[4/5] overflow-hidden bg-graphite"
            >
              {tile.image && (
                <img
                  src={tile.image}
                  alt={tile.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-[1100ms] ease-luxe group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-noir/85 via-noir/20 to-noir/10 transition-colors duration-500 group-hover:from-noir/90" />
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="font-display text-3xl md:text-4xl text-bone">{tile.name}</h3>
                <span className="mt-2 inline-block text-[11px] uppercase tracking-luxe text-bone/70 link-underline">
                  {t('home.shopNow')}
                  {tile.count} {tile.count === 1 ? t('home.piece') : t('home.pieces')}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
