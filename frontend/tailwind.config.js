/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black: '#070707',
        white: '#f4efe8',
        orange: { DEFAULT: '#ff4500', 2: '#ff7a38' },
        dim: '#141414',
        card: '#0f0f0f',
        border: '#1e1e1e',
        green: '#39e07a',
        red: '#ff3d5a',
        blue: '#4d9fff',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
