# Contributing to FR!SKY Design

Thanks for taking the time. This is a small project and I read everything that comes in.

## How changes land

1. **Open an issue or a PR.** For anything bigger than a small fix, please open an issue first so we can agree on the shape before you spend time on it.
2. **Code Pup review.** Code Pup does a first review pass on every PR (style, tests, obvious bugs). Address its comments or reply if you disagree.
3. **I approve.** I review and approve. `main` is protected: one approval, passing checks, no force pushes.
4. **Merge.** I squash-merge with a conventional commit title.

## Local setup

```bash
npm install
npm run dev          # UI with hot reload on :3000
npm run preview      # full build + Worker (app, /api/chat, /mcp) on :8787
npm run lint && npm run typecheck && npm test && npm run build
```

Node 22.18+ is required (the MCP core runs TypeScript directly with Node's type stripping).

## Commit messages and sign-off

- Use [Conventional Commits](https://www.conventionalcommits.org): `feat: …`, `fix: …`, `docs: …`, `chore: …`. CI runs commitlint on PR commits.
- Every commit needs a **Developer Certificate of Origin** sign-off. Add it with `git commit -s`, which appends `Signed-off-by: Your Name <you@example.com>`. It certifies that you wrote the change or have the right to submit it under the project's MIT license ([developercertificate.org](https://developercertificate.org)). Forgot it? `git rebase --signoff main` and force-push your branch.
- User-facing changes should include a changeset: `npx changeset`. There is no npm publish; changesets only drive the changelog and version.

## What makes a good PR

- One focused change, with tests when it touches `mcp/`, `worker/` or `netlify/functions/`.
- Screenshots for UI changes (desktop and a narrow viewport).
- No secrets, keys or `.env` files. CI runs gitleaks on every PR.
- Keep BYOK keys client-side. Nothing in this repo should store or log a user's model key.
- Reference designs are fine to look at, but do not commit third-party screenshots or assets you do not have rights to.

## Adding yourself as a contributor

After your first merged PR, comment `@all-contributors please add @your-handle for code` (or `doc`, `design`, `ideas`, `bug`) on the PR, or I will add you.

## Security

Please do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
