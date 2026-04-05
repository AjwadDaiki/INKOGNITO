import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0A0A0F",
          900: "#12121A",
          800: "#1A1A2E",
          300: "#8888AA",
          200: "#EEEEF2"
        },
        neon: {
          violet: "#7B2FFF",
          cyan: "#00F0FF",
          rose: "#FF2D78",
          green: "#00FF88"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 16px 45px rgba(123,47,255,0.24)",
        cyan: "0 0 0 1px rgba(255,255,255,0.06), 0 14px 38px rgba(0,240,255,0.18)",
        rose: "0 0 0 1px rgba(255,255,255,0.06), 0 14px 38px rgba(255,45,120,0.2)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      fontFamily: {
        display: ["Clash Display", "Satoshi", "sans-serif"],
        sans: ["General Sans", "DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.8s ease-in-out infinite",
        grain: "grain 12s steps(10) infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.72", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" }
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
