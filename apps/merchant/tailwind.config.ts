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
        ink: '#12231F',
        canvas: '#F7F4EC',
        teal: '#0B4F4A',
        tealDeep: '#083A36',
        marigold: '#E8A33D',
        brick: '#C1502E',
        line: '#E4DFCF',
        success: '#2E7D4F',
        danger: '#C1502E',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
