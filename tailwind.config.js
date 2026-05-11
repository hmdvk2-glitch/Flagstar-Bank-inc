/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flagstar: {
          red: '#C8102E',
        }
      }
    },
  },
  plugins: [],
}
