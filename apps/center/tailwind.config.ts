import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    '../../packages/ui/components/**/*.{ts,tsx}',
    '../../packages/ui/index.ts',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        secondary: '#F97316',
      },
    },
  },
  plugins: [],
};

export default config;