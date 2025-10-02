/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          900: "#000000",
          800: "#0b0b0c",
        },
        grayp: {
          600: "#66666e",
          500: "#9999a1",
          200: "#e6e6e9",
          100: "#f4f4f6",
        }
      }
    },
  },
  plugins: [],
}