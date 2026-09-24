# Promo on X — open-claude-design

Use after `docs/NETLIFY_OPEN_SOURCE.md` approval + Zeabur `mcp.zeabur.com` canonical cutover.

## One X post (hook) + thread

**Post 1 — hook (image: gallery at 1440px, Diseño + Make something new)**

`claude.ai` Design tab — but mine.

I built the only open repo that clones the Sep 2026 Diseño gallery (Diseños / Sistemas + artifact canvas). Clean rebuild — no Mobbin PNGs redistributed.

Next 16 + Tailwind 4 + shadcn · Netlify 1-click · Zeabur MCP as canonical `mcp.zeabur.com`.

BYOK: your `ANTHROPIC_API_KEY` stays in `localStorage`, never on server. Any model (GPT-5, Gemini via OpenRouter), same Claude design.

PUPFR!SKY skin (#121212 / #FFD100 / #00E5FF / #9D00FF) · die-cut stickers · breathtaking, not default.

MIT. Help me earn Netlify Open Source perks → star + deploy 👇

Repo: `github.com/FriskyDevelopments/open-claude-design`
Live: `open-claude-design.netlify.app` · `/admin` (frk_live_ API keys)

[alt: Cloned Diseños header, 4 cards, project grid Nocturne/Code Pup, 1440px screenshot proof]

**Post 2 — Admin Center + per-tool gate (image: /admin felling, frk_live_ blur after copy)**

Every `tools/call` is gated like Mobbin: owner/admin JWT **or** `Authorization: Bearer frk_live_…` — no bot-token bypass. Scopes `mobbin:read / memory:read / github:read / model:live` + rotation.

Fixed Mobbin drift: upstream now needs `platform: ios|web` — Composio bridge now injects `web` default + retry, so `mobbin_search_screens({query:"Claude", platform:"web"})` actually returns inspo.

Docs: `docs/ZEABUR.md`

**Post 3 — Figma + jewels (image: Figma Tokens → Tailwind + react-bits + Uiverse Galaxy wall)**

Design system that isn't theater:

Figma Tokens Studio → Style Dictionary → `@theme inline` → react-bits (/react-bits, 30+ motion) → shadcn/Radix → Magic Patterns → Mobbin API → Uiverse Galaxy — one palette, zero drift.

Standing rule: *Every screen ships breathtaking or it doesn't ship.* Screenshots at final size or it didn't happen.

**Post 4 — CTA for Netlify OSS (image: LICENSE + CONTRIBUTING + build badge green)**

MIT + OSS hygiene done. Applying for Netlify Open Source Team Pro perks (builds/bandwidth free).

Want in? `★ star` the repo → Deploy to Netlify button → try BYOK → mint a `frk_live_` key in `/admin`.

Want your skin? Fork → re-token the 4 vars and ship your agency.

#open-source #netlify #tailwind #nextjs #mcp #awwwards #claude #pupfrisky #uiverse #figma #zeabur

## Alt — short bump (post-cutover)

Zeabur cutover done: `mcp.friskydev.com` → `mcp.zeabur.com` (Supabase + Composio Mobbin live). Try `call_composio_tool({tool:"mobbin_search_screens", arguments:{query:"Claude login", platform:"web"}})` — platform is no longer `invalid_value`.

## Checklist before you post

- [ ] Repo public, `LICENSE` MIT, `netlify.com/open-source` applied
- [ ] Build green badge + gallery/admin/login at 1440px attached
- [ ] Link `mcp.zeabur.com/mcp` in bio, not handle typo
- [ ] Legal line stays: rebuilt clean, Mobbin reference only, inspired by claude.ai
