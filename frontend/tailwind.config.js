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
          700: '#1b253b', // premium slate border color for dark mode
          800: '#0b1329', // gorgeous rich dark navy-slate card & sidebar background
          900: '#040714', // gorgeous deep midnight-blue/black background
          950: '#020308', // ultimate pitch-black midnight
        },
        // Primary brand color — teal-emerald civic-tech
        primary: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Accent for highlights and gradients
        accent: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // Status colors
        success: '#16a34a',
        warning: '#d97706',
        danger:  '#dc2626',
        info:    '#0891b2',
        // Dark mode colors
        dark: {
          bg: '#040714',
          card: '#0b1329',
          border: '#1b253b',
          'text-main': '#f1f5f9',
          'text-muted': '#94a3b8',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glow-sm': '0 0 10px rgba(16, 185, 129, 0.15)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(148, 163, 184, 0.05)',
      },

      borderRadius: {
        DEFAULT: '0.75rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(1deg)' },
          '66%': { transform: 'translateY(6px) rotate(-1deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 4px rgba(16,185,129,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(16,185,129,0.5)' },
        },
      },
    },
  },
  plugins: [],
};
