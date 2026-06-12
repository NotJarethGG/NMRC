import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal } from '../components/Reveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';

const HERO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80';
const BLOCK = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80';

const COLOR_HEX = ['#0E0D0B', '#EDE8DD', '#C9B79C', '#5C574E'];

export function About() {
  const t = useT();
  useDocumentTitle(t('nav.about'), 'NMRC — No Mercy. Premium streetwear. Limited drops.');

  const PILLARS = [
    { n: '01', title: t('about.p1.title'), body: t('about.p1.body') },
    { n: '02', title: t('about.p2.title'), body: t('about.p2.body') },
    { n: '03', title: t('about.p3.title'), body: t('about.p3.body') },
    { n: '04', title: t('about.p4.title'), body: t('about.p4.body') },
  ];
  const COLORS = [t('about.black'), t('about.white'), t('about.beige'), t('about.grey')];

  return (
    <div className="pt-9">
      {/* HERO */}
      <section className="relative h-[88svh] w-full overflow-hidden flex items-center justify-center">
        <motion.img
          src={HERO}
          alt="NMRC"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-noir/75" />
        <div className="relative text-center px-6">
          <motion.p
            className="text-[11px] uppercase tracking-wide2 text-bone/60 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {t('about.eyebrow')}
          </motion.p>
          <motion.h1
            className="font-varsity text-[22vw] md:text-[15vw] leading-[0.82] uppercase tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            NMRC
          </motion.h1>
          <motion.p
            className="font-condensed text-2xl md:text-4xl uppercase tracking-[0.35em] text-bone/90 mt-2 md:mt-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            No Mercy
          </motion.p>
        </div>
      </section>

      {/* MANIFIESTO */}
      <section className="max-w-4xl mx-auto px-5 md:px-10 py-28 md:py-40 text-center">
        <Reveal>
          <span className="eyebrow">{t('about.manifestoEyebrow')}</span>
          <p className="font-display text-3xl md:text-5xl leading-[1.15] mt-6 uppercase">
            {t('about.manifesto')}
          </p>
          <p className="font-condensed text-xl md:text-2xl uppercase tracking-[0.3em] text-bone/80 mt-10">
            No excuses. No limits. No Mercy.
          </p>
          <p className="text-stone leading-relaxed max-w-xl mx-auto mt-10">
            {t('about.manifestoSub')}
          </p>
        </Reveal>
      </section>

      {/* IMAGEN BLOQUE + EST */}
      <Reveal>
        <section className="relative h-[70vh] overflow-hidden bg-graphite">
          <img src={BLOCK} alt="NMRC training" loading="lazy" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-noir/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-varsity text-[16vw] md:text-[11vw] leading-none uppercase text-bone/95">
                Est. 2026
              </p>
              <p className="font-condensed uppercase tracking-[0.4em] text-bone/70 text-sm md:text-base mt-2">
                {t('about.lockIn')}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* PILARES */}
      <section className="max-w-editorial mx-auto px-5 md:px-10 py-28 md:py-36">
        <Reveal className="mb-14">
          <span className="eyebrow">{t('about.idealFor')}</span>
          <h2 className="font-condensed text-4xl md:text-6xl uppercase tracking-wide mt-3">
            {t('about.builtForEffort')}
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-bone/10 border border-bone/10">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08} className="bg-noir">
              <div className="p-8 md:p-10 h-full">
                <p className="font-varsity text-3xl text-bone/30">{p.n}</p>
                <h3 className="font-condensed text-2xl uppercase tracking-wide mt-4 mb-3">{p.title}</h3>
                <p className="text-sm text-stone leading-relaxed">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PALETA */}
      <section className="bg-coal border-y border-bone/10">
        <div className="max-w-editorial mx-auto px-5 md:px-10 py-24">
          <Reveal className="mb-10">
            <span className="eyebrow">{t('about.palette')}</span>
            <h2 className="font-condensed text-3xl md:text-5xl uppercase tracking-wide mt-3">
              {t('about.paletteTitle')}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {COLORS.map((name, i) => (
              <Reveal key={name} delay={i * 0.07}>
                <div className="aspect-square border border-bone/10" style={{ background: COLOR_HEX[i] }} />
                <p className="mt-3 text-[11px] uppercase tracking-luxe text-bone/80">{name}</p>
                <p className="text-[11px] text-stone">{COLOR_HEX[i]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="py-28 md:py-40 text-center px-6">
        <Reveal>
          <p className="font-varsity text-4xl md:text-7xl uppercase leading-none">{t('about.closing')}</p>
          <p className="text-stone mt-6 mb-10 max-w-md mx-auto">{t('about.closingSub')}</p>
          <Link to="/shop" className="btn-ink">
            {t('about.shopCollection')}
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
