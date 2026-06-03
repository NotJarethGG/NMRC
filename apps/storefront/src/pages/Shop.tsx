import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useCatalog';
import { ProductCard } from '../components/ProductCard';

export function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? undefined;
  const collection = params.get('collection') ?? undefined;
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ category, collection });

  const setCategory = (slug?: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    next.delete('collection');
    setParams(next);
  };

  return (
    <div className="pt-28 md:pt-36 pb-10">
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        <header className="text-center mb-14">
          <span className="eyebrow">Catálogo</span>
          <h1 className="font-display text-5xl md:text-7xl mt-4">La Tienda</h1>
        </header>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-14 text-[11px] uppercase tracking-luxe">
          <button
            onClick={() => setCategory(undefined)}
            className={`link-underline ${!category ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
          >
            Todo
          </button>
          {categories?.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`link-underline ${category === c.slug ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-graphite animate-pulse" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone py-24">No hay piezas en esta categoría por ahora.</p>
        )}
      </div>
    </div>
  );
}
