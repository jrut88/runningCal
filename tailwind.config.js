/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#16a34a',
        'brand-dark': '#15803d',
        'brand-light': '#dcfce7',
      },
    },
  },
  plugins: [],
};
