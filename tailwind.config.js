/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hedera: {
          purple: '#6A11CB',
          blue: '#2575FC',
        }
      },
      backgroundImage: {
        'gradient-hedera': 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      }
    },
  },
  plugins: [],
}