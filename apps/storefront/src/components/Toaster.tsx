import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../store/toast';

export function Toaster() {
  const toasts = useToast((s) => s.toasts);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-bone text-noir text-[12px] uppercase tracking-luxe shadow-lg flex items-center gap-3 overflow-hidden"
          >
            {t.image && <img src={t.image} alt="" className="w-11 h-12 object-cover shrink-0" />}
            <span className={t.image ? 'py-3 pr-5' : 'px-5 py-3'}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
