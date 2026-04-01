/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        tier: {
          S: '#e11d48',
          A: '#ea580c',
          B: '#ca8a04',
          C: '#65a30d',
          D: '#0891b2',
          F: '#6b7280',
        },
      },
    },
  },
  plugins: [],
}
