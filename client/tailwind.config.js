/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          DEFAULT: '#080e1a',
          card:    '#111827',
          raised:  '#162032',
          border:  '#1f2d42',
          hover:   '#1a2840',
        },
        accent: {
          cyan:   '#22d3ee',
          amber:  '#f59e0b',
          rose:   '#f43f5e',
          emerald:'#10b981',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.35s ease-out',
        'fade-up':      'fadeUp 0.45s ease-out',
        'fade-down':    'fadeDown 0.35s ease-out',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right':  'slideRight 0.35s ease-out',
        'scale-in':     'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':      'shimmer 1.8s infinite linear',
        'pulse-glow':   'pulseGlow 2.5s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
        'gradient-x':   'gradientX 4s ease infinite',
        'typewriter':   'typewriter 2.5s steps(30) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0)' },
          '50%':      { boxShadow: '0 0 28px 6px rgba(99,102,241,0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        gradientX: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        typewriter: {
          from: { width: '0' },
          to:   { width: '100%' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':    'linear-gradient(145deg, #080e1a 0%, #0f1729 40%, #111827 100%)',
        'card-gradient':    'linear-gradient(145deg, #111827, #080e1a)',
        'mesh-gradient':    'radial-gradient(at 40% 20%, hsla(240,90%,70%,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(260,80%,65%,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220,90%,60%,0.06) 0px, transparent 50%)',
        'glow-gradient':    'radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)',
        'border-gradient':  'linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5)',
        'btn-gradient':     'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
        'aurora':           'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(124,58,237,0.08), rgba(34,211,238,0.06))',
      },
      boxShadow: {
        'glow':        '0 0 24px rgba(99,102,241,0.35)',
        'glow-sm':     '0 0 12px rgba(99,102,241,0.25)',
        'glow-lg':     '0 0 48px rgba(99,102,241,0.4)',
        'glow-violet': '0 0 24px rgba(124,58,237,0.35)',
        'glow-cyan':   '0 0 20px rgba(34,211,238,0.3)',
        'card':        '0 4px 32px rgba(0,0,0,0.5)',
        'card-hover':  '0 12px 48px rgba(0,0,0,0.6)',
        'card-glow':   '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.06)',
        'inset-border':'inset 0 0 0 1px rgba(255,255,255,0.05)',
        'elevated':    '0 20px 60px rgba(0,0,0,0.7)',
      },
      dropShadow: {
        'glow':    ['0 0 8px rgba(99,102,241,0.6)', '0 0 20px rgba(99,102,241,0.3)'],
        'text':    ['0 2px 4px rgba(0,0,0,0.5)'],
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [],
}
