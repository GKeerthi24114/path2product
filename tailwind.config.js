/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      colors: {
        gray: {
          150: '#eaedf0',
        },
      },
    },
  },
  plugins: [],
}
