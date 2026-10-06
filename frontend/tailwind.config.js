export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#080B12', card: '#10151F', border: '#202938',
        primary: '#22d3ee', accent: '#a855f7',
        ok: '#22c55e', warn: '#f59e0b', danger: '#ef4444'
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
};
