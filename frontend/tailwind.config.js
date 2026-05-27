/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom premium midnight navy-slate gray scale for beautiful dark mode
        gray: {
          50: '#f8fafc',  // cool slate-white
          100: '#f1f5f9', // cool off-white
          200: '#e2e8f0', // cool light gray
          300: '#cbd5e1', // cool gray border
          400: '#94a3b8', // cool muted text
          500: '#64748b', // cool medium text
          600: '#475569', // cool dark text
          700: '#1b253b', // premium slate border color for dark mode (replaces dark:border-gray-700)
          800: '#0b1329', // gorgeous rich dark navy-slate card & sidebar background (replaces dark:bg-gray-800)
          900: '#040714', // gorgeous deep midnight-blue/black background (replaces dark:bg-gray-900)
          950: '#020308', // ultimate pitch-black midnight
        },
        // Primary brand color — government blue
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Status colors
        success: '#16a34a',
        warning: '#d97706',
        danger:  '#dc2626',
        info:    '#0891b2',
        // Dark mode colors
        dark: {
          bg: '#040714',         // deep midnight-blue
          card: '#0b1329',       // dark navy-slate
          border: '#1b253b',     // slate border
          'text-main': '#f1f5f9',
          'text-muted': '#94a3b8',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },

      borderRadius: {
        DEFAULT: '0.5rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
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
  plugins: [],
};
