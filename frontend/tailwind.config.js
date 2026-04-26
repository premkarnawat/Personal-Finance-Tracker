/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          1: '#f8f7ff',
          2: '#f1f0ff',
          3: '#e5e4f5',
        },
        ink: {
          primary:   '#1a1a2e',
          secondary: '#374151',
          tertiary:  '#94a3b8',
        },
        success: '#10b981',
        danger:  '#ef4444',
        warning: '#f59e0b',
        amber:   { 400: '#fbbf24' },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(124,58,237,0.06)',
        purple:  '0 4px 20px rgba(124,58,237,0.25)',
        nav:     '0 -2px 12px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
