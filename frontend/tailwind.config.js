/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["DM Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#050816",
          900: "#0a1022",
          850: "#111a2e",
          800: "#16213c",
        },
        line: {
          DEFAULT: "rgba(148, 163, 184, 0.14)",
          strong: "rgba(148, 163, 184, 0.28)",
        },
        accent: {
          cyan: "#55d6ff",
          teal: "#4cf0c2",
          orange: "#ff9f66",
          rose: "#ff6f91",
          lime: "#b8f36b",
        },
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.18)",
        glow: "0 0 0 1px rgba(85, 214, 255, 0.1), 0 30px 80px rgba(15, 23, 42, 0.5)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)",
      },
      animation: {
        float: "float 12s ease-in-out infinite",
        pulseSlow: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
      },
    },
  },
  plugins: [],
};
