/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        panel: 'rgb(var(--color-panel) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        coral: 'rgb(var(--color-coral) / <alpha-value>)',
        mint: 'rgb(var(--color-mint) / <alpha-value>)',
      },
      boxShadow: {
        glass: 'var(--shadow-glass)',
        soft: 'var(--shadow-soft)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-light':
          'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 247, 1) 42%, rgba(224, 233, 246, 0.92) 100%)',
        'mesh-dark':
          'radial-gradient(circle at 50% 12%, rgba(0, 86, 179, 0.22), transparent 34%), linear-gradient(135deg, rgba(16, 19, 26, 0.98), rgba(24, 30, 40, 0.96))',
      },
    },
  },
  plugins: [],
}
