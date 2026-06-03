/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Texto / superficies claras (crema)
        bone: '#EDE8DD',
        paper: '#F4F1EA',
        sand: '#E7E0D4',
        taupe: '#B8AE9C',
        clay: '#9A8E79',
        stone: '#8C8576',
        // Fondos oscuros (tema noir cálido)
        noir: '#0B0B0A',
        coal: '#131210',
        graphite: '#1C1A16',
        ink: '#0E0D0B',
        smoke: '#17150F',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        luxe: '0.22em',
        wide2: '0.32em',
      },
      maxWidth: {
        editorial: '1600px',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
