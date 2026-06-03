/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bone: '#F4F1EA',
        paper: '#FBFAF6',
        sand: '#E7E0D4',
        taupe: '#C9C1B4',
        clay: '#A89C8A',
        stone: '#6F6557',
        ink: '#141414',
        smoke: '#2A2723',
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
