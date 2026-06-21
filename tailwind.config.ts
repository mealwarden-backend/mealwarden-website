import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['var(--font-syne)', 'Syne', 'sans-serif'],
        jakarta: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        green: {
          dark:  '#052e16',
          brand: '#16a34a',
          mid:   '#22c55e',
          light: '#4ade80',
          pale:  '#f0fdf4',
          mist:  '#dcfce7',
          ring:  '#bbf7d0',
        },
      },
      maxWidth: {
        site: '1200px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        green: '0 20px 60px rgba(22,163,74,0.2)',
        'green-lg': '0 32px 80px rgba(22,163,74,0.3)',
        card: '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 28px 64px rgba(22,163,74,0.15)',
      },
    },
  },
  plugins: [],
}

export default config