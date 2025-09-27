/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Cybersecurity Color Palette
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe', 
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',   // Primary cyber blue
          500: '#0ea5e9',   // Main cyber blue
          600: '#0284c7',   // Darker cyber blue
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // Professional Dark Theme
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',   // Medium dark
          700: '#334155',   // Card backgrounds
          800: '#1e293b',   // Primary dark
          900: '#0f172a',   // Deep dark background
          950: '#020617',   // Darkest
        },
        // Infopercept Professional Brand Colors
        infopercept: {
          primary: '#1e40af',     // Professional deep blue
          secondary: '#3b82f6',   // Bright blue accent
          accent: '#06b6d4',      // Cyan highlight
          dark: '#0f172a',        // Brand dark
          light: '#dbeafe',       // Light blue
        },
        // Security Status Colors (Industry Standard)
        security: {
          critical: '#ef4444',    // Bright red for critical
          high: '#f97316',        // Orange for high
          medium: '#eab308',      // Yellow for medium  
          low: '#22c55e',         // Green for low
          info: '#3b82f6',        // Blue for info
          success: '#10b981',     // Success green
        },
        // Matrix/Terminal Colors
        matrix: {
          green: '#00ff41',       // Classic matrix green
          darkGreen: '#16a34a',   // Professional green
          black: '#000000',       // Pure black
          darkGray: '#111827',    // Professional dark gray
        },
        // Professional Text Colors
        text: {
          primary: '#f8fafc',     // Primary white text
          secondary: '#e2e8f0',   // Secondary light text
          muted: '#94a3b8',       // Muted text
          accent: '#38bdf8',      // Accent text
        },
        // Professional Border Colors
        border: {
          primary: '#334155',     // Primary borders
          secondary: '#475569',   // Secondary borders
          accent: '#0ea5e9',      // Accent borders
          muted: '#1e293b',       // Subtle borders
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        // Professional Cybersecurity Gradients
        'gradient-cyber': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'gradient-cyber-light': 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        'gradient-matrix': 'linear-gradient(135deg, #000000 0%, #111827 50%, #1f2937 100%)',
        'gradient-security': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
        'gradient-infopercept': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'gradient-professional': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'gradient-card': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        'gradient-button': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        // Professional patterns
        'grid-pattern': 'radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)',
        'dot-pattern': 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 1px, transparent 1px)',
        'mesh-pattern': 'linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
        'dot': '16px 16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'cyber-pulse': 'cyberPulse 3s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
        cyberPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        // Professional Shadow System
        'cyber': '0 4px 20px rgba(59, 130, 246, 0.12)',
        'cyber-lg': '0 10px 40px rgba(59, 130, 246, 0.18)',
        'cyber-xl': '0 20px 60px rgba(59, 130, 246, 0.25)',
        'matrix': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 50px rgba(59, 130, 246, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(59, 130, 246, 0.08)',
        'professional': '0 4px 16px rgba(15, 23, 42, 0.4)',
        'card': '0 8px 32px rgba(15, 23, 42, 0.3)',
        'button': '0 4px 12px rgba(30, 64, 175, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} 