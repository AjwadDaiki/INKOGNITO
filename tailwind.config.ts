import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — warm cream/paper tones
        surface: {
          DEFAULT: "#e8e0d4",
          card: "#f0ebe3",
          low: "#ece5db",
          high: "#ddd5c9"
        },
        // Paper — sketchbook whites
        paper: {
          DEFAULT: "#faf6ef",
          warm: "#f5efe5",
          aged: "#ede6da"
        },
        // Primary — ink gold / sepia accent
        primary: {
          DEFAULT: "#D4A017",
          light: "#FBF0C8",
          dark: "#8B6914"
        },
        // Tertiary — ink red / vermillion
        tertiary: {
          DEFAULT: "#C43E2E",
          light: "#FADED8"
        },
        // Ink — text scale (true ink feel)
        ink: {
          950: "#1a1410",
          900: "#2c2318",
          700: "#4a3c2e",
          500: "#7a6b5a",
          300: "#a89884",
          100: "#e0d6c8"
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
        card: "0 3px 0 rgba(26,20,16,0.08), 0 8px 24px rgba(26,20,16,0.06)",
        "card-hover": "0 5px 0 rgba(26,20,16,0.08), 0 12px 28px rgba(26,20,16,0.08)",
        primary: "0 3px 0 rgba(139,105,20,0.35), 0 6px 18px rgba(212,160,23,0.3)",
        tertiary: "0 4px 20px rgba(196,62,46,0.25)",
        glow: "0 4px 24px rgba(26,20,16,0.12)",
        cyan: "0 4px 20px rgba(14,165,233,0.2)",
        rose: "0 4px 20px rgba(255,45,120,0.2)"
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "3rem"
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
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
