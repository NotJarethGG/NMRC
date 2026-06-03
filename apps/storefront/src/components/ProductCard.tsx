import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '../lib/types';
import { formatCRC } from '../lib/api';
import { useCart } from '../store/cart';

function isRecent(createdAt?: string) {
  if (!createdAt) return false;
  const days = (Date.now() - new Date(createdAt).getTime()) / 86_400_000;
  return days <= 21;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const [showSizes, setShowSizes] = useState(false);

  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url ?? primary;
  const soldOut = product.variants.every((v) => v.stock <= 0);
  const isNew = isRecent(product.createdAt);

  const quickAdd = (variantId: string, size: string, stock: number) => {
    add({
      productId: product.id,
      variantId,
      slug: product.slug,
      name: product.name,
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
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-luxe group-hover:opacity-0"
              />
              <img
                src={secondary}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover scale-105 opacity-0 transition-all duration-[1100ms] ease-luxe group-hover:opacity-100 group-hover:scale-100"
              />
            </>
          )}
        </Link>

        {/* BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {soldOut ? (
            <span className="bg-noir/85 text-bone text-[10px] uppercase tracking-luxe px-3 py-1">
              Agotado
            </span>
          ) : (
            <>
              {isNew && (
                <span className="bg-bone text-noir text-[10px] uppercase tracking-luxe px-3 py-1">
                  Nuevo
                </span>
              )}
              {product.featured && (
                <span className="bg-noir/85 text-bone text-[10px] uppercase tracking-luxe px-3 py-1 border border-bone/20">
                  Bestseller
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
                  Añadir rápido
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
            <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
            <p className="text-xs text-stone mt-1 uppercase tracking-wide">{product.category?.name}</p>
          </div>
          <span className="text-sm whitespace-nowrap">{formatCRC(product.priceCents)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
