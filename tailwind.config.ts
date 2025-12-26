import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1200px",
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Core semantic colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Component colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Arcade base colors
        void: "hsl(var(--color-void))",
        cabinet: "hsl(var(--color-cabinet))",
        screen: "hsl(var(--color-screen))",
        bezel: "hsl(var(--color-bezel))",
        steel: "hsl(var(--color-steel))",
        chrome: "hsl(var(--color-chrome))",

        // Neon accent colors
        neon: {
          cyan: "hsl(var(--color-neon-cyan))",
          magenta: "hsl(var(--color-neon-magenta))",
          green: "hsl(var(--color-neon-green))",
          yellow: "hsl(var(--color-neon-yellow))",
          red: "hsl(var(--color-neon-red))",
        },

        // Week/Level colors
        week1: "hsl(var(--color-week1))",
        week2: "hsl(var(--color-week2))",
        week3: "hsl(var(--color-week3))",
        week4: "hsl(var(--color-week4))",
      },

      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Instrument Serif', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'Consolas', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },

      boxShadow: {
        'glow-cyan': 'var(--glow-cyan)',
        'glow-magenta': 'var(--glow-magenta)',
        'glow-green': 'var(--glow-green)',
        'glow-yellow': 'var(--glow-yellow)',
        'glow-week1': 'var(--glow-week1)',
        'glow-week2': 'var(--glow-week2)',
        'glow-week3': 'var(--glow-week3)',
        'glow-week4': 'var(--glow-week4)',
        'arcade': '0 4px 20px hsl(var(--color-void) / 0.5), 0 0 40px hsl(var(--color-neon-cyan) / 0.1)',
        'arcade-hover': '0 8px 30px hsl(var(--color-void) / 0.6), 0 0 60px hsl(var(--color-neon-cyan) / 0.2)',
      },

      keyframes: {
        // Existing animations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // New arcade animations
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "neon-pulse": {
          "0%, 100%": {
            opacity: "1",
            filter: "brightness(1)",
          },
          "50%": {
            opacity: "0.8",
            filter: "brightness(1.2)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--color-neon-cyan) / 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--color-neon-cyan) / 0.8), 0 0 60px hsl(var(--color-neon-cyan) / 0.4)",
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.95" },
          "75%": { opacity: "0.98" },
        },
        "score-count": {
          "0%": { transform: "scale(1.2)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-up": "fade-up 0.4s ease-out",
        "fade-down": "fade-down 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "scanline": "scanline 8s linear infinite",
        "flicker": "flicker 0.15s ease-in-out infinite",
        "score-count": "score-count 0.5s ease-out",
      },

      transitionTimingFunction: {
        'arcade': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      backgroundImage: {
        'arcade-gradient': 'linear-gradient(135deg, hsl(var(--color-neon-cyan)) 0%, hsl(var(--color-neon-magenta)) 100%)',
        'arcade-gradient-alt': 'linear-gradient(135deg, hsl(var(--color-neon-magenta)) 0%, hsl(var(--color-neon-yellow)) 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
