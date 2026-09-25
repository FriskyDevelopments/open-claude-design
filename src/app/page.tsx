"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SupportFooterStrip, SupportRailCompact } from "@/components/SupportRail";

// Viewport reveal: adds .is-in once when the section scrolls into view.
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
function RevealSection({ className = "", delay, children, cascade = false }: { className?: string; delay?: string; children: React.ReactNode; cascade?: boolean }) {
  const ref = useReveal<HTMLDivElement>();
  const style = delay ? ({ ["--reveal-delay" as string]: delay } as React.CSSProperties) : undefined;
  return <div ref={ref} className={`reveal-scroll${cascade ? " cascade" : ""}${className ? ` ${className}` : ""}`} style={style}>{children}</div>;
}

// ── BYOK (BYO API keys): client-only, stays in localStorage; sent as x-api-key header
//        and proxied by netlify/functions/chat.ts (dumb forwarder) to Anthropic/OpenAI/OpenRouter.
type ByokKeys = { anthropic: string; openai: string; openrouter: string };
const STORAGE_KEY = "open-claude-design:keys";
function useByok() {
  const [keys, setKeys] = useState<ByokKeys>({ anthropic: "", openai: "", openrouter: "" });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setKeys(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (n: ByokKeys) => {
    setKeys(n);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
  };
  return { keys, save, hasKey: Boolean(keys.anthropic || keys.openai || keys.openrouter) };
}

function ByokModal({ open, onClose, keys, onSave, t }: { open: boolean; onClose: () => void; keys: ByokKeys; onSave: (k: ByokKeys) => void; t: (typeof COPY)[Lang] }) {
  const [draft, setDraft] = useState(keys);
  useEffect(() => setDraft(keys), [keys]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-[560px] rounded-[22px] border-2 border-white bg-[#191424] p-6 shadow-[0_16px_0_rgba(0,0,0,.5),0_22px_48px_rgba(0,0,0,.5)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#6E6680] uppercase">{t.modalEyebrow}</div>
            <h2 className="mt-1 font-display text-[20px] font-[800] tracking-[-0.03em] text-[#F7F5F2]">{t.modalTitle}</h2>
            <p className="mt-1 max-w-[40ch] text-[13px] leading-5 text-[#A49CB4]">
              {t.modalBodyA} <span className="font-semibold text-[#F7F5F2]">{t.modalBodyB}</span> {t.modalBodyC} <code className="rounded bg-white/10 px-1 font-mono text-[11px]">x-api-key</code>.
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-white bg-white text-sm font-bold text-[#121212]">
            ✕
          </button>
        </div>
        <div className="mt-5 grid gap-3.5">
          {(
            [
              { k: "anthropic" as const, label: "ANTHROPIC_API_KEY", ph: "sk-ant-…", hint: "Claude 4 · Sonnet" },
              { k: "openai" as const, label: "OPENAI_API_KEY", ph: "sk-proj-…", hint: "GPT-5" },
              { k: "openrouter" as const, label: "OPENROUTER_API_KEY", ph: "sk-or-v1-…", hint: "OpenRouter — any model, misma UI" },
            ] as const
          ).map((f) => (
            <label key={f.k} className="grid gap-1.5">
              <span className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-[#A49CB4]">
                {f.label} <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-[#A49CB4]">{f.hint}</span>
              </span>
              <input
                value={draft[f.k]}
                onChange={(e) => setDraft((d) => ({ ...d, [f.k]: e.target.value }))}
                placeholder={f.ph}
                type="password"
                spellCheck={false}
                autoComplete="off"
                className="h-9 rounded-xl border-2 border-white bg-[#121212] px-3 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-[#FFD100] focus:ring-2 focus:ring-[#FFD100]/20"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-3 py-2.5 font-mono text-[10px] leading-4 tracking-wide text-white/40 uppercase">
          Tu key ≥ <span className="text-white">BYOK</span> · <code className="normal-case tracking-normal text-white/50">localStorage</code> → <code className="normal-case tracking-normal text-white/50">x-api-key</code> →{" "}
          <span className="text-white">proxy sin logs</span> → upstream. 0 % comisión.
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 rounded-full border-2 border-white bg-[#121212] px-5 font-mono text-[12px] font-bold text-white">
            {t.cancel}
          </button>
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="h-9 rounded-full border-2 border-white bg-[#FFD100] px-5 font-mono text-[12px] font-[800] text-[#121212] shadow-[0_4px_0_rgba(0,0,0,.4)]"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: "es" | "en"; setLang: (l: "es" | "en") => void }) {
  // Instant optimistic UI (setLang now) + URL as source of truth (?lang=en wins,
  // persisted by Page effect). <button> never navigates — no blank, no reload.
  return (
    <div className="grid grid-cols-2 gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 font-mono text-[10px] font-bold" role="group" aria-label="Idioma / Language">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => {
            try { localStorage.setItem("open-claude-design:lang", l); } catch {}
            setLang(l);
            try { window.history.replaceState(null, "", l === "es" ? "/" : "/?lang=en"); } catch {}
          }}
          aria-pressed={lang === l}
          data-active={lang === l ? "1" : "0"}
          className={`rounded-full px-2 py-1 uppercase tracking-wide transition-colors ${lang === l ? "bg-[#FFD100] text-[#121212]" : "text-white/40 hover:text-white"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

// FR!sky × Claude — bilingual copy deck. Sidebar keeps product Spanish labels
// (Nuevo/Proyectos/…) as the Claude-product voice; everything else toggles.
const COPY = {
  es: {
    eyebrow: "FR!sky × Claude Design · Netlify OSS · 01 — Opening",
    byokBtn: "Añadir API key", byokBtnOn: "BYOK activo", byokPill: "BYOK", byokPillOn: "BYOK ✓",
    title: "Diseño",
    ledeA: "Claude's gallery, in FR!sky's Obsidian + Hazard Yellow / Electric Cyan / Neon Amethyst. Die-cut stickers, thick white strokes, tilt —",
    ledeB: "tweaked, not cloned.",
    tabs: ["Diseños", "Sistemas de diseño"] as const,
    bannerTitle: "Claude Design ahora está aquí — con tweak FR!sky",
    bannerBody: "Claude's Presentaciones + Diseño como artefactos. Este clon respeta el layout, viste Obsidian + neones y el die-cut FR!sky.",
    adminPill: "Admin · frk_live_ keys",
    noKeyA: "Sin API key: modo demo.",
    noKeyBtn: "Añadir API key",
    noKeyB: "y pega tu",
    noKeyC: "u",
    noKeyD: "para artefactos reales. Todas las",
    noKeyE: "requieren owner JWT o",
    noKeyF: "(como Mobbin).",
    hasKey: "BYOK ✓ — keys en",
    hasKeyB: ". Prueba un prompt en",
    hasKeyC: "arriba.",
    make: "Make something new",
    act2: "· act 02 — four doors",
    pipeline: "Figma Tokens → Style Dictionary →",
    pipelineB: "· react-bits · Uiverse Galaxy → re-tokenized · aw-chip pattern on card titles.",
    pinned: "Fijados", chats: "Chats y tareas",
    supportHead: "Apoya — Keep it pup",
    byokOn: "BYOK conectado", byokOff: "BYOK sin configurar",
    benefitsHead: "Por qué usar este clon en vez de claude.ai",
    benefitsSub: "Mismo diseño Claude, pero tuyo. Con Mobbin Pro como spec y tu propia key — sin suscripción, sin lock-in.",
    modalEyebrow: "FR!sky × Claude Design · BYOK",
    modalTitle: "Tu key, tus costos",
    modalBodyA: "BYOK real: tu key vive",
    modalBodyB: "solo en localStorage",
    modalBodyC: "de tu navegador. Nunca toca nuestro servidor — el Netlify edge la reenvía con",
    modalTip: "Tip: pega al menos una. `Design in codebase` usa streaming directo.",
    cancel: "Cancelar", save: "Guardar keys",
    openFooter: "Open source · Netlify-ready · FR!sky tweak · Zeabur `mcp.zeabur.com` canonical",
    cardTitles: ["Slides", "Design", "Design in codebase", "Design System"] as const,
  },
  en: {
    eyebrow: "FR!sky × Claude Design · Netlify OSS · 01 — Opening",
    byokBtn: "Add API key", byokBtnOn: "BYOK active", byokPill: "BYOK", byokPillOn: "BYOK ✓",
    title: "Design",
    ledeA: "Claude's gallery, in FR!sky's Obsidian + Hazard Yellow / Electric Cyan / Neon Amethyst. Die-cut stickers, thick white strokes, tilt —",
    ledeB: "tweaked, not cloned.",
    tabs: ["Designs", "Design systems"] as const,
    bannerTitle: "Claude Design is here — with the FR!sky tweak",
    bannerBody: "Claude's Slides + Design as artifacts. This clone keeps the layout, wears Obsidian + neons and the FR!sky die-cut.",
    adminPill: "Admin · frk_live_ keys",
    noKeyA: "No API key: demo mode.",
    noKeyBtn: "Add API key",
    noKeyB: "and paste your",
    noKeyC: "or",
    noKeyD: "for real artifacts. Every",
    noKeyE: "needs an owner JWT or",
    noKeyF: "(like Mobbin).",
    hasKey: "BYOK ✓ — keys in",
    hasKeyB: ". Try a prompt in",
    hasKeyC: "above.",
    make: "Make something new",
    act2: "· act 02 — four doors",
    pipeline: "Figma Tokens → Style Dictionary →",
    pipelineB: "· react-bits · Uiverse Galaxy → re-tokenized · aw-chip pattern on card titles.",
    pinned: "Pinned", chats: "Chats & tasks",
    supportHead: "Support — Keep it pup",
    byokOn: "BYOK connected", byokOff: "BYOK not configured",
    benefitsHead: "Why use this clone instead of claude.ai",
    benefitsSub: "Same Claude design, but yours. Mobbin Pro as spec and your own key — no subscription, no lock-in.",
    modalEyebrow: "FR!sky × Claude Design · BYOK",
    modalTitle: "Your key, your costs",
    modalBodyA: "Real BYOK: your key lives",
    modalBodyB: "only in localStorage",
    modalBodyC: "of your browser. It never touches our server — the Netlify edge forwards it with",
    modalTip: "Tip: paste at least one. `Design in codebase` streams directly.",
    cancel: "Cancel", save: "Save keys",
    openFooter: "Open source · Netlify-ready · FR!sky tweak · Zeabur `mcp.zeabur.com` canonical",
    cardTitles: ["Slides", "Design", "Design in codebase", "Design System"] as const,
  },
} as const;
type Lang = keyof typeof COPY;

function Sidebar({ onOpenByok, hasKey, lang }: { onOpenByok: () => void; hasKey: boolean; lang: Lang }) {
  const t = COPY[lang];
  // Spec: DISENO rail 248px · Obsidian #121212 + white hairlines · 11px Mono caps · 4-supporting colors only
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-white/10 bg-[#121212]/85 backdrop-blur-xl lg:flex">
      <div className="flex h-[56px] items-center gap-2 px-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56] ring-1 ring-black/20" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" aria-hidden />
        </div>
        <div className="ml-2 flex items-center gap-1 text-white/35">
          <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-white/5 text-[10px]">◧</span>
          <span className="text-sm">←</span>
          <span className="text-sm opacity-40">→</span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={onOpenByok} className="grid h-7 w-7 place-items-center rounded-lg border-2 border-white bg-[#1c1828] text-white/75 hover:text-white" title="BYOK">
            ◈
          </button>
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 font-mono text-[9px] text-white/40">{`</>`}</span>
        </div>
      </div>
      <div className="mx-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2.5">
        <div className="font-mono text-[10px] font-[700] tracking-[0.2em] text-[#FFD100] uppercase">FR!sky — GOOD PUP. BAD BOI.</div>
        <div className="mt-0.5 font-mono text-[9px] tracking-wide text-white/35">Obsidian · Hazard Yellow · Cyan · Amethyst · FR!sky</div>
      </div>
      <nav aria-label="Principal" className="px-2 py-3 text-[13px]">
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span className="grid h-5 w-5 place-items-center rounded-md border border-white/10 bg-white/5 text-[11px]">＋</span> Nuevo
        </a>
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span aria-hidden>⧉</span> Proyectos
        </a>
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span aria-hidden>⬢</span> Artifacts
        </a>
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span aria-hidden>◷</span> Programadas
        </a>
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span aria-hidden>⛨</span> Despacho <span className="rounded-full border border-white/10 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/55">Beta</span>
        </a>
        <a className="flex items-center gap-2 rounded-lg border-2 border-white bg-[#FFD100] px-2 py-1.5 font-[800] text-[#121212]">
          <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-[#121212] bg-white text-[11px]">◐</span> Diseño
        </a>
        <a href="/admin" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1.5 text-white hover:bg-white/10">
          <span className="grid h-5 w-5 place-items-center rounded-md border-2 border-white bg-[#00E5FF] text-[11px] font-[900] text-[#121212]">◈</span> Admin{" "}
          <span className="ml-auto rounded-full bg-[#FFD100] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#121212]">MVP</span>
        </a>
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span aria-hidden>▭</span> Personalizar
        </a>
        <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/50 hover:bg-white/5 hover:text-white">
          <span aria-hidden>⌄</span> Más
        </a>
      </nav>
      <div className="px-3 pb-2 pt-4">
        <div className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">{t.pinned}</div>
        <div className="mt-2 grid gap-1 text-[13px]">
          <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/80 hover:bg-white/5">
            <span className="text-white/25">⧉</span> FOLIOS
          </a>
          <a className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white/80 hover:bg-white/5">
            <span className="text-white/25">⧉</span> G
          </a>
          <a className="flex items-center gap-2 rounded-lg px-2 py-1 text-white/40 hover:bg-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,.6)]" aria-hidden /> Casual check-in
          </a>
        </div>
      </div>
      <div className="px-3 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">{t.chats}</div>
          <div className="flex gap-1 text-white/30">
            <span className="grid h-6 w-6 place-items-center rounded-md hover:bg-white/5">⌕</span>
            <span className="grid h-6 w-6 place-items-center rounded-md hover:bg-white/5">≡</span>
          </div>
        </div>
        <div className="mt-2 grid gap-0.5 text-[12.5px] leading-6 text-white/45">
          {[
            "Unstructured documentation overview",
            "MCP endpoint security concern",
            "Simple X app information",
            "Genspark startup",
            "Security platform selection",
            "Bruma LiveKit concierge agent",
            "Zeabur deployment troubleshooting",
            "Inforge stack integration",
            "Design system sync",
          ].map((chatTitle) => (
            <a key={chatTitle} className="flex items-center gap-2 truncate rounded-lg px-2 py-0.5 hover:bg-white/5 hover:text-white/70">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-white/20" aria-hidden />{" "}
              <span className="truncate">{chatTitle}</span>
            </a>
          ))}
          <a className="mt-1 flex items-center gap-2 rounded-lg bg-[#FFD100]/10 px-2 py-1 font-mono text-[11px] tracking-wide text-[#FFD100]">
            <span className="grid h-4 w-4 place-items-center rounded-full border border-[#FFD100]/30 text-[10px]">?</span> Hermes AI
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 p-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <div className="font-mono text-[9px] tracking-[0.18em] text-white/30 uppercase">{t.supportHead}</div>
          <div className="mt-1.5">
            <SupportRailCompact />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 p-2">
        <div className="flex items-center gap-2 rounded-xl border-2 border-white bg-[#191424] px-2 py-2 shadow-[0_6px_0_rgba(0,0,0,.4)]">
          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#FFD100] text-[10px] font-[900] text-[#121212]">FP</span>
          <div className="min-w-0">
            <div className="font-display text-[12px] font-[800] leading-none tracking-[-0.02em] text-white">Frisky · Pro</div>
            <div className={`font-mono text-[10px] tracking-wide uppercase leading-none ${hasKey ? "text-[#00E5FF]" : "text-white/40"}`}>{hasKey ? t.byokOn : t.byokOff}</div>
          </div>
          <button onClick={onOpenByok} className="ml-auto grid h-7 w-7 place-items-center rounded-lg border-2 border-white bg-white text-[#121212] font-bold">
            ↓
          </button>
        </div>
      </div>
    </aside>
  );
}

function MakeCard({ title, beta, variant }: { title: string; beta?: boolean; variant: "yellow" | "cyan" | "amethyst" | "coal" }) {
  const glow: Record<string, string> = {
    yellow: "shadow-[0_0_40px_rgba(255,209,0,.22)]",
    cyan: "shadow-[0_0_40px_rgba(0,229,255,.18)]",
    amethyst: "shadow-[0_0_40px_rgba(157,0,255,.18)]",
    coal: "shadow-none",
  };
  const accent: Record<string, string> = {
    yellow: "text-[#FFD100]",
    cyan: "text-[#00E5FF]",
    amethyst: "text-[#9D00FF]",
    coal: "text-white/60",
  };
  const num = { Slides: "01", Design: "02", "Design in codebase": "03", "Design System": "04" }[title] ?? "··";
  return (
    <button type="button" className="group w-full cursor-pointer text-left" aria-label={`${title}${beta ? " (Beta)" : ""}`}>
      <div className={`sticker-hover card-sheen relative aspect-[4/3] overflow-hidden rounded-[18px] border-white bg-[#1c1828] p-2 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[#FFD100] ${glow[variant]}`}>
        <span className="absolute left-2.5 top-2 z-10 rounded-full border border-white/15 bg-black/55 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em] text-white/70 backdrop-blur" aria-hidden>{num}</span>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-black/30" aria-hidden />
        <div className="relative flex h-full items-center justify-center">
          {title === "Slides" && (
            <div className="h-[64%] w-[78%] rounded-xl border-2 border-white bg-gradient-to-br from-[#FFD100]/25 to-[#FFD100]/5 p-3 shadow-xl">
              <div className="h-3 w-12 rounded-full bg-[#FFD100]" />
              <div className="mt-2 h-2 w-10 rounded-full bg-white/20" />
              <div className="mt-1 h-2 w-8 rounded-full bg-white/10" />
              <div className="ml-auto mt-3 h-6 w-6 rounded border-2 border-white bg-white/10" />
            </div>
          )}
          {title === "Design" && (
            <div className="relative h-[70%] w-[44%] rounded-xl border-2 border-white bg-[#121212] p-2">
              <div className="space-y-2" aria-hidden>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#9D00FF]" /> <span className="h-1.5 w-8 rounded bg-white/20" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#00E5FF]" /> <span className="h-1.5 w-6 rounded bg-white/10" />
                </div>
              </div>
              <div className="absolute bottom-1 left-1 right-1 flex justify-between px-1 font-mono text-[6px] text-white/30" aria-hidden>
                ● ● ●
              </div>
            </div>
          )}
          {title === "Design in codebase" && (
            <div className="relative h-[54%] w-[62%] rounded-xl border-2 border-white bg-[#121212] p-2">
              <div className="absolute -right-2 -top-2 h-10 w-12 rounded-lg border-2 border-white bg-[#9D00FF]/40" aria-hidden />
              <div className="rounded-lg border border-white/10 bg-black px-2 py-2 font-mono text-[11px] text-[#00E5FF]">
                {`>_`}<span className="animate-pulse" aria-hidden>
                  _
                </span>
              </div>
            </div>
          )}
          {title === "Design System" && (
            <div className="flex h-[58%] w-[72%] items-center justify-center rounded-xl border-2 border-white bg-white/5 p-3">
              <div className="grid w-full gap-2" aria-hidden>
                <div className="flex gap-1.5">
                  <span className="h-4 w-4 rounded border border-white bg-[#FFD100]" />
                  <span className="h-4 w-4 rounded border border-white bg-[#00E5FF]" />
                  <span className="h-4 w-4 rounded border border-white bg-[#9D00FF]" />
                  <span className="h-4 w-4 rounded border border-white bg-white" />
                </div>
                <div className="h-2 w-12 rounded bg-white/40" />
                <div className="h-1 w-16 rounded bg-white/20" />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[13px] font-[700] tracking-[-0.02em] text-white/90 transition-colors group-hover:text-white">
        <span aria-hidden className={accent[variant]}>
          ●
        </span>{" "}
        {title} {beta && <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60">Beta</span>}
        <span aria-hidden className="ml-auto text-white/0 transition-all group-hover:translate-x-0.5 group-hover:text-[#FFD100]">→</span>
      </div>
    </button>
  );
}

function ProjectCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <article className="sticker-hover card-sheen overflow-hidden rounded-[18px] border-white bg-[#191424]">
      <div className="relative aspect-[16/10] bg-[#121212]">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-black/20" aria-hidden />
        {title === "Nocturne" && (
          <div className="absolute inset-0 bg-[#2a2436]">
            <div className="absolute inset-y-0 right-0 w-[28%] bg-white/80" aria-hidden>
              <div className="h-full w-full opacity-30" style={{ background: "linear-gradient(to bottom, #fff 25%, #9a9a9a 25% 50%, #6b6b6b 50% 75%, #4a4a4a 75%)" }} />
            </div>
            <div className="absolute bottom-3 left-3 rounded-full border-2 border-white bg-[#121212] px-2.5 py-1 font-mono text-[11px] font-bold text-white">◐ nocturne</div>
          </div>
        )}
        {title === "Code Pup" && (
          <div className="absolute inset-0 grid place-items-center bg-[#0f1a2e]">
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#00E5FF] text-sm font-black text-[#121212]">◐</span>
          </div>
        )}
        {title === "Spec files shared" && (
          <div className="absolute inset-0 bg-[#3a3740]">
            <div className="absolute left-1/2 top-1/2 h-2 w-8 -translate-x-1/2 rounded bg-white/20" aria-hidden />
          </div>
        )}
        <span className="absolute bottom-2 left-2 grid h-6 w-6 place-items-center rounded-lg border-2 border-white bg-black/70 text-[11px] text-white backdrop-blur">◐</span>
      </div>
      <div className="bg-[#191424] px-3 py-3">
        <div className="text-[13px] font-[700] tracking-[-0.02em] text-white">{title}</div>
        <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-white/40">
          <span>{subtitle.includes("Editado") ? "🔒" : "▭"}</span> <span>·</span> <span>{subtitle}</span>
        </div>
      </div>
    </article>
  );
}

export default function Page() {
  const { keys, save, hasKey } = useByok();
  const [byokOpen, setByokOpen] = useState(false);
  const [tab, setTab] = useState<"disenos" | "sistemas">("disenos");
  const [lang, setLang] = useState<"es" | "en">(() => {
    // Render-time read: query param wins instantly (no effect delay, no screenshot race).
    try {
      const q = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("lang");
      if (q === "es" || q === "en") return q;
      const saved = localStorage.getItem("open-claude-design:lang");
      if (saved === "es" || saved === "en") return saved;
    } catch {}
    return "es";
  });
  // Mount-time language: ?lang= wins (shared links), then saved preference, then browser.
  // After mount, ONLY the toggle changes lang (optimistic setLang + replaceState).
  // No polling — a poll would clobber the user's click with a stale read.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("lang");
      if (q === "es" || q === "en") { setLang(q); localStorage.setItem("open-claude-design:lang", q); return; }
      const saved = localStorage.getItem("open-claude-design:lang");
      if (saved === "es" || saved === "en") { setLang(saved); return; }
      if (navigator.language?.startsWith("en")) setLang("en");
    } catch {}
  }, []);
  const t = COPY[lang];
  return (
    <div className="min-h-screen p-0 sm:p-3">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] overflow-hidden rounded-none border-white/10 bg-black/40 backdrop-blur-sm sm:min-h-[calc(100vh-24px)] sm:rounded-[22px] sm:border-2">
        <Sidebar onOpenByok={() => setByokOpen(true)} hasKey={hasKey} lang={lang} />
        <main className="min-w-0 flex-1 bg-[#0B0B0F]/70">
          <div className="flex h-[52px] items-center gap-2 border-b border-white/10 px-4 sm:hidden">
            <span className="font-display text-sm font-[800] tracking-[-0.02em] text-white">FR!sky · {lang === "es" ? "Diseño" : "Design"}</span>
            <span className="ml-auto"><LangToggle lang={lang} setLang={setLang} /></span>
            <button
              onClick={() => setByokOpen(true)}
              className={`rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide ${hasKey ? "border-white bg-[#FFD100] text-[#121212]" : "border-white/20 bg-white/5 text-white/60"}`}
            >
              {hasKey ? t.byokPillOn : t.byokPill}
            </button>
          </div>
          <div className="px-5 py-6 sm:px-8 sm:py-7">
            {/* opening shot: eyebrow tc → title bloom → lede rises · FR!sky voice, Framer-grade */}
            <div className="reveal flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" style={{ ["--reveal-delay" as string]: "60ms" }}>
              <div>
                <div className="reveal flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] text-[#FFD100] uppercase" style={{ ["--reveal-delay" as string]: "0ms" }}>
                  <span className="breathe inline-block h-1.5 w-1.5 rounded-full bg-[#00E5FF]" aria-hidden />
                  <span className="neon neon-yellow neon-glow" aria-hidden={false}>FR!sky</span>
                  <span className="text-white/50">× Claude Design · Netlify OSS · 01 — Opening</span>
                </div>
                <h1 className="reveal title-glow font-display text-[56px] font-[800] leading-[0.9] tracking-[-0.055em] text-white sm:text-[88px]" style={{ ["--reveal-delay" as string]: "120ms" }}>
                  {t.title}
                  <span className="neon neon-cyan neon-glow text-[#00E5FF]" style={{ ["--flicker-delay" as string]: "1.4s" }} aria-hidden>.</span>
                </h1>
                <p className="reveal mt-3 max-w-xl text-[14px] leading-6 text-[#A49CB4]" style={{ ["--reveal-delay" as string]: "220ms" }}>
                  {t.ledeA}{" "}
                  <span className="font-semibold text-white">{t.ledeB}</span>
                </p>
                <div className="reveal mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] tracking-[0.14em] uppercase" style={{ ["--reveal-delay" as string]: "280ms" }}>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/60">MIT · fork it</span>
                  <span className="h-3 w-px bg-white/10" aria-hidden />
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/60">BYOK · $3/1M</span>
                  <span className="h-3 w-px bg-white/10" aria-hidden />
                  <span className="neon neon-yellow neon-soft rounded-full border-[#FFD100]/30 bg-[#FFD100]/10 px-2.5 py-1 text-[#FFD100]">frk_live_ gate</span>
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <LangToggle lang={lang} setLang={setLang} />
                <button
                  onClick={() => setByokOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-[#FFD100] px-3 py-1.5 font-mono text-xs font-[800] tracking-wide text-[#121212] hover:bg-[#FFE04D]"
                >
                <span className={`h-2 w-2 rounded-full border border-[#121212] ${hasKey ? "bg-[#00E5FF]" : "bg-white/40"}`} aria-hidden />{" "}
                {hasKey ? t.byokBtnOn : t.byokBtn}
                </button>
              </div>
            </div>
            <div className="reveal mt-6 flex items-center justify-between gap-3" style={{ ["--reveal-delay" as string]: "300ms" }}>
              <div className="flex items-center gap-1 rounded-full border-2 border-white bg-[#191424] p-1">
                <button
                  onClick={() => setTab("disenos")}
                  className={`press rounded-full px-3 py-1.5 font-mono text-[13px] font-bold ${tab === "disenos" ? "bg-[#FFD100] text-[#121212]" : "text-white/50 hover:text-white"}`}
                >
                  {t.tabs[0]}
                </button>
                <button
                  onClick={() => setTab("sistemas")}
                  className={`press rounded-full px-3 py-1.5 font-mono text-[13px] ${tab === "sistemas" ? "bg-white text-[#121212]" : "text-white/50 hover:text-white"}`}
                >
                  {t.tabs[1]} <span className="opacity-60" aria-hidden>
                    →
                  </span>
                </button>
              </div>
              <div className="hidden items-center gap-1 text-white/30 sm:flex">
                <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">⌕</button>
                <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">≡</button>
              </div>
            </div>
            <div className="reveal card-sheen mt-6 rounded-[18px] border-2 border-white bg-[#191424] p-4 shadow-[0_10px_0_rgba(0,0,0,.45)] sm:p-6" style={{ ["--reveal-delay" as string]: "380ms" }}>
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#FFD100] text-[11px] text-[#121212]">◐</span>{" "}
                <span className="neon neon-cyan neon-glow font-mono text-[10px] tracking-[0.24em] text-[#00E5FF] uppercase">Live · Netlify OSS</span>
              </div>
              <div className="mt-2 font-display text-[22px] font-[800] leading-tight tracking-[-0.03em] text-white sm:text-[26px]">
                {t.bannerTitle}
              </div>
              <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-[#A49CB4]">{t.bannerBody}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href="/admin" className="press inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[#00E5FF] px-4 py-2 font-mono text-[11px] font-[800] tracking-wide text-[#121212] shadow-[0_0_28px_rgba(0,229,255,0.35)]">
                  {t.adminPill} <span aria-hidden>→</span>
                </Link>
                <a href="https://friskydev.com" target="_blank" rel="noreferrer" className="press inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[#FFD100] px-3 py-1.5 font-mono text-[11px] font-[800] tracking-wide text-[#121212]">
                  friskydev.com <span aria-hidden>↗</span>
                </a>
                <a href="https://github.com/FriskyDevelopments/open-claude-design" target="_blank" rel="noreferrer" className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 font-mono text-[11px] font-bold text-white/80 hover:border-white/40 hover:text-white">
                  Ver repo <span aria-hidden>↗</span>
                </a>
              </div>
              {!hasKey ? (
                <div className="mt-3 rounded-xl border border-[#FFD100]/30 bg-[#FFD100]/10 px-3 py-2 font-mono text-[11px] leading-5 tracking-wide text-[#FFD100]/90">
                  {t.noKeyA}{" "}
                  <button onClick={() => setByokOpen(true)} className="underline decoration-[#FFD100]/40 underline-offset-2">
                    {t.noKeyBtn}
                  </button>{" "}
                  {t.noKeyB} <code>ANTHROPIC_API_KEY</code> {t.noKeyC} <code>OPENROUTER_API_KEY</code> {t.noKeyD} <code>tools/call</code> {t.noKeyE}{" "}
                  <code>frk_live_…</code> {t.noKeyF}
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] tracking-wide text-emerald-200">
                  {t.hasKey} <code>localStorage</code>.{t.hasKeyB} <span className="font-bold">Design in codebase</span> {t.hasKeyC}
                </div>
              )}
            </div>
            {/* ticker: the studio signal, always moving — pure FR!sky voice */}
            <div className="reveal mt-6 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] py-2" style={{ ["--reveal-delay" as string]: "430ms" }} aria-hidden>
              <div className="ticker-track flex w-max items-center gap-8 whitespace-nowrap font-mono text-[10px] tracking-[0.22em] text-white/35 uppercase">
                {Array.from({ length: 2 }).map((_, dup) => (
                  <span key={dup} className="flex items-center gap-8">
                    <span>FR!sky × Claude Design</span><span className="neon neon-yellow neon-soft text-[#FFD100]">●</span>
                    <span>BYOK — tu key, tus costos</span><span className="neon neon-cyan neon-soft text-[#00E5FF]" style={{ ["--flicker-delay" as string]: "2s" }}>●</span>
                    <span>Admin · frk_live_ keys</span><span className="neon neon-amethyst neon-soft text-[#9D00FF]" style={{ ["--flicker-delay" as string]: "4s" }}>●</span>
                    <span>Mobbin platform: ios|web fixed</span><span className="neon neon-yellow neon-soft text-[#FFD100]" style={{ ["--flicker-delay" as string]: "5.5s" }}>●</span>
                    <span>Netlify 1-click · Sin backend</span><span className="neon neon-cyan neon-soft text-[#00E5FF]" style={{ ["--flicker-delay" as string]: "7s" }}>●</span>
                    <span>1440px proof — breathtaking or it doesn&apos;t ship</span><span className="neon neon-amethyst neon-soft text-[#9D00FF]" style={{ ["--flicker-delay" as string]: "8.5s" }}>●</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="act-rule" aria-hidden><i /></div>
            {/* act 02: the four doors rise one after another */}
            <RevealSection className="mt-8" cascade>
              <div className="font-mono text-[11px] tracking-[0.24em] text-white/35 uppercase">
                {t.make} <span className="ml-2 text-[#FFD100]/60">{t.act2}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <MakeCard title="Slides" beta variant="yellow" />
                <MakeCard title="Design" beta variant="amethyst" />
                <MakeCard title="Design in codebase" variant="cyan" />
                <MakeCard title="Design System" variant="coal" />
              </div>
              <p className="mt-2 font-mono text-[10px] tracking-wide text-white/30">
                {t.pipeline} <code className="text-white/50">src/app/globals.css</code>{t.pipelineB}
              </p>
            </RevealSection>
            {/* act 03: the gallery wall settles in */}
            <div className="act-rule" aria-hidden><i /></div>
            <RevealSection className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" cascade>
              <ProjectCard title="Nocturne" subtitle={lang === "es" ? "Visto hace 52 min" : "Viewed 52 min ago"} />
              <ProjectCard title="Code Pup" subtitle={lang === "es" ? "Editado anteayer" : "Edited the day before"} />
              <ProjectCard title="Spec files shared" subtitle={lang === "es" ? "Visto hace 19 h" : "Viewed 19 h ago"} />
              <div className="sticker-hover overflow-hidden rounded-[18px] border-white bg-[#191424]">
                <div className="relative aspect-[16/10] bg-black p-4">
                  <div className="absolute inset-0 grid place-items-center opacity-60" aria-hidden>
                    <span className="font-display text-5xl font-black tracking-tighter text-white">F</span>
                  </div>
                  <div className="relative font-mono text-[11px] leading-3 text-white/40">
                    <div className="font-display text-[13px] font-[800] tracking-[-0.02em] text-white">Fausto</div>
                    <div className="mt-1 max-w-[55%] text-[8px] leading-3">Una F de folio con esquina doblada. El anillo + halo comunican el estado.</div>
                    <div className="mt-3 inline rounded-full border-2 border-white bg-[#FFD100] px-2 py-1 font-mono text-[8px] font-[800] tracking-wide text-[#121212]">Reposo</div>
                  </div>
                </div>
                <div className="px-3 py-3">
                  <div className="text-[13px] font-[700] tracking-[-0.02em] text-white">Fausto · FOLIOS</div>
                  <div className="font-mono text-[11px] tracking-wide text-white/40">Sistema de marca</div>
                </div>
              </div>
              <div className="sticker-hover overflow-hidden rounded-[18px] border-white bg-[#191424]">
                <div className="relative aspect-[16/10] bg-[#0a0a0f] p-2">
                  <div className="grid h-full grid-cols-3 gap-2">
                    <div className="rounded-xl border-2 border-white bg-[#121212] p-2">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-black font-mono text-[10px] font-bold text-[#FFD100]">MR</div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/5" />
                    <div className="rounded-xl border border-white/15 bg-white/5" />
                  </div>
                </div>
                <div className="px-3 py-3">
                  <div className="text-[13px] font-[700] tracking-[-0.02em] text-white">Bruma · Concierge</div>
                  <div className="font-mono text-[11px] tracking-wide text-white/40">LiveKit agent</div>
                </div>
              </div>
              <div className="sticker-hover overflow-hidden rounded-[18px] border-white bg-[#191424]">
                <div className="relative grid aspect-[16/10] place-items-center bg-[#121212]">
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-[#9D00FF] shadow-[0_0_20px_rgba(157,0,255,.5)]" aria-hidden />
                  <div className="absolute bottom-6 font-display text-[13px] font-[800] italic tracking-[-0.02em] text-white">Bruma</div>
                </div>
                <div className="px-3 py-3">
                  <div className="text-[13px] font-[700] tracking-[-0.02em] text-white">Bruma</div>
                  <div className="font-mono text-[11px] tracking-wide text-white/40">Design system sync</div>
                </div>
              </div>
            </RevealSection>
            <div className="act-rule" aria-hidden><i /></div>
            {/* act 04: the money shot */}
            <RevealSection className="mt-10">
              <div className="font-mono text-[10px] tracking-[0.24em] text-white/30 uppercase">{lang === "es" ? "Act 04 — " : "Act 04 — "}<span className="neon neon-amethyst neon-glow text-[#9D00FF]">{lang === "es" ? "el dinero, no el por ciento" : "the money, not the percent"}</span></div>
              <h2 className="title-glow mt-1 font-display text-[15px] font-[800] tracking-wide text-white">{t.benefitsHead}</h2>
              <p className="mt-1 max-w-2xl font-mono text-[11px] leading-5 tracking-wide text-white/40 uppercase">{t.benefitsSub}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { k: "BYOK · Tu key, tus costos", d: "Pega tu ANTHROPIC / OPENAI / OPENROUTER key. Solo localStorage, nunca servidor. Por token, no $20/mes.", icon: "◈", c: "#FFD100" },
                  { k: "Privacidad total", d: "Zero storage. Netlify Function es dumb proxy. Tus prompts no se loguean, no hay DB.", icon: "⛨", c: "#00E5FF" },
                  { k: "Cualquier modelo, mismo diseño", d: "Claude Design sobre GPT-5 o Gemini vía OpenRouter. Cambia de modelo, no de UI.", icon: "⬢", c: "#9D00FF" },
                  { k: "Open source · Tuyo", d: "MIT. Forkea, rebrandéa, hostea en Netlify/Vercel. Tweak FR!sky incluido.", icon: "〈〉", c: "#FFD100" },
                  { k: "De Mobbin a código real", d: "Mobbin Pro es solo referencia. Esto lo convierte en repo productivo: gallery + canvas.", icon: "◐", c: "#00E5FF" },
                  { k: "Netlify 1-click · Sin backend", d: "netlify.toml + @netlify/plugin-nextjs. Deploy 60s, sin envs, sin server.", icon: "⬡", c: "#9D00FF" },
                ].map((b) => (
                  <div key={b.k} className="sticker-hover rounded-[18px] border-white bg-[#191424] p-4">
                    <div className="flex items-center gap-2 text-[12px] font-[800] tracking-[-0.02em] text-white">
                      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[11px]" style={{ background: b.c, color: "#121212" }}>
                        {b.icon}
                      </span>{" "}
                      {b.k}
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-white/50">{b.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-[11px] leading-4 tracking-wide text-white/40 uppercase">
                  <span className="font-bold text-white">vs claude.ai $20/mes:</span> pagas solo lo que consumes. 1M Sonnet ~$3.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-[11px] leading-4 tracking-wide text-white/40 uppercase">
                  <span className="font-bold text-white">vs Mobbin:</span> Mobbin PNG → <span className="text-white">repo</span> + canvas con tu key.
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-[11px] leading-4 tracking-wide text-white/40 uppercase">
                  <span className="font-bold text-white">Para equipos:</span> tu agencia hostea; cada cliente BYOK — sin bill compartido.
                </div>
              </div>
            </RevealSection>
            <div className="mt-8 rounded-xl border-2 border-white bg-[#191424] px-4 py-4 shadow-[0_8px_0_rgba(0,0,0,.4)]">
              <div className="font-mono text-[11px] tracking-[0.2em] text-[#FFD100] uppercase">Open source · Netlify-ready · FR!sky tweak · Zeabur `mcp.zeabur.com` canonical</div>
              <p className="mt-1 max-w-3xl text-[12px] leading-5 text-white/50">
                Clon del tab <span className="font-bold text-white">Diseño</span> de claude.ai. Layout de Claude, piel FR!sky: Obsidian{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-white">#121212</code>, Hazard Yellow{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-white">#FFD100</code> · Neon. BYOK{" "}
                <code className="rounded bg-white/10 px-1 font-mono text-white">localStorage → x-api-key → netlify/functions/chat.ts</code> (no storage).{" "}
                <Link href="/admin" className="font-bold text-white underline decoration-white/20 underline-offset-2">
                  Admin Center
                </Link>{" "}
                mint <code className="rounded bg-white/10 px-1 font-mono text-white">frk_live_…</code> (como Mobbin gated). Netlify 1-click; Zeabur es el MCP canónico.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="https://app.netlify.com/start/deploy?repository=https://github.com/friskypup/open-claude-design" target="_blank" rel="noreferrer" className="rounded-full border-2 border-white bg-[#FFD100] px-4 py-1.5 font-mono text-xs font-[800] tracking-wide text-[#121212] shadow-[0_4px_0_rgba(0,0,0,.5)]">
                  Deploy to Netlify
                </a>
                <button onClick={() => setByokOpen(true)} className="rounded-full border-2 border-white bg-white px-4 py-1.5 font-mono text-xs font-bold text-[#121212]">
                  Probar BYOK
                </button>
                <Link href="/admin" className="rounded-full border-2 border-white bg-[#00E5FF] px-4 py-1.5 font-mono text-xs font-[800] tracking-wide text-[#121212]">
                  {t.adminPill}
                </Link>
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs tracking-wide text-white/40">Next.js 16 · Tailwind 4 · 1440px proof</span>
              </div>
            </div>
            <div className="mt-6">
              <SupportFooterStrip />
            </div>
          </div>
        </main>
      </div>
      <ByokModal open={byokOpen} onClose={() => setByokOpen(false)} keys={keys} onSave={save} t={t} />
    </div>
  );
}
