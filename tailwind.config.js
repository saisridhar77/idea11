/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom color palette for the sports fest theme
      colors: {
        brand: {
          gold: "#FFD700",
          orange: "#FF6B00",
          red: "#E63946",
          dark: "#0A0A0F",
          darker: "#050508",
          surface: "#111118",
          glass: "rgba(255,255,255,0.05)",
        },
      },
      // Custom fonts for cinematic feel
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      // Glassmorphism utilities
      backdropBlur: {
        xs: "2px",
      },
      // Custom animations
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,107,0,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(255,107,0,0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [],
};
