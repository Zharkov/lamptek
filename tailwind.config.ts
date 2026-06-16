import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // «Ночь» — холодный графит, фон
        ink: {
          900: "#0B0E14",
          800: "#0E1117",
          700: "#161B22",
          600: "#1F2630",
          500: "#2C3543",
        },
        // Текст
        chalk: "#F2F4F8",
        muted: "#9AA4B2",
        // Свечение светильника = акцент. Привязка к цветовой температуре светодиода.
        glow: {
          warm: "#FFB347",   // ~2700K
          neutral: "#FFD9A0",// ~4000K
          cool: "#CFE3FF",   // ~5000K
          DEFAULT: "#FFB347",
        },
        beam: "#5FA8FF", // холодный технический акцент
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,179,71,0.25), 0 8px 40px -8px rgba(255,179,71,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
