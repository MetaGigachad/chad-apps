/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    {
      pattern: /grid-cols-.+/,
      variants: ["md"],
    }
  ],
  theme: {
    transitionDuration: {
      DEFAULT: "50ms",
    },
    extend: {
      colors: {
        zinc: {
          925: '#121215',
        },
      },
    },
  },
  plugins: [],
  darkMode: "selector",
}

