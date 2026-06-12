/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#121214',
        surface: '#09090b',
        'surface-2': '#24242e',
        'surface-3': '#2a2a35',
        border: '#1f1f23',
        accent: '#10b981',
        'accent-dim': '#059669',
        muted: '#52526b',
        foreground: '#ffffff',
        'foreground-2': '#94a3b8',
        destructive: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
