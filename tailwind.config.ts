import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        bunker: {
          black: "#030403",
          panel: "#0a0f0c",
          steel: "#151a18",
          green: "#73ff9a",
          olive: "#5f6f48",
          red: "#7e1319",
          ice: "#e7f2ee",
          amber: "#d6a84f"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        glow: "0 0 32px rgba(115, 255, 154, 0.22)",
        danger: "0 0 36px rgba(126, 19, 25, 0.35)",
        insetPanel: "inset 0 1px 0 rgba(255,255,255,0.06)"
      },
      backgroundImage: {
        scanline:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
        radialNoise:
          "radial-gradient(circle at 20% 20%, rgba(115,255,154,0.14), transparent 25%), radial-gradient(circle at 80% 0%, rgba(126,19,25,0.28), transparent 28%)"
      }
    }
  },
  plugins: [animate]
};

export default config;
