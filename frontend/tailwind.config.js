/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#03DAC6', // Teal Mint
        'primary-light': '#66F2E8', // Lighter Teal Mint
        'primary-dark': '#00B8A9', // Darker Teal Mint
        secondary: '#03DAC6', // Teal Mint
        'secondary-light': '#66F2E8', // Lighter Teal Mint
        'secondary-dark': '#00B8A9', // Darker Teal Mint
        accent: '#03DAC6', // Teal Mint
        background: '#121212', // Charcoal Black
        'background-light': '#1E1E1E', // Lighter Charcoal
        surface: '#1E1E1E', // Lighter Charcoal
        'surface-light': '#2D2D2D', // Even Lighter Charcoal
        border: '#2D2D2D', // Even Lighter Charcoal
        'text-primary': '#F5F5F5', // Off-white
        'text-secondary': '#B0B0B0', // Light Gray
        'text-muted': '#808080', // Medium Gray
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 