/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ha: {
          primary: '#03A9F4',
          'primary-dark': '#0288D1',
          'primary-light': '#B3E5FC',
          accent: '#FF9800',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FFC107',
          surface: '#FAFAFA',
          'surface-dark': '#121212',
          border: '#E0E0E0',
          'border-dark': '#2C2C2C',
        },
        esp: {
          primary: '#E8691D',
          'primary-dark': '#D15A0C',
          secondary: '#7E57C2',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'gradient-ha': "linear-gradient(135deg, #03A9F4 0%, #0288D1 100%)",
        'gradient-esp': "linear-gradient(135deg, #E8691D 0%, #FF9800 100%)",
        'grid-pattern': "linear-gradient(#E0E0E0 1px, transparent 1px), linear-gradient(90deg, #E0E0E0 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: '20px 20px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(3, 169, 244, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(3, 169, 244, 0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
}

