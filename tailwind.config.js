/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: ['var(--font-family-primary)'],
        secondary: ['var(--font-family-secondary)'],
      },
    },
  },
  plugins: [],
}