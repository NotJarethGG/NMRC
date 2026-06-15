import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart';
import { useConfig, shippingFor } from '../hooks/useConfig';
import { usePrice } from '../lib/currency';
import { CartSuggestions } from './CartSuggestions';
import { useT } from '../i18n';

export function CartDrawer() {
  const t = useT();
  const price = usePrice();
  const { isOpen, close, lines, remove, setQuantity, totalCents } = useCart();
  const config = useConfig();
  const navigate = useNavigate();

  const goCheckout = () => {
    close();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          />
          <motion.aside
            className="fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-coal text-bone flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-7 h-20 border-b border-bone/10">
              <span className="eyebrow">{t('cart.title')}</span>
              <button onClick={close} className="text-[11px] uppercase tracking-luxe link-underline">
                {t('cart.close')}
              </button>
            </div>

            {lines.length > 0 &&
              (() => {
                const total = totalCents();
                const remaining = Math.max(0, config.freeShippingMinCents - total);
                const pct = Math.min(100, (total / config.freeShippingMinCents) * 100);
                return (
                  <div className="px-7 pt-5 pb-4 border-b border-bone/10">
                    <p className="text-[11px] uppercase tracking-wide text-center mb-2.5">
                      {remaining > 0 ? (
                        <>
                          {t('cart.freeShipRemaining1')}{' '}
                          <span className="text-clay">{price(remaining)}</span>{' '}
                          {t('cart.freeShipRemaining2')}
                        </>
                      ) : (
                        <span className="text-bone">{t('cart.freeShipUnlocked')}</span>
                      )}
                    </p>
                    <div className="h-1 bg-bone/15 overflow-hidden">
                      <motion.div
                        className="h-full bg-bone"
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                );
              })()}

            <div className="flex-1 overflow-y-auto px-7 py-6">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone">
                  <p className="font-display text-2xl text-bone mb-2 uppercase">{t('cart.empty')}</p>
                  <p className="text-sm">{t('cart.emptySub')}</p>
                </div>
              ) : (
                <ul className="space-y-7">
                  {lines.map((l) => (
                    <li key={l.variantId} className="flex gap-4">
                      <div className="w-24 h-32 bg-graphite overflow-hidden shrink-0">
                        {l.image && (
                          <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between gap-2">
                          <span className="text-sm font-medium leading-snug">{l.name}</span>
                          <span className="text-sm">{price(l.priceCents)}</span>
                        </div>
                        <span className="text-xs text-stone mt-1">{t('cart.size')} {l.size}</span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-bone/15">
                            <button
                              className="w-8 h-8 text-stone hover:text-bone"
                              onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                            >
                              –
                            </button>
                            <span className="w-8 text-center text-sm">{l.quantity}</span>
                            <button
                              className="w-8 h-8 text-stone hover:text-bone"
                              onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="text-[11px] uppercase tracking-luxe text-stone hover:text-bone link-underline"
                            onClick={() => remove(l.variantId)}
                          >
                            {t('cart.remove')}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {lines.length > 0 && <CartSuggestions />}
            </div>

            {lines.length > 0 &&
              (() => {
                const subtotal = totalCents();
                const shipping = shippingFor(subtotal, config);
                return (
                  <div className="px-7 py-6 border-t border-bone/10">
                    <div className="space-y-1.5 mb-4 text-sm">
                      <div className="flex justify-between text-stone">
                        <span>{t('cart.subtotal')}</span>
                        <span className="text-bone">{price(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-stone">
                        <span>{t('cart.shipping')}</span>
                        <span className="text-bone">
                          {shipping === 0 ? t('cart.free') : price(shipping)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-bone/10 mb-5">
                      <span className="eyebrow">{t('cart.total')}</span>
                      <span className="text-lg">{price(subtotal + shipping)}</span>
                    </div>
                    <button onClick={goCheckout} className="btn-ink w-full">
                      {t('cart.checkout')}
                    </button>
                    <p className="text-[11px] text-stone text-center mt-3 tracking-wide">
                      {t('cart.note')}
                    </p>
                  </div>
                );
              })()}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
