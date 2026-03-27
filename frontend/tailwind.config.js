/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          950: "#06060e",
          900: "#0b0a18",
          800: "#110f22",
          700: "#19172e",
          600: "#22203c",
          500: "#2d2a4a",
        },
        "surface-light": {
          50: "#f8f7ff",
          100: "#f0eeff",
          200: "#e6e3fb",
          300: "#d5d0f5",
          400: "#c4bdef",
        },
        accent: {
          DEFAULT: "#7c5cfc",
          light: "#a78bfa",
          dark: "#5b3fd9",
          50: "#ede9fe",
        },
        neon: {
          cyan: "#06d6a0",
          blue: "#38bdf8",
          purple: "#c084fc",
          pink: "#f472b6",
        },
        glow: {
          purple: "rgba(124, 92, 252, 0.15)",
          blue: "rgba(59, 130, 246, 0.15)",
          cyan: "rgba(6, 214, 160, 0.12)",
          emerald: "rgba(52, 211, 153, 0.15)",
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(124, 92, 252, 0.15)",
        "glow-lg": "0 0 60px rgba(124, 92, 252, 0.2)",
        "glow-cyan": "0 0 30px rgba(6, 214, 160, 0.15)",
        "glow-blue": "0 0 30px rgba(56, 189, 248, 0.15)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
        "glass-light": "0 8px 32px rgba(124, 92, 252, 0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(124, 92, 252, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(124, 92, 252, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};
