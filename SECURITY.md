# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub: **[Report a vulnerability](https://github.com/FriskyDevelopments/open-claude-design/security/advisories/new)** (Security tab → Advisories). Do not open a public issue.

Include what you found, how to reproduce it and the impact you expect. I aim to acknowledge reports within 3 days and to ship a fix or mitigation for confirmed issues within 30 days, and I will credit you in the advisory unless you prefer otherwise.

## Scope

- The web app, `/api/chat` proxy, `/mcp` endpoint and the `mcp/` core in this repository.
- Leaks of user model keys, cross-origin use of the proxy, sandbox escapes from rendered artifacts, and auth bypasses on a self-hosted `/mcp` with `MCP_TOKEN` set are all in scope.

## Supported versions

Only the latest release on `main` receives security fixes.
