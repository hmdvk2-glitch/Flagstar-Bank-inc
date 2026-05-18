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
          teal: '#004B5C',
          tealDark: '#003E4C',
          slate: '#002D38',
          orange: '#F15A24',
          yellow: '#FFB81C',
          green: '#84BD00',
          bg: '#F8FAFC'
        },
        'orange-flagstar': '#F15A24',
        'yellow-flagstar': '#FFB81C',
      }
    },
  },
  plugins: [],
}
