/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1800px',
      },
      colors: {
        'bp-white': '#FFFFFF',
        'bp-black': '#1E1E1E',
        'bp-dark': '#1E1E1E',
        'bp-medium': '#6B6B6B',
        'bp-light': '#E5E5E5',
        'bp-green': '#CADF44',
        'bp-bg': '#F4F4F4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Fraunces', 'serif'],
      },
    }
  },
  plugins: [],
}

