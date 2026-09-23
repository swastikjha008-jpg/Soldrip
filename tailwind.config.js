/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05060a",
        ink: "#080b14",
        panel: "rgba(5, 8, 20, 0.65)",
        drip: {
          purple: "#9945FF",
          blue: "#1e6fff",
          green: "#14F195",
          cyan: "#22d3ee",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(20, 241, 149, 0.25)",
        "glow-blue": "0 0 28px rgba(30, 111, 255, 0.35)",
      },
      keyframes: {
        "card-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pulse-once": {
          "0%": { boxShadow: "0 0 0 0 rgba(20,241,149,0.55)" },
          "100%": { boxShadow: "0 0 0 26px rgba(20,241,149,0)" },
        },
        "count-up": {
          "0%": { opacity: "0.4", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "card-in": "card-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-once": "pulse-once 0.9s ease-out",
        "count-up": "count-up 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
