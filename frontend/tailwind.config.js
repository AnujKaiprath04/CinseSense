/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          40: '#f59e0b',
          500: '#f59e0b', // Warm Amber Accent
          600: '#d97706',
          700: '#b45309',
        },
        tealAccent: {
          500: '#14b8a6', // Electric Teal
          600: '#0d9488',
        },
        darkBg: '#090d16',
        darkCard: '#131b2e',
        darkHover: '#1c2842'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
