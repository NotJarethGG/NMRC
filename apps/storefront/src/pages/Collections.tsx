import { Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCatalog';
import { Reveal } from '../components/Reveal';
import { cldUrl } from '../lib/img';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useT } from '../i18n';

export function Collections() {
  const t = useT();
  useDocumentTitle(t('col.title'));
  const { data: collections } = useCollections();

  return (
    <div className="pt-28 md:pt-36">
      <div className="max-w-editorial mx-auto px-5 md:px-10">
        <header className="text-center mb-16">
          <span className="eyebrow">{t('col.eyebrow')}</span>
          <h1 className="font-display text-5xl md:text-7xl mt-4 uppercase">{t('col.title')}</h1>
        </header>
      </div>

      <div className="space-y-2">
        {collections?.map((c, i) => (
          <Reveal key={c.id}>
            <Link
              to={`/shop?collection=${c.slug}`}
              className="group relative block h-[70vh] overflow-hidden bg-graphite"
            >
              {c.heroImage && (
                <img
                  src={cldUrl(c.heroImage, 1400)}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-ink/30 group-hover:bg-ink/40 transition-colors duration-700" />
              <div
                className={`relative h-full flex flex-col items-center justify-center text-center text-bone px-6 ${
                  i % 2 ? 'md:items-end md:text-right md:pr-24' : 'md:items-start md:text-left md:pl-24'
                }`}
              >
                <span className="eyebrow text-bone/70">
                  {t('col.collection')} {String(i + 1).padStart(3, '0')}
                </span>
                <h2 className="font-display text-5xl md:text-7xl mt-3 mb-4 uppercase">{c.name}</h2>
                <p className="max-w-sm text-bone/80 text-sm leading-relaxed">{c.description}</p>
                <span className="mt-8 text-[11px] uppercase tracking-luxe link-underline">
                  {t('col.discover')}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
