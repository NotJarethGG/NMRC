import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useCatalog';
import { useWishlist } from '../store/wishlist';
import { ProductCard } from '../components/ProductCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function Wishlist() {
  useDocumentTitle('Favoritos');
  const ids = useWishlist((s) => s.ids);
  const clear = useWishlist((s) => s.clear);
  const { data: products, isLoading } = useProducts();

  const favorites = (products ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="pt-28 md:pt-36 pb-20">
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        <header className="flex items-end justify-between mb-12">
          <div>
            <span className="eyebrow">Tu selección</span>
            <h1 className="font-display text-5xl md:text-7xl mt-3 uppercase">Favoritos</h1>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={clear}
              className="text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
            >
              Vaciar
            </button>
          )}
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-graphite animate-pulse" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-14">
            {favorites.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-3xl uppercase mb-3">Aún no tienes favoritos</p>
            <p className="text-stone mb-10 max-w-sm mx-auto">
              Toca el corazón en cualquier prenda para guardarla aquí.
            </p>
            <Link to="/shop" className="btn-ink">
              Explorar la tienda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
