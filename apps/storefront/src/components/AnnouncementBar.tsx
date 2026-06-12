import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';
import type { TKey } from '../i18n';

const KEYS: TKey[] = ['announce.1', 'announce.2', 'announce.3', 'announce.4'];

export function AnnouncementBar() {
  const t = useT();
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % KEYS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-9 bg-noir text-bone/80 border-b border-bone/10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center text-[10px] md:text-[11px] uppercase tracking-luxe text-center px-4 whitespace-nowrap"
        >
          {t(KEYS[i])}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
