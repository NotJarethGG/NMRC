import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '../i18n';

// Medidas de la prenda en plano (cm), fit oversize NMRC
const ROWS: [string, number, number, number][] = [
  ['XS', 50, 66, 44],
  ['S', 53, 68, 46],
  ['M', 56, 71, 48],
  ['L', 59, 73, 50],
  ['XL', 62, 75, 52],
];

export function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-noir/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[71] inset-x-4 top-[14vh] max-w-md mx-auto bg-coal border border-bone/10 p-7"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label={t('guide.title')}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-2xl uppercase">{t('guide.title')}</h3>
              <button onClick={onClose} className="text-stone hover:text-bone text-sm" aria-label={t('nav.close')}>
                ✕
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-luxe text-stone border-b border-bone/10">
                  <th className="py-2 font-normal">{t('guide.size')}</th>
                  <th className="py-2 font-normal">{t('guide.chest')}</th>
                  <th className="py-2 font-normal">{t('guide.length')}</th>
                  <th className="py-2 font-normal">{t('guide.shoulders')}</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([size, chest, length, shoulders]) => (
                  <tr key={size} className="border-b border-bone/5 last:border-0">
                    <td className="py-2.5 font-medium">{size}</td>
                    <td className="py-2.5 text-stone">{chest} cm</td>
                    <td className="py-2.5 text-stone">{length} cm</td>
                    <td className="py-2.5 text-stone">{shoulders} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-5 text-[11px] text-stone leading-relaxed">{t('guide.note')}</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
