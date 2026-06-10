import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useProduct, useProducts } from '../hooks/useCatalog';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { useToast } from '../store/toast';
import { useRecentlyViewed } from '../store/recentlyViewed';
import { formatCRC } from '../lib/api';
import { useConfig } from '../hooks/useConfig';
import { ProductCard } from '../components/ProductCard';
import { Reveal } from '../components/Reveal';
import { SizeGuide } from '../components/SizeGuide';
import { ReviewsSection, Stars, ratingSummary } from '../components/Reviews';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-bone/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-[12px] uppercase tracking-luxe text-bone"
      >
        {title}
        <span className={`text-stone transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-stone leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductDetail() {
  const { slug = '' } = useParams();
  const { data: product, isLoading } = useProduct(slug);
  const add = useCart((s) => s.add);
  const liked = useWishlist((s) => (product ? s.ids.includes(product.id) : false));
  const toggleWish = useWishlist((s) => s.toggle);
  const showToast = useToast((s) => s.show);
  const config = useConfig();
  const [selected, setSelected] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  const sizesRef = useRef<HTMLDivElement>(null);

  const scrollToSizes = () =>
    sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Relacionados de la misma categoría
  const { data: catProducts } = useProducts({ category: product?.category?.slug });
  const related = (catProducts ?? []).filter((p) => p.id !== product?.id).slice(0, 4);

  useDocumentTitle(product?.name, product?.description ?? undefined);

  // Reinicia selección al cambiar de producto
  useEffect(() => {
    setSelected(null);
    setActiveImg(0);
    setQty(1);
  }, [slug]);

  // La cantidad vuelve a 1 al cambiar de talla
  useEffect(() => {
    setQty(1);
  }, [selected]);

  // Registra el producto como "visto recientemente"
  const track = useRecentlyViewed((s) => s.track);
  useEffect(() => {
    if (product?.id) track(product.id);
  }, [product?.id, track]);

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
  const maxQty = variant?.stock ?? 1;

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
      quantity: qty,
      maxStock: variant.stock,
    });
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${product.name} · NMRC`, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast('Enlace copiado');
      }
    } catch {
      /* compartir cancelado */
    }
  };

  return (
    <div className="pt-28 md:pt-32 pb-24 md:pb-0">
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
          {/* GALERÍA (zoom siguiendo el cursor, estilo SSENSE/Zara) */}
          <div>
            <div
              className="relative aspect-[3/4] bg-graphite overflow-hidden md:cursor-zoom-in"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
                const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
                setZoomOrigin(`${x}% ${y}%`);
              }}
            >
              <motion.img
                key={activeImg}
                src={product.images[activeImg]?.url}
                alt={product.name}
                decoding="async"
                style={{ transformOrigin: zoomOrigin }}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  zoomed ? 'md:scale-[1.7]' : ''
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
              <div className="flex items-center gap-4 mt-4">
                <p className="text-xl">{formatCRC(product.priceCents)}</p>
                {(() => {
                  const s = ratingSummary(product);
                  if (!s) return null;
                  return (
                    <button
                      onClick={() =>
                        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="flex items-center gap-1.5 text-stone hover:text-bone transition-colors"
                    >
                      <Stars value={s.avg} className="w-3.5 h-3.5" />
                      <span className="text-xs">({s.count})</span>
                    </button>
                  );
                })()}
              </div>

              <p className="mt-8 text-stone leading-relaxed max-w-md">{product.description}</p>

              {/* TALLAS */}
              <div className="mt-10" ref={sizesRef}>
                <div className="flex items-center justify-between mb-3">
                  <span className="eyebrow">Talla</span>
                  <div className="flex items-center gap-4">
                    {variant && variant.stock <= 3 && variant.stock > 0 && (
                      <span className="text-[11px] uppercase tracking-wide text-clay">
                        ¡Quedan {variant.stock}!
                      </span>
                    )}
                    <button
                      onClick={() => setGuideOpen(true)}
                      className="text-[11px] uppercase tracking-wide text-stone hover:text-bone link-underline"
                    >
                      Guía de tallas
                    </button>
                  </div>
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

              {/* CANTIDAD + AÑADIR + FAVORITO + COMPARTIR */}
              <div className="flex gap-3 mt-10">
                <div
                  className={`flex items-center border border-bone/25 shrink-0 transition-opacity ${
                    variant ? '' : 'opacity-40 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-full text-stone hover:text-bone"
                    aria-label="Menos"
                  >
                    –
                  </button>
                  <span className="w-8 text-center text-sm">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="w-10 h-full text-stone hover:text-bone"
                    aria-label="Más"
                  >
                    +
                  </button>
                </div>
                <button onClick={handleAdd} disabled={!canAdd} className="btn-ink flex-1">
                  {selected ? (canAdd ? 'Añadir a la bolsa' : 'Agotado') : 'Selecciona una talla'}
                </button>
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => {
                    toggleWish(product.id);
                    showToast(liked ? 'Quitado de favoritos' : 'Añadido a favoritos');
                  }}
                  className={`flex-1 h-12 border flex items-center justify-center gap-2 text-[11px] uppercase tracking-luxe transition-colors ${
                    liked ? 'border-bone bg-bone text-noir' : 'border-bone/30 text-bone hover:border-bone'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.2 5c2 0 3.3 1.1 4.1 2.3l.7 1 .7-1C11.5 6.1 12.8 5 14.8 5 18 5 19.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
                  </svg>
                  {liked ? 'En favoritos' : 'Favorito'}
                </button>
                <button
                  onClick={onShare}
                  className="flex-1 h-12 border border-bone/30 text-bone hover:border-bone flex items-center justify-center gap-2 text-[11px] uppercase tracking-luxe transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="6" cy="12" r="2.2" />
                    <circle cx="17" cy="6" r="2.2" />
                    <circle cx="17" cy="18" r="2.2" />
                    <path d="M8 11l7-4M8 13l7 4" />
                  </svg>
                  Compartir
                </button>
              </div>

              {totalStock > 0 && totalStock <= 8 && (
                <p className="mt-4 text-[11px] uppercase tracking-wide text-clay">
                  Edición limitada · pocas unidades disponibles
                </p>
              )}

              {/* TRUST BADGES */}
              <div className="grid grid-cols-3 gap-2 mt-8 text-center">
                {[
                  {
                    t: 'Pago SINPE',
                    icon: <path d="M3 7h18v10H3zM3 10h18" />,
                  },
                  {
                    t: `Envío gratis +${formatCRC(config.freeShippingMinCents)}`,
                    icon: (
                      <>
                        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
                        <circle cx="7" cy="17" r="1.6" />
                        <circle cx="17" cy="17" r="1.6" />
                      </>
                    ),
                  },
                  {
                    t: 'Cambios 7 días',
                    icon: <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.6L4 16M4 20v-4h4" />,
                  },
                ].map((b) => (
                  <div key={b.t} className="border border-bone/10 px-2 py-3.5 flex flex-col items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-bone/70" fill="none" stroke="currentColor" strokeWidth="1.3">
                      {b.icon}
                    </svg>
                    <span className="text-[9px] uppercase tracking-wide text-stone leading-tight">{b.t}</span>
                  </div>
                ))}
              </div>

              {/* ACORDEONES (estilo Kith/FOG) */}
              <div className="mt-8 border-t border-bone/10">
                <Accordion title="Envío y pago">
                  Envío a todo Costa Rica. Tarifa plana de {formatCRC(config.shippingFlatCents)} y{' '}
                  <span className="text-bone">gratis</span> en compras desde{' '}
                  {formatCRC(config.freeShippingMinCents)}. Pago por SINPE Móvil con confirmación por
                  WhatsApp — tu pedido se prepara al confirmar el pago.
                </Accordion>
                <Accordion title="Composición y cuidados">
                  Algodón pesado de primera calidad. Lavar a máquina en frío con colores similares,
                  no usar blanqueador, secar a baja temperatura y planchar del revés. El print
                  varsity está hecho para durar — no plancharlo directamente.
                </Accordion>
                <Accordion title="Cambios y devoluciones">
                  Tienes 7 días desde la entrega para cambios. La prenda debe estar sin uso y con
                  etiquetas. Escríbenos por WhatsApp y coordinamos el cambio sin complicaciones.
                </Accordion>
              </div>
            </div>
          </div>
        </div>

        {/* VALORACIONES */}
        <ReviewsSection product={product} slug={slug} />

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

      {/* GUÍA DE TALLAS */}
      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

      {/* BARRA FIJA MÓVIL (añadir a la bolsa) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-coal/95 backdrop-blur border-t border-bone/10 px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 shrink">
          <p className="text-[11px] uppercase tracking-wide truncate">{product.name}</p>
          <p className="text-sm">{formatCRC(product.priceCents)}</p>
        </div>
        <button
          onClick={selected ? (canAdd ? handleAdd : undefined) : scrollToSizes}
          disabled={!!selected && !canAdd}
          className="btn-ink flex-1 py-3.5"
        >
          {selected ? (canAdd ? 'Añadir a la bolsa' : 'Agotado') : 'Elegir talla'}
        </button>
      </div>
    </div>
  );
}
