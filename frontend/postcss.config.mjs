/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- Use this name as required by your new package versions
    'autoprefixer': {},        // <-- Recommended to keep this for browser compatibility
  },
}

export default config