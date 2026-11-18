/**
 * Deterministic starter artifacts (no model call). Used by the canvas in demo
 * mode and by the MCP `scaffold_artifact` tool. Output is a single
 * self-contained HTML document, safe to render in a sandboxed iframe.
 */
import { TOKENS } from "./tokens.ts";

export const ARTIFACT_KINDS = ["slides", "design", "codebase", "design-system"] as const;
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];

export type GalleryItem = { id: string; kind: ArtifactKind; title: string; summary: string; tags: string[] };

/** The built-in gallery shown on the home screen. */
export const GALLERY: GalleryItem[] = [
  { id: "slides-pitch", kind: "slides", title: "Pitch deck", summary: "Five-slide pitch with a bold title card and metric slide.", tags: ["slides", "pitch"] },
  { id: "design-landing", kind: "design", title: "Landing page", summary: "Hero, feature grid and CTA in the FR!SKY palette.", tags: ["web", "landing"] },
  { id: "codebase-component", kind: "codebase", title: "Component in your codebase", summary: "A React + Tailwind component with tokens wired in.", tags: ["react", "tailwind"] },
  { id: "system-tokens", kind: "design-system", title: "Design system sheet", summary: "Color, type and radius tokens on one page.", tags: ["tokens", "system"] },
  { id: "design-pricing", kind: "design", title: "Pricing table", summary: "Three tiers with a highlighted plan.", tags: ["web", "pricing"] },
  { id: "slides-roadmap", kind: "slides", title: "Roadmap", summary: "Now / next / later board as slides.", tags: ["slides", "planning"] },
];

