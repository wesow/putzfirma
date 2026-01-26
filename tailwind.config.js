import tailwindAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Hier können wir später deine GlanzOps Farben fest definieren
    },
  },
  plugins: [
    tailwindAnimate, // Sauberer ESM Import
  ],
}