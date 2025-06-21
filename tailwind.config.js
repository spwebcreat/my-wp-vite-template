/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './development/themes/mythme/*.php',
    './development/themes/mythme/template-parts/**/*.php',
    './development/themes/mythme/inc/**/*.php',
    './development/themes/mythme/templates/**/*.php',
    './development/src/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#eff6ff',
          500: '#3b82f6', 
          600: '#2563eb',
          700: '#1d4ed8',
        },
        'secondary': {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        'serif': ['Noto Serif JP', 'serif'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}