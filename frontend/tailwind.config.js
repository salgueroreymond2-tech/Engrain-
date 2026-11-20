/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          DEFAULT: '#111318',
          950: '#0B0C10',
          900: '#111318',
          800: '#181B22',
        },
        graphite: {
          DEFAULT: '#242830',
          800: '#1F2229',
          700: '#242830',
          600: '#323743',
          500: '#474D5E',
          400: '#646B80',
        },
        brand: {
          DEFAULT: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        platinum: {
          DEFAULT: '#F4F5F7',
          50: '#FFFFFF',
          100: '#FAFAFB',
          200: '#F4F5F7',
          300: '#E5E7EB',
          400: '#D1D5DB',
        },
        trust: {
          DEFAULT: '#16A34A',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'automotive': '0 4px 20px -2px rgba(17, 19, 24, 0.45)',
        'automotive-lg': '0 10px 30px -4px rgba(17, 19, 24, 0.6)',
        'orange-glow': '0 0 25px -5px rgba(249, 115, 22, 0.3)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px -1px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
