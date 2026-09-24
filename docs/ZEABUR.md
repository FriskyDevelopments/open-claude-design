# Zeabur — makes mcp.zeabur.com canonical

`open-claude-design` is Netlify-ready (`netlify.toml + @netlify/plugin-nextjs`) **and** Zeabur-ready. Either deploys the same Next.js build — no fork.

## Make Zeabur canonical (mcp.zeabur.com)

```bash
# 1) Refresh the Zeabur token (your zat_ is expired per "check")
zeabur auth login              # browser → pick the owner Google account
# 2) Bind this repo to the Zeabur project you called "Open MCP" / untitled-2
zeabur context set --project untitled-2
zeabur domain list -i=false --json   # copy the *.zeabur.app domain
# 3) Set a stable MCP domain (Dashboard → Domains → + mcp.zeabur.com) then
zeabur variable set -i=false FRISKY_MCP_PUBLIC_URL=https://mcp.zeabur.com
# 4) Deploy (keep Cloud Run until DNS cutover proven)
zeabur deploy -i=false
# 5) Cutover only after health + OAuth login proven:
#    Cloudflare → DNS → mcp.friskydev.com CNAME → *.zeabur.app
```

## Env for MCP (mirror Cloud Run)

- `FRISKY_MCP_AUTH_ENABLED=true`
- `FRISKY_MCP_PUBLIC_URL=https://mcp.zeabur.com`
- `FRISKY_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY` + `FRISKY_SUPABASE_OWNER_EMAILS`
- `FRISKY_COMPOSIO_ENABLED=true` + `COMPOSIO_MCP_URL=https://connect.composio.dev/mcp` + `COMPOSIO_CONSUMER_API_KEY`

## Why two edges

- **Netlify** = static gallery (Diseño) + `/admin` (MVP localStorage). Free OSS plan — apply at `netlify.com/open-source` with public GH + MIT + live URL.
- **Zeabur MCP** = live auth + Mobbin + per-tool gate + audit. Owner JWT from Supabase (Apple relay `5cczgpz…@privaterelay…` is the MVP owner seed).
