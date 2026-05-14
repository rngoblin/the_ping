import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ping: {
          bg: "rgb(var(--color-bg) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          sage: "rgb(var(--color-sage) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          ink: "rgb(var(--color-ink) / <alpha-value>)",
          black: "rgb(var(--color-black) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      boxShadow: {
        mist: "0 18px 60px rgba(8, 15, 12, 0.08)",
        line: "0 0 0 1px rgba(8, 15, 12, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
