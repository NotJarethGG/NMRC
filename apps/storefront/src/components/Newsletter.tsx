import { useState } from 'react';
import { Reveal } from './Reveal';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setDone(true);
  };

  return (
    <section className="bg-graphite border-y border-bone/10">
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-24 md:py-32 text-center">
        <Reveal>
          <span className="eyebrow">Lista privada</span>
          <h2 className="font-display text-4xl md:text-6xl mt-4 mb-5 leading-tight">
            Acceso anticipado a cada drop
          </h2>
          <p className="text-stone max-w-md mx-auto mb-10">
            Suscríbete y entérate primero de los lanzamientos en edición limitada. Sin ruido, solo lo
            esencial.
          </p>

          {done ? (
            <p className="text-bone text-lg">Listo — ya eres parte de la lista. Nos vemos en el próximo drop.</p>
          ) : (
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field text-center sm:text-left flex-1"
              />
              <button type="submit" className="btn-ink whitespace-nowrap">
                Suscribirme
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
