/**
 * FR!SKY Design tokens. Single source for the app theme, the MCP
 * `get_design_tokens` tool and the demo artifacts on the canvas.
 * Mirrors the `@theme inline` block in src/app/globals.css.
 */
export const TOKENS = {
  name: "FR!SKY",
  color: {
    bg: "#121212",
    void: "#0b001a",
    panel: "#191424",
    card: "#1c1828",
    text: "#f7f5f2",
    muted: "#a49cb4",
    yellow: "#ffd100",
    cyan: "#00e5ff",
    amethyst: "#9d00ff",
    border: "rgba(255,255,255,0.10)",
  },
  font: {
    display: "'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif",
    sans: "'Manrope', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  radius: { sm: "10px", md: "18px", lg: "22px", pill: "999px" },
  stroke: { dieCut: "2px solid #ffffff", hairline: "1px solid rgba(255,255,255,0.10)" },
  grid: "42px",
} as const;

export type TokenFormat = "json" | "css" | "tailwind";

export function formatTokens(format: TokenFormat = "json"): string {
  if (format === "json") return JSON.stringify(TOKENS, null, 2);
  if (format === "css") {
    const lines = [":root {"];
    for (const [k, v] of Object.entries(TOKENS.color)) lines.push(`  --color-${k}: ${v};`);
    for (const [k, v] of Object.entries(TOKENS.font)) lines.push(`  --font-${k}: ${v};`);
    for (const [k, v] of Object.entries(TOKENS.radius)) lines.push(`  --radius-${k}: ${v};`);
    lines.push("}");
    return lines.join("\n");
  }
  // Tailwind v4 `@theme` block
  const lines = ["@theme inline {"];
  for (const [k, v] of Object.entries(TOKENS.color)) lines.push(`  --color-${k}: ${v};`);
  for (const [k, v] of Object.entries(TOKENS.font)) lines.push(`  --font-${k}: ${v};`);
  for (const [k, v] of Object.entries(TOKENS.radius)) lines.push(`  --radius-${k}: ${v};`);
  lines.push("}");
  return lines.join("\n");
}
