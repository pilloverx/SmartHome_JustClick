import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Home Assistant inspired colors
        ha: {
          primary: '#03A9F4',    // HA Blue
          'primary-dark': '#0288D1',
          'primary-light': '#B3E5FC',
          accent: '#FF9800',      // HA Orange accent
          success: '#4CAF50',     // Green
          error: '#F44336',       // Red
          warning: '#FFC107',     // Amber
          surface: '#FAFAFA',     // Light surface
          'surface-dark': '#121212', // Dark surface
          border: '#E0E0E0',      // Light border
          'border-dark': '#2C2C2C', // Dark border
        },
        // ESP colors
        esp: {
          primary: '#E8691D',     // ESP Orange
          'primary-dark': '#D15A0C',
          secondary: '#7E57C2',   // Purple
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Fira Code', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'gradient-ha': 'linear-gradient(135deg, #03A9F4 0%, #0288D1 100%)',
        'gradient-esp': 'linear-gradient(135deg, #E8691D 0%, #FF9800 100%)',
        'grid-pattern': 'linear-gradient(#E0E0E0 1px, transparent 1px), linear-gradient(90deg, #E0E0E0 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(3, 169, 244, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(3, 169, 244, 0)' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [],
}
export default config
