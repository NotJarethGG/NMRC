import { useProducts } from '../hooks/useCatalog';
import { useCart } from '../store/cart';
import { useQuickView } from '../store/quickview';
import { usePrice } from '../lib/currency';
import { cldUrl } from '../lib/img';
import { useT, useLocalize } from '../i18n';

// Cross-sell dentro del carrito: sugiere piezas que no están en la bolsa
export function CartSuggestions() {
  const t = useT();
  const L = useLocalize();
  const price = usePrice();
  const { data: products } = useProducts();
  const lines = useCart((s) => s.lines);
  const openQuickView = useQuickView((s) => s.open);

  const inCart = new Set(lines.map((l) => l.productId));
  const suggestions = (products ?? [])
    .filter((p) => !inCart.has(p.id) && p.variants.some((v) => v.stock > 0))
    .slice(0, 4);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-bone/10">
      <p className="eyebrow mb-4">{t('cart.suggestions')}</p>
      <div className="flex gap-3 overflow-x-auto -mx-1 px-1 pb-1 snap-x">
        {suggestions.map((p) => (
          <button
            key={p.id}
            onClick={() => openQuickView(p)}
            className="w-28 shrink-0 snap-start text-left group/sug"
          >
            <div className="aspect-[3/4] bg-graphite overflow-hidden mb-2">
              {p.images[0] && (
                <img
                  src={cldUrl(p.images[0].url, 220)}
                  alt={L.name(p)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/sug:scale-105"
                />
              )}
            </div>
            <p className="text-[11px] leading-tight text-bone/90 line-clamp-1">{L.name(p)}</p>
            <p className="text-[11px] text-stone mt-0.5">{price(p.priceCents)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
