import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../store/cart';
import { formatCRC } from '../lib/api';

export function CartDrawer() {
  const { isOpen, close, lines, remove, setQuantity, totalCents } = useCart();
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
            className="fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-paper text-ink flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between px-7 h-20 border-b border-ink/10">
              <span className="eyebrow">Tu bolsa</span>
              <button onClick={close} className="text-[11px] uppercase tracking-luxe link-underline">
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6">
              {lines.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone">
                  <p className="font-display text-2xl text-ink mb-2">Tu bolsa está vacía</p>
                  <p className="text-sm">Cada pieza es una declaración. Encuentra la tuya.</p>
                </div>
              ) : (
                <ul className="space-y-7">
                  {lines.map((l) => (
                    <li key={l.variantId} className="flex gap-4">
                      <div className="w-24 h-32 bg-sand overflow-hidden shrink-0">
                        {l.image && (
                          <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between gap-2">
                          <span className="text-sm font-medium leading-snug">{l.name}</span>
                          <span className="text-sm">{formatCRC(l.priceCents)}</span>
                        </div>
                        <span className="text-xs text-stone mt-1">Talla {l.size}</span>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-ink/15">
                            <button
                              className="w-8 h-8 text-stone hover:text-ink"
                              onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                            >
                              –
                            </button>
                            <span className="w-8 text-center text-sm">{l.quantity}</span>
                            <button
                              className="w-8 h-8 text-stone hover:text-ink"
                              onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="text-[11px] uppercase tracking-luxe text-stone hover:text-ink link-underline"
                            onClick={() => remove(l.variantId)}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="px-7 py-7 border-t border-ink/10">
                <div className="flex justify-between mb-5">
                  <span className="eyebrow">Subtotal</span>
                  <span className="text-lg">{formatCRC(totalCents())}</span>
                </div>
                <button onClick={goCheckout} className="btn-ink w-full">
                  Finalizar compra
                </button>
                <p className="text-[11px] text-stone text-center mt-3 tracking-wide">
                  Pago por SINPE Móvil · Confirmación por WhatsApp
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
