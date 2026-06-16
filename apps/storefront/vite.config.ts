import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Separa librerías pesadas en chunks propios → mejor caché + carga inicial menor.
        // Los SDKs de pago solo se descargan al llegar al checkout (vía React.lazy).
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          'vendor-paypal': ['@paypal/react-paypal-js'],
        },
      },
    },
  },
});
