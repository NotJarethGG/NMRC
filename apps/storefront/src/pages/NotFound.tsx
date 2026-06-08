import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFound() {
  useDocumentTitle('Página no encontrada');
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 pt-24">
      <p className="font-varsity text-[28vw] md:text-[16vw] leading-none uppercase text-bone/90">404</p>
      <p className="font-condensed uppercase tracking-[0.3em] text-stone -mt-2 md:-mt-6">
        Página no encontrada
      </p>
      <p className="text-stone max-w-sm mt-6 mb-10">
        La página que buscas no existe o fue movida. No te preocupes — la calle sigue ahí afuera.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="btn-ink">
          Volver al inicio
        </Link>
        <Link to="/shop" className="btn-outline border-bone/40 text-bone hover:bg-bone hover:text-noir">
          Ir a la tienda
        </Link>
      </div>
    </div>
  );
}
