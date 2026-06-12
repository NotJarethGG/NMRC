/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  /** Colones por 1 USD (tasa de display). Default: 510 */
  readonly VITE_USD_RATE?: string;
  readonly VITE_HELLO_EMAIL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
