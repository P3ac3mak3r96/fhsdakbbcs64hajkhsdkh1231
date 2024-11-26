// tailwind.config.js
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          // Erweitern Sie hier die Farbpalette bei Bedarf
        },
        animation: {
          'spin-slow': 'spin 3s linear infinite',
        }
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }