# Contributing

Open Claude Design is MIT and Netlify OSS-ready. PRs that make the gallery more breathtaking and more honest are welcome.

## Setup

```bash
npm i
npm run build # must stay green — no merge with red build
npm run dev   # http://localhost:3000  (1440px proof before ship)
```

`src/app/page.tsx` is the gallery (Diseño), `src/app/admin/page.tsx` is the MVP Admin Center (frk_live_…), `src/app/globals.css` is the Tailwind `@theme inline` (source of truth).

## Design rules

- Ship at 1440px. Screenshot proof before review. No default controls — every control themed to Pup doctrine (Bricolage 800 / Manrope / JetBrains Mono / 42px grid / hairlines / die-cut border-2).
- One palette: `#121212 / #FFD100 / #00E5FF / #9D00FF`. Paste from Uiverse Galaxy etc only if re-tokenized.
- Figma is source (Tokens Studio → Style Dictionary → Tailwind). Screenshots are spec, not assets — don't commit Mobbin PNGs.

## PR checklist

- [ ] `npm run build` + `npm run lint` green
- [ ] Screenshots attached (gallery + admin + login if touched)
- [ ] BYOK still works (keys in localStorage, never server)
- [ ] New `/admin` features handle revoked/expired keys (deny, audit, copy-once)
- [ ] No secrets committed (`FRISKY_*`, `COMPOSIO_*`, `*.pem`, `.env`)
