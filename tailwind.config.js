/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'var(--bg)',
        'surface': 'var(--surface)',
        'elevated': 'var(--elevated)',
        'accent': 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        'txt': 'var(--txt)',
        'txt-2': 'var(--txt-2)',
        'txt-3': 'var(--txt-3)',
        'border': 'var(--border)',
        'win': 'var(--win)',
        'loss': 'var(--loss)',
      },
      fontFamily: {
        'sans': ['"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulseDot 2s infinite',
        'float': 'floaty 6s ease-in-out infinite',
      },
      backgroundImage: {
        'grad-radial': 'radial-gradient(circle at 50% 50%, var(--tw-gradient-from), var(--tw-gradient-to))',
      }
    },
  },
  plugins: [],
}
