import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProduct, useProducts } from '../hooks/useCatalog';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { formatCRC } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function ProductDetail() {
  const { slug = '' } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const add = useCart((s) => s.add);
  const liked = useWishlist((s) => (product ? s.ids.includes(product.id) : false));
  const toggleWish = useWishlist((s) => s.toggle);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  // Relacionados de la misma categoría
  const { data: catProducts } = useProducts({ category: product?.category?.slug });
  const related = (catProducts ?? []).filter((p) => p.id !== product?.id).slice(0, 4);

  useDocumentTitle(product?.name, product?.description ?? undefined);

  // Reinicia selección al cambiar de producto
  useEffect(() => {
    setSelected(null);
    setActiveImg(0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-28 md:pt-32 max-w-editorial mx-auto px-5 md:px-10 grid md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-graphite animate-pulse" />
        <div className="space-y-4 pt-10">
          <div className="h-8 w-2/3 bg-graphite animate-pulse" />
          <div className="h-4 w-1/3 bg-graphite animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 text-center">
        <p className="text-stone">Producto no encontrado.</p>
        <Link to="/shop" className="btn-outline mt-6">Volver a la tienda</Link>
      </div>
    );
  }

  const variant = product.variants.find((v) => v.id === selected);
  const canAdd = variant && variant.stock > 0;
  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);

  const handleAdd = () => {
    if (!variant) return;
    add({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      size: variant.size,
      priceCents: product.priceCents,
      image: product.images[0]?.url,
      quantity: 1,
      maxStock: variant.stock,
    });
  };

  return (
    <div className="pt-28 md:pt-32">
      <div className="max-w-editorial mx-auto md:px-10">
        {/* MIGAS */}
        <nav className="px-5 md:px-0 mb-6 text-[11px] uppercase tracking-luxe text-stone">
          <Link to="/shop" className="hover:text-bone">Tienda</Link>
          <span className="mx-2">/</span>
          <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-bone">
            {product.category?.name}
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-0 md:gap-12">
          {/* GALERÍA */}
          <div>
            <div className="relative aspect-[3/4] bg-graphite overflow-hidden">
              <motion.img
                key={activeImg}
                src={product.images[activeImg]?.url}
                alt={product.name}
                decoding="async"
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 px-5 md:px-0 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-20 overflow-hidden bg-graphite transition-opacity ${
                      activeImg === i ? 'opacity-100 ring-1 ring-bone' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="px-5 md:px-0 py-10 md:py-16 md:pr-10">
            <div className="md:sticky md:top-28">
              <span className="eyebrow">{product.category?.name}</span>
              <h1 className="font-display text-4xl md:text-5xl mt-3 leading-tight uppercase">
                {product.name}
              </h1>
              <p className="text-xl mt-4">{formatCRC(product.priceCents)}</p>

              <p className="mt-8 text-stone leading-relaxed max-w-md">{product.description}</p>

              {/* TALLAS */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="eyebrow">Talla</span>
                  {variant && variant.stock <= 3 && variant.stock > 0 && (
                    <span className="text-[11px] uppercase tracking-wide text-clay">
                      ¡Quedan {variant.stock}!
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const out = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        disabled={out}
                        onClick={() => setSelected(v.id)}
                        className={`min-w-[3.5rem] h-12 px-4 text-sm border transition-all duration-300 ${
                          selected === v.id
                            ? 'border-bone bg-bone text-noir'
                            : out
                              ? 'border-bone/10 text-bone/25 line-through cursor-not-allowed'
                              : 'border-bone/25 hover:border-bone'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AÑADIR + FAVORITO */}
              <div className="flex gap-3 mt-10">
                <button onClick={handleAdd} disabled={!canAdd} className="btn-ink flex-1">
                  {selected ? (canAdd ? 'Añadir a la bolsa' : 'Agotado') : 'Selecciona una talla'}
                </button>
                <button
                  onClick={() => toggleWish(product.id)}
                  aria-label={liked ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  className={`w-14 shrink-0 border flex items-center justify-center transition-colors ${
                    liked ? 'border-bone bg-bone text-noir' : 'border-bone/30 text-bone hover:border-bone'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.2 5c2 0 3.3 1.1 4.1 2.3l.7 1 .7-1C11.5 6.1 12.8 5 14.8 5 18 5 19.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
                  </svg>
                </button>
              </div>

              {totalStock > 0 && totalStock <= 8 && (
                <p className="mt-4 text-[11px] uppercase tracking-wide text-clay">
                  Edición limitada · pocas unidades disponibles
                </p>
              )}

              <div className="mt-8 space-y-2 text-[11px] uppercase tracking-wide text-stone">
                <p>· Pago seguro por SINPE Móvil</p>
                <p>· Confirmación de pedido por WhatsApp</p>
                <p>· Cambios fáciles dentro de los 7 días</p>
              </div>
            </div>
          </div>
        </div>

        {/* RELACIONADOS */}
        {related.length > 0 && (
          <section className="px-5 md:px-0 mt-24 md:mt-32 pb-8">
            <Reveal className="mb-10">
              <span className="eyebrow">Completa el look</span>
              <h2 className="font-display text-3xl md:text-4xl mt-2 uppercase">También te puede gustar</h2>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-12">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
