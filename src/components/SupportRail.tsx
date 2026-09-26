"use client";

// SupportRail: Whop, donations and sponsor links (single source of truth for support URLs)
// All links open in new tab. Icons are inline (no extra deps). FR!sky palette:
// Obsidian #121212 / Hazard Yellow #FFD100 / Cyan #00E5FF / Amethyst #9D00FF + die-cut border-2 white
// Where it shows: imported by Sidebar (rail) + page footer CTA strip. Source-of-truth for
// support URLs lives here and is re-exported for README/OG sync — keep README badges in sync with LINKS.

export const LINKS = {
  // Frisky storefront on Whop — list your product URL here so one edit updates sidebar + README + OG
  whop: "https://whop.com/friskydev",
  // GitHub Sponsors — edit username to your Sponsors handle
  githubSponsors: "https://github.com/sponsors/FriskyDevelopments",
  // Donations: add all active rails (Netlify Open Source perk != money — this is optional support)
  donations: {
    // Gofundme / Ko-fi / Buy Me a Coffee / Open Collective — fill what you actually use
    kofi: "https://ko-fi.com/friskydev",
    // Paypal/Whop checkout/etc — placeholder for the real link after you hook checkout
    paypal: "https://whop.com/friskydev/checkout",
    bmc: "https://buymeacoffee.com/friskydev",
  },
  // Source + live deploys (for icon row)
  repo: "https://github.com/FriskyDevelopments/open-claude-design",
  netlifyDeploy: "https://app.netlify.com/start/deploy?repository=https://github.com/FriskyDevelopments/open-claude-design",
  live: "https://open-claude-design.netlify.app",
  admin: "/admin",
  mcp: "https://mcp.zeabur.com/mcp",
} as const;

function IconWhop({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="6" fill="currentColor" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="9" fontWeight={900} fontFamily="Bricolage Grotesque, sans-serif" fill="#121212">
        W
      </text>
    </svg>
  );
}
function IconHeart({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-3 4 4 0 0 1 7 3c0 5.8-7 10-7 10Z" fill="currentColor" />
    </svg>
  );
}
function IconSponsor({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconExternal({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2.5 7.5 7.5 2.5M5.5 2.5h2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SupportRailCompact() {
  return (
    <div className="space-y-2">
      <a href={LINKS.whop} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-white bg-white px-2.5 py-2 text-[#121212] hover:bg-[#FFD100]">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#121212] text-[#FFD100]">
          <IconWhop />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[12px] font-[800] leading-none">Whop — FR!sky</span>
          <span className="block font-mono text-[10px] leading-none text-black/50">Storefront · perks · checkout</span>
        </span>
        <span className="ml-auto font-bold text-black/30">
          <IconExternal size={11} />
        </span>
      </a>
      <div className="grid grid-cols-2 gap-2">
        <a href={LINKS.githubSponsors} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-white/80 hover:bg-white/10 hover:text-white">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-white text-[#121212]">
            <IconSponsor size={12} />
          </span>
          <span className="font-mono text-[11px] font-bold">Sponsor</span>
          <span className="ml-auto text-white/30">
            <IconExternal />
          </span>
        </a>
        <a href={LINKS.donations.kofi} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-white/80 hover:bg-white/10 hover:text-white">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#00E5FF] text-[#121212]">
            <IconHeart />
          </span>
          <span className="font-mono text-[11px] font-bold">Donate</span>
          <span className="ml-auto text-white/30">
            <IconExternal />
          </span>
        </a>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-white/30">
        <span className="h-px flex-1 bg-white/10" />
        <span>0 % comisión · BYOK</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
    </div>
  );
}

export function SupportFooterStrip() {
  return (
    <div className="rounded-[18px] border-2 border-white bg-[#191424] p-4 shadow-[0_10px_0_rgba(0,0,0,.4)] sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div>
        <div className="font-mono text-[10px] tracking-[0.18em] text-[#FFD100] uppercase">Keep it open · Keep it pup</div>
        <div className="mt-1 font-display text-[14px] font-[800] tracking-[-0.02em] text-white">Support keeps Diseño free — BYOK, no paywall, no data sale.</div>
        <div className="mt-1 font-mono text-[11px] leading-5 text-white/45">Whop checkout, GitHub Sponsors, or a Ko-fi — one click, zero dark pattern. Choose your den.</div>
      </div>
      <div className="mt-3 flex shrink-0 flex-wrap gap-2 sm:mt-0 sm:justify-end">
        <a href={LINKS.whop} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[#FFD100] px-4 py-1.5 font-mono text-[11px] font-[800] tracking-wide text-[#121212]">
          <IconWhop /> Whop <IconExternal />
        </a>
        <a href={LINKS.githubSponsors} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white px-4 py-1.5 font-mono text-[11px] font-bold text-[#121212]">
          <IconSponsor /> Sponsor <IconExternal />
        </a>
        <a href={LINKS.donations.bmc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-mono text-[11px] font-bold text-white/80 hover:bg-white/10">
          <IconHeart /> Donate
        </a>
      </div>
    </div>
  );
}
