/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'midnight-ink': '#00052e',
        'arctic-mist': '#ffffff',
        'slate-shadow': '#6b6b83',
        'steel-gray': '#4f5166',
        'deep-blue-static': '#0428cb',
        'lagoon-spark': '#34fcff',
        'light-mauve-aura': '#afb4db',
        'platinum-mist': '#dbdcdf',
        'frost-gleam': '#e9e9f3',
        'dark-charcoal': '#222222',
      },
      backgroundImage: {
        'midnight-ink-radial': 'radial-gradient(circle, rgb(6, 16, 90), rgb(0, 5, 46) 79%)',
      },
      fontFamily: {
        f37: ['"DM Sans"', 'sans-serif'],
        sauce: ['"Inter"', 'sans-serif'],
        plex: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        'cards': '8px',
        'default': '4px',
      }
    },
  },
  plugins: [],
}