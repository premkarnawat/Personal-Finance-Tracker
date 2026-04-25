/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gold: {
          400: '#f5c842',
          500: '#d4a843',
          600: '#b8902a',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          0: '#ffffff',
          1: '#f8fafc',
          2: '#f1f5f9',
          3: '#e2e8f0',
        },
        dark: {
          0: '#0f1117',
          1: '#161b27',
          2: '#1e2535',
          3: '#252d40',
          4: '#2e384f',
          border: '#2e384f',
        },
        ink: {
          primary: '#0f172a',
          secondary: '#475569',
          tertiary: '#94a3b8',
        },
        'ink-dark': {
          primary: '#f1f5f9',
          secondary: '#94a3b8',
          tertiary: '#475569',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.04), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'card-dark': '0 4px 20px 0 rgba(0,0,0,0.3)',
        'elevated': '0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'glow-gold': '0 0 20px rgba(212, 168, 67, 0.2)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.15)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-balance': 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #1a1040 100%)',
        'gradient-gold': 'linear-gradient(135deg, #d4a843 0%, #f5c842 100%)',
      }
    },
  },
  plugins: [],
}
