import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    '../../packages/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Velnox brand — เขียวเข้ม + เขียวมิ้นต์
        primary: {
          DEFAULT: '#0D9488', // teal-600
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          DEFAULT: '#5EEAD4',
          soft: '#CCFBF1',
        },
        secondary: '#0F766E',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(13, 148, 136, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
