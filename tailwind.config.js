/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Lato', 'sans-serif'],
        display: ['Cinzel', 'serif'],
      },
      colors: {
        parchment: '#f5f0e8',
        ink: '#1a1209',
        gold: '#c9a84c',
        'gold-light': '#e8c87a',
        crimson: '#8b1a1a',
        'deep-blue': '#0d1b3e',
        'slate-warm': '#4a4035',
      },
    },
  },
  plugins: [],
}
