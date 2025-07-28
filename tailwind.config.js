/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from visual-design.md
        primary: {
          DEFAULT: '#1a1a1a',
          dark: '#000000',
        },
        white: '#ffffff',
        gray: {
          medium: '#6b7280',
          light: '#f3f4f6',
          'very-light': '#fafafa',
          dark: '#374151',
        },
        border: '#e5e7eb',
        // Semantic colors
        success: {
          DEFAULT: '#10b981',
          light: '#d1fae5',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#fee2e2',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fef3c7',
          dark: '#d97706',
        },
        info: {
          DEFAULT: '#3b82f6',
          light: '#dbeafe',
          dark: '#2563eb',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ],
      },
      fontSize: {
        'base': '16px',
        'large': '20px',
        'small': '14px',
        '2xl': '2rem',
        'xl': '1.5rem',
        'lg': '1.25rem',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      transitionDuration: {
        'fast': '200ms',
        'normal': '300ms',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'large': '0 8px 25px rgba(0, 0, 0, 0.1)',
      },
      maxWidth: {
        'content': '1200px',
      },
      width: {
        'sidebar': '240px',
      },
      height: {
        'header': '64px',
      },
    },
  },
  plugins: [],
} 