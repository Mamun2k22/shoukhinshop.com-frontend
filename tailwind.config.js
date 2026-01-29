/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'linear-gradient(to right, #D425FE, #7E15FC)', // primary gradient color
        },
        secondary: {
          DEFAULT: 'linear-gradient(to right, #3B82F6, #1D4ED8)', // secondary gradient color
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'], 
        quicksand: ['Quicksand', 'sans-serif'],
        arneFreytag: ['Arne Freytag', 'sans-serif'],
        omens: ['Omens', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
    // All default Tailwind screen sizes along with custom breakpoints
    screens: {
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      // Custom screen sizes
      'tablet': '640px', 
      'laptop': '1024px', 
      'desktop': '1280px',
    },
  },
  plugins: [require("tailgrids/plugin")],
}
