/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ClaimMate Brand Colors
        primary: { // Insurance Blue
          DEFAULT: '#1976D2', 
          50: '#E3F2FD',
          100: '#BBDEFB',
          200: '#90CAF9',
          300: '#64B5F6',
          400: '#42A5F5',
          500: '#1976D2', // Main
          600: '#1565C0',
          700: '#0D47A1',
          800: '#0A3D91',
          900: '#082F71',
        },
        secondary: { // เขียว-เขียวฟ้า (ใช้เป็นสีเสริมเพื่อความ "แปลกใหม่")
          DEFAULT: '#00BFA5', 
          50: '#E0F7F4',
          100: '#B2ECE4',
          200: '#80E0D3',
          300: '#4DD4C2',
          400: '#26CAB5',
          500: '#00BFA5', // Main
          600: '#00AB94',
          700: '#009180',
          800: '#00786C',
          900: '#005346',
        },
        neutral: {
          white: '#F9FAFB', // Cloud White
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          dark: '#333333', // Charcoal Grey (ตัวอักษรหลัก)
        },
        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        // ClaimMate Fonts
        sans: ['Poppins', 'Noto Sans Thai', 'system-ui', 'sans-serif'], // Primary font stack
        thai: ['Noto Sans Thai', 'system-ui', 'sans-serif'], // For explicit Thai text if needed
        en: ['Poppins', 'system-ui', 'sans-serif'], // For explicit English text if needed
      },
      boxShadow: { // เพิ่มเงาให้ดู "สวยงาม ดูมีอะไร"
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'button': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: { // ขอบมนสำหรับ "Friendly Design"
        'card': '12px',
        'button': '8px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: { // Animation เพื่อความ Fast & Responsive
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}