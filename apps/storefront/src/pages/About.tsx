import { Reveal } from '../components/Reveal';

const IMG =
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1800&q=80';

export function About() {
  return (
    <div className="pt-28 md:pt-36">
      <div className="max-w-3xl mx-auto px-5 md:px-10 text-center">
        <span className="eyebrow">La Casa</span>
        <h1 className="font-display text-5xl md:text-7xl mt-4 mb-8">GosthShop</h1>
        <Reveal>
          <p className="text-lg md:text-xl text-stone leading-relaxed">
            Nacimos de una convicción: que la ropa puede ser un acto de presencia silenciosa.
            GosthShop existe en el espacio entre lo casual y lo ceremonial, entre lo que se ve y lo
            que se siente.
          </p>
        </Reveal>
      </div>

      <Reveal className="mt-20">
        <div className="relative h-[60vh] overflow-hidden bg-sand">
          <img src={IMG} alt="GosthShop" className="w-full h-full object-cover" />
        </div>
      </Reveal>

      <div className="max-w-3xl mx-auto px-5 md:px-10 py-28">
        <div className="grid md:grid-cols-3 gap-12 text-center">
          {[
            { t: 'Edición limitada', d: 'Números contados. Cada drop es irrepetible.' },
            { t: 'Materiales nobles', d: 'Lanas, algodones pesados y tejidos seleccionados a mano.' },
            { t: 'Hecho con intención', d: 'Diseño pausado, construcción honesta, durabilidad real.' },
          ].map((b, i) => (
            <Reveal key={b.t} delay={i * 0.1}>
              <h3 className="font-display text-2xl mb-3">{b.t}</h3>
              <p className="text-sm text-stone leading-relaxed">{b.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
