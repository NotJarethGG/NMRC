import { apiBaseURL } from '../lib/api';

export function GoogleButton({ label = 'Continuar con Google' }: { label?: string }) {
  return (
    <>
      <div className="flex items-center gap-4 my-6">
        <span className="flex-1 h-px bg-bone/10" />
        <span className="text-[10px] uppercase tracking-luxe text-stone">o</span>
        <span className="flex-1 h-px bg-bone/10" />
      </div>
      <a
        href={`${apiBaseURL}/auth/google`}
        className="w-full h-12 border border-bone/30 text-bone hover:border-bone flex items-center justify-center gap-3 text-[11px] uppercase tracking-luxe transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
          <path
            fill="currentColor"
            d="M21.8 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6z"
          />
          <path
            fill="currentColor"
            opacity=".7"
            d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22z"
          />
          <path
            fill="currentColor"
            opacity=".5"
            d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3a10 10 0 0 0 0 9l3.4-2.6z"
          />
          <path
            fill="currentColor"
            opacity=".85"
            d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 4.6A10 10 0 0 0 3 7.5l3.4 2.6C7.2 7.8 9.4 6 12 6z"
          />
        </svg>
        {label}
      </a>
    </>
  );
}
