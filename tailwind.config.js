/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        numberIn: {
          '0%': { transform: 'translateY(100%) scale(0.5)', opacity: 0 },
          '70%': { transform: 'translateY(-20%) scale(1.1)' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: 1 }
        },
        numberOut: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '30%': { transform: 'translateY(20%) scale(0.9)' },
          '100%': { transform: 'translateY(-100%) scale(0.5)', opacity: 0 }
        }
      },
      animation: {
        numberIn: 'numberIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        numberOut: 'numberOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }
    },
  },
  plugins: [],
};
