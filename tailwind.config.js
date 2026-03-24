/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './App.tsx', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        zinc: {
          850: '#1f2024',
          900: '#18181b',
          950: '#09090b',
        },
        red: {
          900: '#450a0a',
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-sm': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        400: '400ms',
      },
    },
  },
  plugins: [],
};
