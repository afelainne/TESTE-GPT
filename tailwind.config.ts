import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Monaco', 'Menlo', 'monospace'],
      },
      spacing: {
        '0.5': '0.125rem',
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem',
        '128': '32rem',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px)',
        'subtle-grid': 'linear-gradient(90deg, #f5f5f5 1px, transparent 1px), linear-gradient(#f5f5f5 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '24px 24px',
        'subtle': '12px 12px',
      },
      borderRadius: {
        none: '0',
      },
      colors: {
        swiss: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            100: '#F8F8F8',
            200: '#F0F0F0',
            300: '#E8E8E8',
            400: '#CCCCCC',
            500: '#999999',
            600: '#666666',
            700: '#333333',
            800: '#1A1A1A',
          }
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      boxShadow: {
        'none': 'none',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'clean': '0 1px 1px rgba(0, 0, 0, 0.1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'grid-appear': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'grid-appear': 'grid-appear 0.8s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      lineHeight: {
        'tight': '1.1',
        'snug': '1.2',
        'normal': '1.4',
        'relaxed': '1.6',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;