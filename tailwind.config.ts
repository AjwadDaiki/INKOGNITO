import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#d8cfc3",
          card: "#ebe2d6",
          low: "#e2d8ca",
          high: "#cbbfae"
        },
        paper: {
          DEFAULT: "#f5efe5",
          warm: "#f1e8da",
          aged: "#e6dbc8"
        },
        primary: {
          DEFAULT: "#D4A017",
          light: "#f0dd9e",
          dark: "#8B6914"
        },
        tertiary: {
          DEFAULT: "#C43E2E",
          light: "#f3d4cc"
        },
        ink: {
          950: "#1a1410",
          900: "#2c2318",
          700: "#4a3c2e",
          500: "#7a6b5a",
          300: "#a89884",
          100: "#e0d6c8"
        }
      },
      boxShadow: {
        card: "0 2px 0 rgba(90,68,47,0.18), 0 10px 22px rgba(90,68,47,0.12)",
        "card-hover": "0 3px 0 rgba(90,68,47,0.2), 0 16px 30px rgba(90,68,47,0.14)",
        primary: "0 2px 0 rgba(139,105,20,0.32), 0 10px 18px rgba(139,105,20,0.16)",
        tertiary: "0 2px 0 rgba(120,42,33,0.28), 0 12px 20px rgba(196,62,46,0.14)",
        glow: "0 14px 30px rgba(90,68,47,0.14)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem"
      },
      fontFamily: {
        display: ["Caveat", "cursive"],
        sketch: ["Caveat", "cursive"],
        sans: ["Be Vietnam Pro", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.8s ease-in-out infinite",
        "pop-in": "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.8", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" }
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
