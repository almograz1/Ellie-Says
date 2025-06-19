/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // important for toggling dark mode via class
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'shake-x': 'shakeX 0.6s ease-in-out',
      },
      keyframes: {
        shakeX: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
      },
    },
  },
};
