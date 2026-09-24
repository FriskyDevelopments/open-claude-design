# Security

Report privately: security@friskydev.com — we use `toolPolicy` + `audit_log` on the MCP gate and never store API keys plaintext (`frk_live_` = hashed `api_keys_v2`, BYOK stays in `localStorage`).

Do not open a public issue for secrets or auth bypass. We aim to triage within 48h.

Scope: `open-claude-design` gallery + `/admin`, `frisky-gpt-mcp` + `frisky-mcp-gateway` (`src/http-server.mjs` `authInfoFromRequest`, `FRISKY_SUPABASE_OWNER_EMAILS`, Composio Mobbin bridge `platform ios|web`).
