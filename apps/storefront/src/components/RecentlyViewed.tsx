import { useProducts } from '../hooks/useCatalog';
import { useRecentlyViewed } from '../store/recentlyViewed';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';
import { useT } from '../i18n';

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const t = useT();
  const ids = useRecentlyViewed((s) => s.ids);
  const { data: products } = useProducts();

  const items = ids
    .filter((id) => id !== excludeId)
    .map((id) => products?.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);

  if (items.length < 2) return null;

  return (
    <section className="max-w-editorial mx-auto px-5 md:px-10 py-20 md:py-24 border-t border-bone/10">
      <Reveal className="mb-10">
        <span className="eyebrow">{t('home.yourJourney')}</span>
        <h2 className="font-display text-3xl md:text-4xl mt-2 uppercase">{t('home.recentlyViewed')}</h2>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
