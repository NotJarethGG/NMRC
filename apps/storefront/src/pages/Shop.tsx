import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts, useCategories, useCollections } from '../hooks/useCatalog';
import { ProductCard } from '../components/ProductCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Product } from '../lib/types';

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

type Sort = 'relevancia' | 'precio-asc' | 'precio-desc' | 'novedades';

const SORTS: { value: Sort; label: string }[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'novedades', label: 'Novedades' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-bone/10 py-6">
      <p className="eyebrow mb-4">{title}</p>
      {children}
    </div>
  );
}

interface FiltersProps {
  category?: string;
  collection?: string;
  sort: Sort;
  sizes: string[];
  categories: { id: string; name: string; slug: string }[];
  collections: { id: string; name: string; slug: string }[];
  onCategory: (slug?: string) => void;
  onCollection: (slug?: string) => void;
  onSort: (s: Sort) => void;
  onToggleSize: (s: string) => void;
  onClear: () => void;
}

function Filters(props: FiltersProps) {
  const radio = (active: boolean) =>
    `w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
      active ? 'border-bone' : 'border-bone/30'
    }`;

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-[13px] uppercase tracking-luxe font-medium">Filtros y orden</h2>
        <button onClick={props.onClear} className="text-[11px] uppercase tracking-wide text-stone hover:text-bone">
          Limpiar todo
        </button>
      </div>

      <Section title="Ordenar por">
        <ul className="space-y-3">
          {SORTS.map((s) => (
            <li key={s.value}>
              <button
                onClick={() => props.onSort(s.value)}
                className="flex items-center gap-3 text-sm text-bone/80 hover:text-bone"
              >
                <span className={radio(props.sort === s.value)}>
                  {props.sort === s.value && <span className="w-2 h-2 rounded-full bg-bone" />}
                </span>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Categoría">
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => props.onCategory(undefined)}
              className={`text-sm ${!props.category ? 'text-bone' : 'text-bone/60 hover:text-bone'}`}
            >
              Todas
            </button>
          </li>
          {props.categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => props.onCategory(c.slug)}
                className={`text-sm uppercase tracking-wide ${
                  props.category === c.slug ? 'text-bone' : 'text-bone/60 hover:text-bone'
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Talla">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => {
            const active = props.sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => props.onToggleSize(s)}
                className={`min-w-[2.6rem] h-10 text-xs border transition-colors ${
                  active ? 'border-bone bg-bone text-noir' : 'border-bone/25 text-bone/80 hover:border-bone'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Colección">
        <ul className="space-y-3">
          <li>
            <button
              onClick={() => props.onCollection(undefined)}
              className={`text-sm ${!props.collection ? 'text-bone' : 'text-bone/60 hover:text-bone'}`}
            >
              Todas
            </button>
          </li>
          {props.collections.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => props.onCollection(c.slug)}
                className={`text-sm ${props.collection === c.slug ? 'text-bone' : 'text-bone/60 hover:text-bone'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

export function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') ?? undefined;
  const collection = params.get('collection') ?? undefined;
  const search = params.get('search') ?? undefined;

  const { data: categories } = useCategories();
  const { data: collections } = useCollections();
  const { data: products, isLoading } = useProducts({ category, collection, search });

  const [sort, setSort] = useState<Sort>('relevancia');
  const [sizes, setSizes] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'category') next.delete('collection');
    if (key === 'category' || key === 'collection') next.delete('search');
    setParams(next);
  };

  const clearAll = () => {
    setParams(new URLSearchParams());
    setSort('relevancia');
    setSizes([]);
  };

  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const visible = useMemo(() => {
    let list: Product[] = products ? [...products] : [];
    if (sizes.length) {
      list = list.filter((p) => p.variants.some((v) => sizes.includes(v.size) && v.stock > 0));
    }
    switch (sort) {
      case 'precio-asc':
        list.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case 'precio-desc':
        list.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'novedades':
        list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
        break;
    }
    return list;
  }, [products, sizes, sort]);

  const featured = useMemo(() => (products ?? []).filter((p) => p.featured).slice(0, 8), [products]);

  const activeCategory = categories?.find((c) => c.slug === category);
  const title = search ? `“${search}”` : activeCategory ? activeCategory.name : 'La Tienda';
  useDocumentTitle(search ? `Buscar: ${search}` : activeCategory ? activeCategory.name : 'Tienda');
  const filterCount = (category ? 1 : 0) + (collection ? 1 : 0) + sizes.length;

  const filterProps: FiltersProps = {
    category,
    collection,
    sort,
    sizes,
    categories: categories ?? [],
    collections: collections ?? [],
    onCategory: (slug) => updateParam('category', slug),
    onCollection: (slug) => updateParam('collection', slug),
    onSort: setSort,
    onToggleSize: toggleSize,
    onClear: clearAll,
  };

  return (
    <div className="pt-28 md:pt-36 pb-16">
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        {/* TÍTULO */}
        <header className="mb-8">
          <span className="eyebrow">{search ? 'Resultados' : 'Catálogo'}</span>
          <h1 className="font-display text-5xl md:text-7xl mt-3">{title}</h1>
        </header>

        {/* DESTACADOS (estilo "Top en categoría") */}
        {!search && !category && !collection && featured.length > 0 && (
          <section className="mb-14">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="text-[13px] uppercase tracking-luxe font-medium">Lo más buscado</h2>
              <span className="text-[11px] uppercase tracking-wide text-stone">Desliza →</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-5 px-5 md:mx-0 md:px-0 snap-x">
              {featured.map((p, i) => (
                <div key={p.id} className="relative w-44 md:w-56 shrink-0 snap-start">
                  <span className="absolute top-2 left-2 z-10 bg-bone text-noir text-[11px] font-medium w-7 h-7 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-10">
          {/* SIDEBAR (desktop) */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-32">
              <Filters {...filterProps} />
            </div>
          </aside>

          {/* GRID */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[11px] uppercase tracking-wide text-stone">
                {isLoading ? 'Cargando…' : `${visible.length} ${visible.length === 1 ? 'pieza' : 'piezas'}`}
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden text-[11px] uppercase tracking-luxe border border-bone/25 px-4 py-2 hover:border-bone"
              >
                Filtros y orden{filterCount ? ` (${filterCount})` : ''}
              </button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-graphite animate-pulse" />
                ))}
              </div>
            ) : visible.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14">
                {visible.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-stone mb-5">
                  {search
                    ? `No encontramos prendas para “${search}”.`
                    : 'No hay piezas que coincidan con estos filtros.'}
                </p>
                <button onClick={clearAll} className="btn-outline">
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DRAWER MÓVIL */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60] bg-noir/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 z-[61] h-full w-full max-w-sm bg-coal lg:hidden overflow-y-auto"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between px-6 h-16 border-b border-bone/10">
                <span className="eyebrow">Filtros y orden</span>
                <button onClick={() => setDrawerOpen(false)} className="text-[11px] uppercase tracking-luxe">
                  Cerrar
                </button>
              </div>
              <div className="px-6 py-4">
                <Filters {...filterProps} />
              </div>
              <div className="sticky bottom-0 bg-coal border-t border-bone/10 p-4">
                <button onClick={() => setDrawerOpen(false)} className="btn-ink w-full">
                  Ver {visible.length} {visible.length === 1 ? 'pieza' : 'piezas'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
