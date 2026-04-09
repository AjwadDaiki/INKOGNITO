import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — warm off-white (plus blanc cassé, style cartoon)
        surface: {
          DEFAULT: "#e9edf2",
          card: "#fffdf9",
          low: "#f4f7fb",
          high: "#e4e9f0"
        },
        // Primary — electric gold/yellow
        primary: {
          DEFAULT: "#F0C000",
          light: "#FFF1AE",
          dark: "#A07A00"
        },
        // Tertiary — coral red
        tertiary: {
          DEFAULT: "#FF5C4D",
          light: "#FFE8E3"
        },
        // Ink — text scale (light mode)
        ink: {
          950: "#0F172A",
          900: "#1E293B",
          700: "#334155",
          500: "#64748B",
          300: "#94A3B8",
          100: "#E2EAF0"
        },
        // Accent helpers
        accent: {
          sky: "#0EA5E9",
          violet: "#7C3AED",
          green: "#22C55E"
        },
        // Keep neon for game-state indicators
        neon: {
          violet: "#7B2FFF",
          cyan: "#00B4D8",
          rose: "#FF2D78",
          green: "#00CC66"
        }
      },
      boxShadow: {
        card: "0 4px 0 rgba(15,23,42,0.09), 0 8px 28px rgba(15,23,42,0.05)",
        "card-hover": "0 6px 0 rgba(15,23,42,0.09), 0 12px 32px rgba(15,23,42,0.07)",
        primary: "0 3px 0 rgba(140,90,0,0.30), 0 6px 20px rgba(240,192,0,0.35)",
        tertiary: "0 4px 20px rgba(255,92,77,0.3)",
        glow: "0 4px 24px rgba(124,58,237,0.2)",
        cyan: "0 4px 20px rgba(14,165,233,0.2)",
        rose: "0 4px 20px rgba(255,45,120,0.2)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem"
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
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
