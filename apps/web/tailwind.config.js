/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        charcoal: {
          50:  '#F5F0E8',
          100: '#E8E2D8',
          200: '#C8C0B0',
          300: '#9A9A9E',
          400: '#6B6B72',
          500: '#5A5A60',
          600: '#3A3A3E',
          700: '#2E2E34',
          800: '#242428',
          900: '#1A1A1C',
          950: '#0E0E10',
        },
        copper: {
          100: '#F5D78A',
          200: '#EDBD65',
          300: '#E8A547',
          400: '#D4923A',
          500: '#C4892E',
          600: '#A87025',
        },
        navy: { 900: '#0E0E10' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'copper-gradient': 'linear-gradient(135deg, #E8A547, #F5D78A)',
        'blue-purple': 'linear-gradient(135deg, #3B82F6, #6366F1)',
        'hero-gradient': 'linear-gradient(to bottom, rgba(14,14,16,0) 0%, rgba(14,14,16,0.7) 60%, #0E0E10 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'shimmer': 'shimmer 1.8s linear infinite',
      },
      boxShadow: {
        'glow-copper': '0 0 40px rgba(232, 165, 71, 0.25)',
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
