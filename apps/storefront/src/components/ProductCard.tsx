import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../lib/types';
import { formatCRC } from '../lib/api';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const primary = product.images[0]?.url;
  const secondary = product.images[1]?.url ?? primary;
  const soldOut = product.variants.every((v) => v.stock <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.06 }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden bg-sand">
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
          {soldOut && (
            <span className="absolute top-3 left-3 bg-ink/80 text-bone text-[10px] uppercase tracking-luxe px-3 py-1">
              Agotado
            </span>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium leading-snug">{product.name}</h3>
            <p className="text-xs text-stone mt-1 uppercase tracking-wide">
              {product.category?.name}
            </p>
          </div>
          <span className="text-sm whitespace-nowrap">{formatCRC(product.priceCents)}</span>
        </div>
      </Link>
    </motion.div>
  );
}
