# Launch kit (drafts, nothing has been posted)

Everything here is a draft for me to review and post by hand. Keep the tone plain: what it is, what it does, what it doesn't do yet. No superlatives, no "first", no vote requests.

## Before posting

- [ ] Merge the launch PR, confirm CI is green on `main`.
- [ ] Upload `.github/social-preview.png` in Settings → General → Social preview.
- [ ] Apply the ruleset: `gh api -X POST repos/FriskyDevelopments/open-claude-design/rulesets --input .github/rulesets/main.json`.
- [ ] Live demo loads: https://frisky-design.hrgrrtks2p.workers.dev (gallery, `/canvas`, pop-out).
- [ ] Hosted MCP answers `tools/list`: https://frisky-design-cloud.hrgrrtks2p.workers.dev/mcp
- [ ] Whop product, price and webhook are set up if I want to mention the hosted endpoint.
- [ ] Pin the roadmap issue; good first issues are labelled.
- [ ] Be around for a few hours after each post to answer questions.

## One-liners

- Name: **FR!SKY Design**
- Tagline (35 chars): **An open source Claude Design system**
- Hero: FR!SKY Design. An open source Claude Design system: gallery + artifact canvas, bring your own key, and a hosted MCP when you want it.

## How this compares (use when asked, keep it factual)

There are other open projects in this space, and they are good:

