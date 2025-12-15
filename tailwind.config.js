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
        serif: ['Merriweather', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
      colors: {
        earth: {
          50: '#fcfaf8', 100: '#f5f0eb', 200: '#e8e0d5', 300: '#d6c4b0',
          400: '#bfa082', 500: '#a68059', 600: '#8a6645', 700: '#705036',
          800: '#5c412f', 900: '#4d3628',
        },
        leaf: {
          50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e', 600: '#16a34a',
          700: '#15803d', 800: '#166534', 900: '#14532d',
        },
        clay: {
          500: '#f59e0b', 600: '#d97706',
        },
        night: {
          50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 300: '#d6d3d1',
          400: '#a8a29e', 500: '#78716c', 600: '#57534e', 700: '#44403c',
          800: '#292524', 900: '#1c1917', 950: '#0c0a09',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(92, 65, 47, 0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}