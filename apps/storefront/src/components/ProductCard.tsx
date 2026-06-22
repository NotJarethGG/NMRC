import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '../lib/types';
import { usePrice } from '../lib/currency';
import { cldUrl } from '../lib/img';
import { useCart } from '../store/cart';
import { useWishlist } from '../store/wishlist';
import { useToast } from '../store/toast';
import { useQuickView } from '../store/quickview';
import { useT, useLocalize } from '../i18n';

export function HeartButton({ productId, className = '' }: { productId: string; className?: string }) {
  const t = useT();
  const liked = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const showToast = useToast((s) => s.show);
  return (
    <button
      aria-label={t('nav.wishlist')}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
        showToast(liked ? t('wish.removed') : t('wish.added'));
      }}
      className={`w-9 h-9 flex items-center justify-center rounded-full bg-noir/55 backdrop-blur text-bone transition-colors hover:bg-noir/80 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-[18px] h-[18px]"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 21s-7.5-4.6-10-9.2C.4 8.4 2 5 5.2 5c2 0 3.3 1.1 4.1 2.3l.7 1 .7-1C11.5 6.1 12.8 5 14.8 5 18 5 19.6 8.4 22 11.8 19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  );
}

function isRecent(createdAt?: string) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 21;
}

export function ProductCard({
  product,
  index = 0,
  rank,
}: {
  product: Product;
  index?: number;
  rank?: number;
}) {
  const t = useT();
  const price = usePrice();
  const L = useLocalize();
  const add = useCart((s) => s.add);
  const openQuickView = useQuickView((s) => s.open);
  const [showSizes, setShowSizes] = useState(false);

  const name = L.name(product);
  const primary = cldUrl(product.images[0]?.url, 600);
  const secondary = cldUrl(product.images[1]?.url ?? product.images[0]?.url, 600);
  const soldOut = product.variants.every((v) => v.stock <= 0);
  const isNew = isRecent(product.createdAt);
  const onSale = !!product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents;
  const discountPct = onSale
    ? Math.round((1 - product.priceCents / (product.compareAtPriceCents as number)) * 100)
    : 0;

  const quickAdd = (variantId: string, size: string, stock: number) => {
    add({
      productId: product.id,
      variantId,
      slug: product.slug,
      name,
      size,
      priceCents: product.priceCents,
      image: primary,
      quantity: 1,
      maxStock: stock,
    });
    setShowSizes(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.06 }}
      onMouseLeave={() => setShowSizes(false)}
      className="group"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-graphite">
        <Link to={`/product/${product.slug}`} className="absolute inset-0">
          {primary && (
            <>
              <img
                src={primary}
                alt={name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-luxe group-hover:opacity-0"
              />
              <img
                src={secondary}
                alt={name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover scale-105 opacity-0 transition-all duration-[1100ms] ease-luxe group-hover:opacity-100 group-hover:scale-100"
              />
            </>
          )}
        </Link>

        {/* FAVORITO + VISTA RÁPIDA */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <HeartButton productId={product.id} />
          {!soldOut && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openQuickView(product);
              }}
              aria-label={t('card.quickView')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-noir/55 backdrop-blur text-bone transition-all hover:bg-noir/80 md:opacity-0 md:group-hover:opacity-100"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        </div>

        {/* BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {rank !== undefined && (
            <span className="bg-noir text-bone text-[11px] font-display w-7 h-7 flex items-center justify-center">
              {rank}
            </span>
          )}
          {soldOut ? (
            <span className="bg-noir/85 text-bone text-[10px] uppercase tracking-luxe px-3 py-1">
              {t('badge.soldOut')}
            </span>
          ) : (
            <>
              {onSale && (
                <span className="bg-clay text-noir text-[10px] uppercase tracking-luxe px-3 py-1 font-medium">
                  −{discountPct}%
                </span>
              )}
              {isNew && (
                <span className="bg-bone text-noir text-[10px] uppercase tracking-luxe px-3 py-1">
                  {t('badge.new')}
                </span>
              )}
              {product.featured && !onSale && (
                <span className="bg-noir/85 text-bone text-[10px] uppercase tracking-luxe px-3 py-1 border border-bone/20">
                  {t('badge.bestseller')}
                </span>
              )}
            </>
          )}
        </div>

        {/* QUICK ADD (desktop) */}
        {!soldOut && (
          <div className="absolute inset-x-0 bottom-0 p-3 hidden md:block opacity-0 translate-y-3 transition-all duration-500 ease-luxe group-hover:opacity-100 group-hover:translate-y-0">
            <AnimatePresence mode="wait" initial={false}>
              {!showSizes ? (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowSizes(true)}
                  className="w-full bg-bone/95 text-noir text-[11px] uppercase tracking-luxe py-3 backdrop-blur hover:bg-bone"
                >
                  {t('card.quickAdd')}
                </motion.button>
              ) : (
                <motion.div
                  key="sizes"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-noir/85 backdrop-blur p-2 flex flex-wrap gap-1.5 justify-center"
                >
                  {product.variants.map((v) => {
                    const out = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        disabled={out}
                        onClick={() => quickAdd(v.id, v.size, v.stock)}
                        className={`min-w-[2.4rem] h-9 px-2 text-[12px] border transition-colors ${
                          out
                            ? 'border-bone/10 text-bone/25 line-through cursor-not-allowed'
                            : 'border-bone/30 text-bone hover:bg-bone hover:text-noir'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Link to={`/product/${product.slug}`} className="block mt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium leading-snug">{name}</h3>
            <p className="text-xs text-stone mt-1 uppercase tracking-wide">{product.category?.name}</p>
          </div>
          {onSale ? (
            <span className="flex flex-col items-end leading-tight">
              <span className="text-sm whitespace-nowrap text-clay">{price(product.priceCents)}</span>
              <span className="text-[11px] whitespace-nowrap text-stone line-through">
                {price(product.compareAtPriceCents as number)}
              </span>
            </span>
          ) : (
            <span className="text-sm whitespace-nowrap">{price(product.priceCents)}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
