/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f4f4f6',
          dim: '#a0a0b0',
        },
        dimmed: '#64648a',
        'panel-bg': '#0a0a1a',
        'panel-surface': 'rgba(16, 16, 32, 0.85)',
        'panel-border': 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#818cf8',
          dim: '#6366f1',
          bright: '#a5b4fc',
        },
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
      },
      boxShadow: {
        glow: '0 0 20px rgba(99, 102, 241, 0.25)',
        glass: '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
