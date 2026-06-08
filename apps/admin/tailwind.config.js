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
        stone: '#6F6557',
        ink: '#141414',
        smoke: '#22201C',
        line: '#E6E1D6',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Graduate', 'Georgia', 'serif'],
        varsity: ['Graduate', 'Georgia', 'serif'],
      },
      letterSpacing: { luxe: '0.18em' },
    },
  },
  plugins: [],
};
