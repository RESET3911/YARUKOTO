export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        surface: {
          50:  '#1a1a2a',
          100: '#13131f',
          200: '#0e0e18',
          300: '#0a0a0f',
        },
      }
    }
  },
  plugins: [],
}
