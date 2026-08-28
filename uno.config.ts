import { defineConfig, presetIcons, presetWind4, transformerDirectives, transformerVariantGroup } from "unocss";

export default defineConfig({
  content: {
    filesystem: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  },
  theme: {
    colors: {
      bg: "#0b0b13",
      surface: "#151521",
      "surface-2": "#1e1e2d",
      "surface-3": "#27273a",
      border: "#2e2e44",
      muted: "#6b7280",
      text: "#f4f4f5",
      "text-secondary": "#a1a1aa",
      primary: "#6366f1",
      "primary-glow": "#818cf8",
      accent: "#a78bfa",
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
    fontFamily: {
      sans: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    borderRadius: {
      lg: "1.25rem",
      xl: "1.5rem",
      "2xl": "2rem",
    },
  },
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        mdi: () => import("@iconify-json/mdi/icons.json").then((i) => i.default),
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
});
