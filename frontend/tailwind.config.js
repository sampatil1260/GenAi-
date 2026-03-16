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
          950: "#0a0a12",
          900: "#0f0d1a",
          800: "#161425",
          700: "#1e1b30",
          600: "#28253d",
        },
        accent: {
          DEFAULT: "#7c5cfc",
          light: "#a78bfa",
          dark: "#5b3fd9",
        },
        glow: {
          purple: "rgba(124, 92, 252, 0.15)",
          blue: "rgba(59, 130, 246, 0.15)",
          emerald: "rgba(52, 211, 153, 0.15)",
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(124, 92, 252, 0.15)",
        "glow-lg": "0 0 60px rgba(124, 92, 252, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
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
      },
    },
  },
  plugins: [],
};
