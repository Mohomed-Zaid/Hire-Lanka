/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#edfcf5",
          100: "#d4f7e5",
          200: "#aceed0",
          300: "#76dfb4",
          400: "#3ec995",
          500: "#1aad7a",
          600: "#0d8d63",
          700: "#0b7152",
          800: "#0c5a43",
          900: "#0b4a38",
          950: "#042921",
        },
        accent: {
          50: "#effefb",
          100: "#c8fff4",
          200: "#91ffea",
          300: "#53f5dc",
          400: "#20decb",
          500: "#08c4b5",
          600: "#039e96",
        },
        success: {
          50: "#ecfdf5",
          500: "#10b981",
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 16px -2px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(26, 173, 122, 0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
