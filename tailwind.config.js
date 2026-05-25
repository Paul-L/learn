/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        bone: '#F8F5F0',
        paper: '#FFFFFF',
        ink: '#1F1A14',
        muted: '#6B645A',
        line: '#E8E2D7',
        softline: '#EFEAE0',
        accent: '#C76F4B',
        accent2: '#A85838',
        accentTint: '#FBEEE5',
        sage: '#6B9B6E',
        sageTint: '#E7EFE2',
        coral: '#D4796B',
        coralTint: '#FAE4DF',
      },
      boxShadow: {
        card: '0 1px 2px rgba(31,26,20,0.04), 0 6px 24px -12px rgba(31,26,20,0.10)',
        phone: '0 30px 80px -20px rgba(31,26,20,0.30), 0 8px 24px -10px rgba(31,26,20,0.20)',
      },
      borderRadius: {
        phone: '46px',
      },
    },
  },
  plugins: [],
};
