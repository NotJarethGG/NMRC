import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuickView } from '../store/quickview';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { useToast } from '../store/toast';
import { usePrice } from '../lib/currency';
import { cldUrl } from '../lib/img';
import { useT, useLocalize } from '../i18n';

export function QuickView() {
  const t = useT();
  const L = useLocalize();
  const price = usePrice();
  const product = useQuickView((s) => s.product);
  const close = useQuickView((s) => s.close);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const showToast = useToast((s) => s.show);
  const liked = useWishlist((s) => (product ? s.ids.includes(product.id) : false));
  const toggleWish = useWishlist((s) => s.toggle);

  const [selected, setSelected] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  // Reinicia el estado al abrir otro producto
  useEffect(() => {
    setSelected(null);
    setActiveImg(0);
  }, [product?.id]);

  // Cerrar con Escape + bloquear scroll del fondo
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, close]);

  if (!product) return null;

  const name = L.name(product);
  const variant = product.variants.find((v) => v.id === selected);
  const canAdd = variant && variant.stock > 0;

  const handleAdd = () => {
    if (!variant) return;
    add({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name,
      size: variant.size,
      priceCents: product.priceCents,
      image: product.images[0]?.url,
      quantity: 1,
      maxStock: variant.stock,
    });
    close();
    openCart();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] bg-noir/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          className="relative w-full max-w-3xl bg-coal border border-bone/10 max-h-[92vh] overflow-y-auto"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            aria-label={t('qv.close')}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-noir/60 text-bone flex items-center justify-center hover:bg-noir"
          >
            ✕
          </button>

          <div className="grid md:grid-cols-2">
            {/* GALERÍA */}
            <div className="bg-graphite">
              <div className="aspect-[3/4] overflow-hidden">
                {product.images[activeImg] && (
                  <motion.img
                    key={activeImg}
                    src={cldUrl(product.images[activeImg].url, 800)}
                    alt={name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 p-3">
                  {product.images.slice(0, 4).map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImg(i)}
                      className={`w-12 h-14 overflow-hidden transition-opacity ${
                        activeImg === i ? 'opacity-100 ring-1 ring-bone' : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={cldUrl(img.url, 120)} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="p-6 md:p-8 flex flex-col">
              <span className="eyebrow">{product.category?.name}</span>
              <h2 className="font-display text-2xl md:text-3xl mt-2 uppercase leading-tight">{name}</h2>
              <p className="text-lg mt-3">{price(product.priceCents)}</p>
              <p className="text-sm text-stone leading-relaxed mt-4 line-clamp-4">
                {L.description(product)}
              </p>

              {/* TALLAS */}
              <div className="mt-6">
                <span className="eyebrow block mb-3">{t('pdp.size')}</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const out = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        disabled={out}
                        onClick={() => setSelected(v.id)}
                        className={`min-w-[3rem] h-11 px-3 text-sm border transition-all ${
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

              <div className="mt-auto pt-8 space-y-3">
                <div className="flex gap-3">
                  <button onClick={handleAdd} disabled={!canAdd} className="btn-ink flex-1">
                    {selected ? (canAdd ? t('pdp.addToBag') : t('pdp.soldOut')) : t('pdp.selectSize')}
                  </button>
                  <button
                    onClick={() => {
                      toggleWish(product.id);
                      showToast(liked ? t('wish.removed') : t('wish.added'));
                    }}
                    aria-label={t('pdp.favorite')}
                    className={`w-12 h-12 border flex items-center justify-center transition-colors ${
                      liked ? 'border-bone bg-bone text-noir' : 'border-bone/30 text-bone hover:border-bone'
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.2 5c2 0 3.3 1.1 4.1 2.3l.7 1 .7-1C11.5 6.1 12.8 5 14.8 5 18 5 19.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
                    </svg>
                  </button>
                </div>
                <Link
                  to={`/product/${product.slug}`}
                  onClick={close}
                  className="block text-center text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
                >
                  {t('qv.viewDetails')} →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