- **[nexu-io/open-design](https://github.com/nexu-io/open-design)** is the largest and most complete open alternative. If you want a full product with a big community, start there.
- **[OpenCoworkAI/open-codesign](https://github.com/OpenCoworkAI/open-codesign)** is a desktop-first take with a broader feature set.
- A couple of smaller repos also use the "open claude design" name.

FR!SKY Design is intentionally small: a static Next.js export plus one Cloudflare Worker, BYOK through a stateless same-origin proxy, a zero-dependency MCP core (stdio and streamable HTTP) you can read in an afternoon, and an opinionated visual system. Pick it if you want something you can fork, understand and restyle quickly, or if you mostly want the MCP tools inside Claude Code or Cursor.

## Show HN

Rules to respect: it must be something people can try right now, the title states plainly what it is, no asking for upvotes, and I reply in the comments myself.

**Title:** Show HN: FR!SKY Design – an open source Claude Design-style canvas with an MCP server

**URL:** https://github.com/FriskyDevelopments/open-claude-design

**First comment:**

> Hi HN. I liked the Claude Design flow (pick a starting point, describe it, get an artifact you keep iterating on) but wanted it without a subscription and without being locked to one model, so I built a small open version.
>
> What it does: a gallery of starting points (slides, product designs, components, design systems), a canvas with a sandboxed live preview, and BYOK for Anthropic, OpenAI or OpenRouter. The key stays in localStorage and goes through a stateless same-origin proxy; there is no database.
>
> The part I use most is the MCP server. The same gallery, tokens and generator are exposed as MCP tools over stdio or streamable HTTP, so Claude Code or Cursor can scaffold an artifact directly. The core is about 500 lines with zero dependencies.
>
> Deploys as a static export plus one Cloudflare Worker (or Netlify). MIT.
>
> Known gaps: no multi-file projects yet, no collaborative editing, and the gallery is small. Larger projects like open-design exist and are more complete; this one aims to stay small and easy to fork. Feedback on the MCP tool design is especially welcome.

## Product Hunt

- **Name:** FR!SKY Design
- **Tagline:** An open source Claude Design system
- **Description (≤260):** A small open source design canvas: gallery of starting points, sandboxed artifact preview, bring your own Anthropic/OpenAI/OpenRouter key, and an MCP server so Claude Code and Cursor can generate artifacts directly. Self-host on Cloudflare in a minute.
- **Topics:** Design Tools, Developer Tools, Open Source, Artificial Intelligence
- **Gallery:** `.github/social-preview.png`, `docs/media/demo.gif`, `docs/media/hero.gif`, a canvas screenshot
- **Maker comment:**

> Hey Product Hunt. I built FR!SKY Design because I wanted the Claude Design workflow without a subscription or a single-model lock-in. It is MIT, runs as a static site plus one Worker, and your model key never leaves your browser except to reach the provider. There is also an MCP server, so you can create slides, pages and token sheets from Claude Code or Cursor. I would love feedback on which gallery templates to add next.

## X thread

1. I built FR!SKY Design: an open source Claude Design system. Gallery + artifact canvas, bring your own key, MCP server included. MIT. [demo.gif] github.com/FriskyDevelopments/open-claude-design
2. BYOK: Anthropic, OpenAI or OpenRouter. The key stays in your browser and passes through a stateless same-origin proxy. No database, no logs.
3. The MCP server exposes the gallery, design tokens and the generator as tools, over stdio or streamable HTTP. `claude mcp add --transport http …` and Claude Code can scaffold slides or a landing page directly.
4. Self-host: static export + one Cloudflare Worker. There is a Deploy to Cloudflare button in the README.
5. It is small on purpose, and open-design is the bigger, more complete option if you need that. If this one helps, a star helps me keep going.

## Reddit

Always: post from my own account, say it is my project, answer comments, no vote requests, no referral links, don't cross-post the same text everywhere on the same day.

| Subreddit | Rule that matters (checked Sep 2026) | Plan |
|---|---|---|
| r/SideProject | No formal rules page; bare links and pure promotion get ignored or removed. Wants context, a demo and a specific ask. | Any day. Post the demo GIF, what I built and why, and ask which templates to add. |
| r/webdev | Project posts only on **Showoff Saturday**, tagged `[Showoff Saturday]`; no commercial promotion; no AI-generated posts. | Saturday only. Focus on the technical side (static export + Worker, sandboxed iframe, same-origin proxy). Do not mention the paid hosted MCP. Write it myself. |
| r/ClaudeAI | Showcase (rule 7): I built it, Claude played a substantial role or it was built for Claude, explain both what Claude did and what the project does, free to try, minimal marketing, no referral links. | Use the Showcase flair. Explain how Claude/Claude Code was used to build it (fill in honestly) and how it works with Claude models via MCP. Link the repo, not Whop. |
| r/mcp | Self-promotion allowed with disclosure; use the **showcase** flair; no waitlists or unlaunched services; no AI-generated slop. | Showcase post about the tool design (4 core tools, stateless HTTP, stdio). Mention the hosted endpoint only in one line. |
| r/selfhosted | Projects younger than 3 months go **only** in the weekly New Project Megathread (Fridays); every post needs an AI-use disclosure reply to the bot. | Top-level comment in the current megathread, with a plain AI disclosure and the self-host steps. No standalone post until the repo is 3 months old. |

**r/SideProject draft**

> **I built an open source Claude Design-style canvas with an MCP server (FR!SKY Design)**
>
> I wanted the pick-a-template, describe-it, iterate-on-the-artifact flow without a subscription, so I built a small open version. Gallery of starting points, sandboxed live preview, bring your own Anthropic/OpenAI/OpenRouter key (stays in the browser), plus an MCP server so Claude Code or Cursor can generate artifacts directly. Static export + one Cloudflare Worker, MIT.
>
> [demo GIF]
>
> What I'd love feedback on: which gallery templates would you actually use? Repo: https://github.com/FriskyDevelopments/open-claude-design

**r/ClaudeAI draft (Showcase)**

> **FR!SKY Design: open source Claude Design-style canvas + MCP server for Claude Code**
>
> What it is: a gallery + artifact canvas that works with your own Anthropic key (also OpenAI/OpenRouter), and an MCP server exposing the gallery, design tokens and an artifact generator to Claude Code, Claude Desktop (via mcp-remote) or any MCP client.
>
> How Claude was involved: [fill in honestly, e.g. which parts Claude Code wrote, what I reviewed and changed].
>
> Free to try: MIT, self-host in a minute, demo at https://frisky-design.hrgrrtks2p.workers.dev. Repo: https://github.com/FriskyDevelopments/open-claude-design

**r/mcp draft (showcase)**

> **[Showcase] FR!SKY Design: a small MCP server for design artifacts (stdio + streamable HTTP, zero deps)**
>
> I made this. Four tools: `list_gallery`, `get_design_tokens` (JSON / CSS vars / Tailwind v4), `scaffold_artifact` (instant HTML, no model call) and `generate_artifact` (BYOK). Stateless streamable HTTP on a Cloudflare Worker, or `node mcp/stdio.ts` locally. Server-side model keys are only used when the endpoint has a bearer token, so an open deploy can't burn credits. There is also a hosted endpoint with a few extra tools if you don't want to run it.
>
> Repo: https://github.com/FriskyDevelopments/open-claude-design. Feedback on tool naming and schemas welcome.

**r/selfhosted megathread comment**

> **FR!SKY Design** – open source design canvas + MCP server. Static export + one Cloudflare Worker (or Netlify), no database, BYOK keys stay in the browser. `git clone … && npm install && npm run preview`. MIT. AI disclosure: built with AI coding assistance [describe], reviewed and tested by me; 14+ tests, CI with lint/typecheck/build/secret scan. https://github.com/FriskyDevelopments/open-claude-design

## Awesome lists (PR lines)

- **punkpeye/awesome-mcp-servers** → section "📐 Architecture & Design", alphabetical, one line (legend: 📇 TypeScript, 🏠 local, ☁️ cloud, 🍎 🪟 🐧 OS):
  `- [FriskyDevelopments/open-claude-design](https://github.com/FriskyDevelopments/open-claude-design) 📇 🏠 ☁️ 🍎 🪟 🐧 - Open source Claude Design-style system: gallery templates, design tokens (JSON/CSS/Tailwind) and BYOK HTML artifact generation over stdio or streamable HTTP.`
  PR title: `Add FR!SKY Design (open-claude-design)`
- **punkpeye/awesome-remote-mcp-servers** (hosted endpoint, only after the Whop product is live):
  `- [FR!SKY Design Cloud](https://frisky-design-cloud.hrgrrtks2p.workers.dev/mcp) - Hosted FR!SKY Design MCP: gallery search, saved artifacts with share links, design-system export. API key auth.`
- **Other lists worth a look:** awesome-claude-code style lists (as an MCP for Claude Code), awesome-cloudflare (Workers deploy button example), awesome-nextjs (static export + Worker). Read each list's CONTRIBUTING first; one PR per list, no follow-up pings.

## MCP registries and directories

| Where | How |
|---|---|
| Official MCP Registry (registry.modelcontextprotocol.io) | `server.json` is in the repo root (namespace `io.github.FriskyDevelopments/frisky-design`, remote `streamable-http`). Install `mcp-publisher`, `mcp-publisher login github`, `mcp-publisher publish`. Bump `version` for each update. |
| Smithery (smithery.ai) | Sign in with GitHub, add the server by URL (`…/mcp`). `initialize` and `tools/list` work without a key, so it can be indexed. |
| Glama (glama.ai/mcp/servers) | Indexes public GitHub MCP repos; claim the listing with GitHub and check the score badge (awesome-mcp-servers uses it). |
| mcp.so | Submit form with repo URL and description. |
| PulseMCP (pulsemcp.com) | Submit form; they review manually. |
| Cursor directory (cursor.directory) | Submit the MCP with the Cursor config from the README. |
