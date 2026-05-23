/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': '#06070A',
        'surface': '#0A0B0E',
        'elevated': '#181C25',
        'accent': '#F36C00',
        'accent-2': '#FF8A3D',
        'txt': '#FFFFFF',
        'txt-2': '#6B7280',
        'txt-3': '#4B5563',
        'border': '#1F2530',
        'win': '#10B981',
        'loss': '#EF4444',
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