export function isArtifactKind(v: unknown): v is ArtifactKind {
  return typeof v === "string" && (ARTIFACT_KINDS as readonly string[]).includes(v);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function shell(title: string, body: string, extraCss = ""): string {
  const c = TOKENS.color;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:${c.bg};color:${c.text};font-family:${TOKENS.font.sans};-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:${TOKENS.font.display};letter-spacing:-.03em;margin:0}
.mono{font-family:${TOKENS.font.mono};font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:${c.muted}}
.card{background:${c.panel};border:${TOKENS.stroke.dieCut};border-radius:${TOKENS.radius.md};padding:20px;box-shadow:0 10px 0 rgba(0,0,0,.45)}
.pill{display:inline-block;width:max-content;border:${TOKENS.stroke.dieCut};border-radius:999px;padding:8px 16px;font-weight:800;background:${c.yellow};color:${c.bg};text-decoration:none}
.y{color:${c.yellow}}.c{color:${c.cyan}}.a{color:${c.amethyst}}
${extraCss}
</style></head><body>${body}</body></html>`;
}

export function renderArtifact(kind: ArtifactKind, opts: { title?: string; prompt?: string } = {}): string {
  const title = (opts.title || "").trim().slice(0, 80) || defaultTitle(kind);
  const prompt = (opts.prompt || "").trim().slice(0, 280);
  const t = esc(title);
  const p = prompt ? esc(prompt) : "Starter artifact. Add your API key to generate a real one from your prompt.";
  const c = TOKENS.color;
  switch (kind) {
    case "slides":
      return shell(
        title,
        `<main class="deck">
<section class="slide s1"><div class="mono">01 / title</div><h1>${t}<span class="c">.</span></h1><p>${p}</p></section>
<section class="slide"><div class="mono">02 / problem</div><h2>What hurts today</h2><ul><li>Too many tools, one idea</li><li>Design drifts from code</li><li>Nobody owns the tokens</li></ul></section>
<section class="slide"><div class="mono">03 / metric</div><h2 class="big y">3×</h2><p>faster from prompt to reviewable artifact</p></section>
</main>`,
        `.deck{display:grid;gap:18px;padding:24px}.slide{aspect-ratio:16/9;background:${c.panel};border:${TOKENS.stroke.dieCut};border-radius:${TOKENS.radius.md};padding:32px;display:flex;flex-direction:column;justify-content:center;gap:12px}
.s1{background:linear-gradient(135deg,rgba(255,209,0,.18),${c.panel} 55%)}.slide h1{font-size:48px}.slide h2{font-size:30px}.big{font-size:96px!important}.slide p,.slide li{color:${c.muted};font-size:16px;line-height:1.5}`,
      );
    case "design":
      return shell(
        title,
        `<header class="hero"><div class="mono">FR!SKY · design</div><h1>${t}<span class="y">.</span></h1><p>${p}</p><a class="pill" href="#">Get started</a></header>
<section class="grid">${["Bring your own key", "Artifact canvas", "Tokens in code"].map((f, i) => `<div class="card"><div class="dot" style="background:${[c.yellow, c.cyan, c.amethyst][i]}"></div><h3>${f}</h3><p>Built on the FR!SKY tokens. Edit, regenerate, ship.</p></div>`).join("")}</section>`,
        `.hero{padding:56px 32px 24px;display:grid;gap:14px;max-width:760px}.hero h1{font-size:56px;line-height:.95}.hero p{color:${c.muted};font-size:16px;line-height:1.5}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;padding:16px 32px 40px}.card p{color:${c.muted};font-size:13px;line-height:1.5}.dot{width:14px;height:14px;border-radius:999px;border:2px solid #fff;margin-bottom:12px}`,
      );
    case "codebase":
      return shell(
        title,
        `<main class="wrap"><div class="mono">design in codebase</div><h1>${t}</h1><p>${p}</p>
<pre class="card code"><code>export function Button({ children }) {
  return (
    &lt;button className="rounded-full border-2 border-white
      bg-yellow px-4 py-2 font-extrabold text-bg"&gt;
      {children}
    &lt;/button&gt;
  );
}</code></pre><button class="pill">Preview: Button</button></main>`,
        `.wrap{padding:40px 32px;display:grid;gap:16px;max-width:760px}.wrap h1{font-size:40px}.wrap p{color:${c.muted}}.code{font-family:${TOKENS.font.mono};font-size:13px;color:${c.cyan};overflow:auto;white-space:pre}button.pill{width:max-content;cursor:pointer}`,
      );
    case "design-system":
      return shell(
        title,
        `<main class="wrap"><div class="mono">design system</div><h1>${t}</h1><p>${p}</p>
<div class="sw">${Object.entries(c).filter(([, v]) => v.startsWith("#")).map(([k, v]) => `<div class="card s"><div class="chip" style="background:${v}"></div><div class="mono">${k}</div><code>${v}</code></div>`).join("")}</div>
<div class="card"><h2 style="font-size:40px">Bricolage 800</h2><p style="font-family:${TOKENS.font.sans}">Manrope for body copy. <span style="font-family:${TOKENS.font.mono}" class="c">JetBrains Mono for labels.</span></p></div></main>`,
        `.wrap{padding:40px 32px;display:grid;gap:16px}.wrap h1{font-size:40px}.wrap>p{color:${c.muted}}.sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px}.s{padding:12px}.chip{height:56px;border-radius:12px;border:2px solid #fff;margin-bottom:8px}.s code{font-family:${TOKENS.font.mono};font-size:12px}`,
      );
  }
}

function defaultTitle(kind: ArtifactKind): string {
  return { slides: "Pitch deck", design: "Landing page", codebase: "Button component", "design-system": "FR!SKY tokens" }[kind];
}

/** System prompt used for BYOK generation (app canvas and MCP `generate_artifact`). */
export function artifactSystemPrompt(kind: ArtifactKind): string {
  return [
    "You generate a single self-contained HTML document (inline CSS, no external scripts) for an artifact canvas.",
    `Artifact kind: ${kind}.`,
    `Use this palette: background ${TOKENS.color.bg}, panel ${TOKENS.color.panel}, text ${TOKENS.color.text}, accents ${TOKENS.color.yellow} / ${TOKENS.color.cyan} / ${TOKENS.color.amethyst}.`,
    "Thick white 2px borders, 18px radius, bold display headings. Return only the HTML, starting with <!doctype html>.",
  ].join("\n");
}

/** Pull the HTML document out of a model response (handles ```html fences). */
export function extractHtml(text: string): string {
  const fence = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const body = (fence ? fence[1] : text).trim();
  const start = body.search(/<!doctype html|<html/i);
  return start >= 0 ? body.slice(start) : body;
}
