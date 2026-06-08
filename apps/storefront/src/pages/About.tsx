import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal } from '../components/Reveal';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const HERO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80';
const BLOCK = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80';

const PILLARS = [
  { n: '01', t: 'Streetwear', d: 'Cortes oversize, actitud sin límites. Para la calle, no para la pasarela.' },
  { n: '02', t: 'Gimnasio', d: 'Construido para el esfuerzo. Telas pesadas que aguantan el trabajo duro.' },
  { n: '03', t: 'Uso diario', d: 'Básicos que se ganan su lugar. Los usas hasta que se vuelven parte de ti.' },
  { n: '04', t: 'Equipos', d: 'Identidad compartida. Para los que entrenan juntos y no se rinden.' },
];

const COLORS = [
  { name: 'Negro', hex: '#0E0D0B' },
  { name: 'Blanco', hex: '#EDE8DD' },
  { name: 'Beige', hex: '#C9B79C' },
  { name: 'Gris', hex: '#5C574E' },
];

export function About() {
  useDocumentTitle('La Casa', 'NMRC — No Mercy. Streetwear sin concesiones. Est. 2026.');
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
            La Casa · Est. 2026
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
          <span className="eyebrow">Manifiesto</span>
          <p className="font-display text-3xl md:text-5xl leading-[1.15] mt-6">
            Una nueva era no empieza con ruido. Empieza con el trabajo callado, con la disciplina de
            repetir cuando nadie mira. Porque los momentos que se recuerdan se ganan, no se regalan.
          </p>
          <p className="text-stone leading-relaxed max-w-xl mx-auto mt-10">
            NMRC nace de una idea simple: sin concesiones. Ropa construida para quienes entrenan,
            crean y no piden permiso. Streetwear honesto, sin atajos, sin piedad con la mediocridad.
          </p>
        </Reveal>
      </section>

      {/* IMAGEN BLOQUE + EST */}
      <Reveal>
        <section className="relative h-[70vh] overflow-hidden bg-graphite">
          <img src={BLOCK} alt="NMRC training" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-noir/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="font-varsity text-[16vw] md:text-[11vw] leading-none uppercase text-bone/95">
                Est. 2026
              </p>
              <p className="font-condensed uppercase tracking-[0.4em] text-bone/70 text-sm md:text-base mt-2">
                Locking tf in
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* PILARES (IDEAL PARA) */}
      <section className="max-w-editorial mx-auto px-5 md:px-10 py-28 md:py-36">
        <Reveal className="mb-14">
          <span className="eyebrow">Ideal para</span>
          <h2 className="font-condensed text-4xl md:text-6xl uppercase tracking-wide mt-3">
            Hecho para el esfuerzo
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-bone/10 border border-bone/10">
          {PILLARS.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.08} className="bg-noir">
              <div className="p-8 md:p-10 h-full">
                <p className="font-varsity text-3xl text-bone/30">{p.n}</p>
                <h3 className="font-condensed text-2xl uppercase tracking-wide mt-4 mb-3">{p.t}</h3>
                <p className="text-sm text-stone leading-relaxed">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PALETA */}
      <section className="bg-coal border-y border-bone/10">
        <div className="max-w-editorial mx-auto px-5 md:px-10 py-24">
          <Reveal className="mb-10">
            <span className="eyebrow">Paleta</span>
            <h2 className="font-condensed text-3xl md:text-5xl uppercase tracking-wide mt-3">
              Cuatro tonos. Cero ruido.
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {COLORS.map((c, i) => (
              <Reveal key={c.name} delay={i * 0.07}>
                <div className="aspect-square border border-bone/10" style={{ background: c.hex }} />
                <p className="mt-3 text-[11px] uppercase tracking-luxe text-bone/80">{c.name}</p>
                <p className="text-[11px] text-stone">{c.hex}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <section className="py-28 md:py-40 text-center px-6">
        <Reveal>
          <p className="font-varsity text-5xl md:text-8xl uppercase leading-none">Sin concesiones</p>
          <p className="text-stone mt-6 mb-10 max-w-md mx-auto">
            La nueva era se construye con hierro y paciencia. Empieza por aquí.
          </p>
          <Link to="/shop" className="btn-ink">
            Comprar la colección
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
