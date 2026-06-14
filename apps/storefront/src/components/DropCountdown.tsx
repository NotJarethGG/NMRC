import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Reveal } from './Reveal';
import { useT } from '../i18n';
import { DROP_DATE } from '../lib/brand';

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    total: ms,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    mins: Math.floor((ms / 60_000) % 60),
    secs: Math.floor((ms / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function DropCountdown() {
  const t = useT();
  const target = new Date(DROP_DATE).getTime();
  const [time, setTime] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setTime(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const live = time.total <= 0;
  const units: { value: number; label: string }[] = [
    { value: time.days, label: t('drop.days') },
    { value: time.hours, label: t('drop.hours') },
    { value: time.mins, label: t('drop.mins') },
    { value: time.secs, label: t('drop.secs') },
  ];

  const scrollToWaitlist = () =>
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative overflow-hidden bg-noir border-y border-bone/10">
      {/* glow sutil de fondo */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,232,221,0.06),transparent_70%)]" />
      <div className="relative max-w-editorial mx-auto px-5 md:px-10 py-20 md:py-28 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            <span className="eyebrow text-bone/60">{t('drop.label')}</span>
          </div>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-tight max-w-2xl mx-auto">
            {live ? t('drop.live') : t('drop.title')}
          </h2>
          <p className="text-stone max-w-md mx-auto mt-5">{t('drop.sub')}</p>

          {!live && (
            <div className="flex items-start justify-center gap-3 md:gap-6 mt-12">
              {units.map((u, i) => (
                <div key={u.label} className="flex items-start gap-3 md:gap-6">
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 md:w-24 h-16 md:h-24 border border-bone/15 bg-coal/60 backdrop-blur flex items-center justify-center overflow-hidden">
                      <motion.span
                        key={u.value}
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="font-display text-3xl md:text-5xl tabular-nums"
                      >
                        {pad(u.value)}
                      </motion.span>
                    </div>
                    <span className="mt-3 text-[10px] md:text-[11px] uppercase tracking-luxe text-stone">
                      {u.label}
                    </span>
                  </div>
                  {i < units.length - 1 && (
                    <span className="font-display text-2xl md:text-4xl text-bone/25 leading-[3.5rem] md:leading-[6rem]">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={scrollToWaitlist} className="btn-ink mt-12">
            {t('drop.cta')}
          </button>
        </Reveal>
      </div>
    </section>
  );
}
