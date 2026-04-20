import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: 'var(--cream)',
          soft: 'var(--cream-soft)',
          deep: 'var(--cream-deep)',
        },
        sand: {
          DEFAULT: 'var(--sand)',
          deep: 'var(--sand-deep)',
        },
        crimson: 'var(--crimson)',
        wine: 'var(--wine)',
        burgundy: 'var(--burgundy)',
        mint: 'var(--mint)',
        forest: 'var(--forest)',
        pine: 'var(--pine)',
        indigo: {
          DEFAULT: 'var(--indigo)',
        },
        midnight: 'var(--midnight)',
        paper: 'var(--paper)',
        white: 'var(--white)',
        ink: {
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          500: 'var(--ink-500)',
          400: 'var(--ink-400)',
          300: 'var(--ink-300)',
          200: 'var(--ink-200)',
          100: 'var(--ink-100)',
          50: 'var(--ink-050)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      fontFamily: {
        serif: ['Alice', 'serif'],
        sans: ['"Roboto Flex"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        dish: 'var(--dish-shadow)',
        card: 'var(--card-shadow)',
      },
      screens: {
        xs: '360px',
      },
    },
  },
  plugins: [],
} satisfies Config;
