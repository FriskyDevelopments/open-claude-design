"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SupportFooterStrip, SupportRailCompact } from "@/components/SupportRail";

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

function ByokModal({ open, onClose, keys, onSave }: { open: boolean; onClose: () => void; keys: ByokKeys; onSave: (k: ByokKeys) => void }) {
  const [draft, setDraft] = useState(keys);
  useEffect(() => setDraft(keys), [keys]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-[560px] rounded-[22px] border-2 border-white bg-[#191424] p-6 shadow-[0_16px_0_rgba(0,0,0,.5),0_22px_48px_rgba(0,0,0,.5)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#6E6680] uppercase">PUPFR!SKY × Claude Design · BYOK</div>
            <h2 className="mt-1 font-display text-[20px] font-[800] tracking-[-0.03em] text-[#F7F5F2]">Tu key, tus costos</h2>
            <p className="mt-1 max-w-[40ch] text-[13px] leading-5 text-[#A49CB4]">
              BYOK real: tu key vive <span className="font-semibold text-[#F7F5F2]">solo en localStorage</span> de tu navegador. Nunca toca nuestro servidor — el
              Netlify edge la reenvía con <code className="rounded bg-white/10 px-1 font-mono text-[11px]">x-api-key</code>.
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
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="h-9 rounded-full border-2 border-white bg-[#FFD100] px-5 font-mono text-[12px] font-[800] text-[#121212] shadow-[0_4px_0_rgba(0,0,0,.4)]"
          >
            Guardar keys
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ onOpenByok, hasKey }: { onOpenByok: () => void; hasKey: boolean }) {
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
        <div className="font-mono text-[10px] font-[700] tracking-[0.2em] text-[#FFD100] uppercase">PUPFR!SKY — GOOD PUP. BAD BOI.</div>
        <div className="mt-0.5 font-mono text-[9px] tracking-wide text-white/35">Obsidian · Hazard Yellow · Cyan · Amethyst</div>
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
        <div className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">Fijados</div>
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
          <div className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">Chats y tareas</div>
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
          ].map((t) => (
            <a key={t} className="flex items-center gap-2 truncate rounded-lg px-2 py-0.5 hover:bg-white/5 hover:text-white/70">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-white/20" aria-hidden />{" "}
              <span className="truncate">{t}</span>
            </a>
          ))}
          <a className="mt-1 flex items-center gap-2 rounded-lg bg-[#FFD100]/10 px-2 py-1 font-mono text-[11px] tracking-wide text-[#FFD100]">
            <span className="grid h-4 w-4 place-items-center rounded-full border border-[#FFD100]/30 text-[10px]">?</span> Hermes AI
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 p-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <div className="font-mono text-[9px] tracking-[0.18em] text-white/30 uppercase">Apoya — Keep it pup</div>
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
            <div className={`font-mono text-[10px] tracking-wide uppercase leading-none ${hasKey ? "text-[#00E5FF]" : "text-white/40"}`}>{hasKey ? "BYOK conectado" : "BYOK sin configurar"}</div>
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
  return (
    <div className="group w-full text-left">
      <div className={`sticker-hover relative aspect-[4/3] overflow-hidden rounded-[18px] border-white bg-[#1c1828] p-2 ${glow[variant]}`}>
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
      <div className="mt-2 flex items-center gap-1.5 text-[13px] font-[700] tracking-[-0.02em] text-white/90">
        <span aria-hidden className={accent[variant]}>
          ●
        </span>{" "}
        {title} {beta && <span className="rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60">Beta</span>}
      </div>
    </div>
  );
}

function ProjectCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="sticker-hover overflow-hidden rounded-[18px] border-white bg-[#191424]">
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
    </div>
  );
}

export default function Page() {
  const { keys, save, hasKey } = useByok();
  const [byokOpen, setByokOpen] = useState(false);
  const [tab, setTab] = useState<"disenos" | "sistemas">("disenos");
  return (
    <div className="min-h-screen p-0 sm:p-3">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] overflow-hidden rounded-none border-white/10 bg-black/40 backdrop-blur-sm sm:min-h-[calc(100vh-24px)] sm:rounded-[22px] sm:border-2">
        <Sidebar onOpenByok={() => setByokOpen(true)} hasKey={hasKey} />
        <main className="min-w-0 flex-1 bg-[#0B0B0F]/70">
          <div className="flex h-[52px] items-center gap-2 border-b border-white/10 px-4 sm:hidden">
            <span className="font-display text-sm font-[800] tracking-[-0.02em] text-white">PUPFR!SKY · Diseño</span>
            <button
              onClick={() => setByokOpen(true)}
              className={`ml-auto rounded-full border-2 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide ${hasKey ? "border-white bg-[#FFD100] text-[#121212]" : "border-white/20 bg-white/5 text-white/60"}`}
            >
              {hasKey ? "BYOK ✓" : "BYOK"}
            </button>
          </div>
          <div className="px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#FFD100] uppercase">PUPFR!SKY × Claude Design</div>
                <h1 className="font-display text-[30px] font-[800] tracking-[-0.04em] text-white sm:text-[36px]">Diseño</h1>
                <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#A49CB4]">
                  Claude&apos;s gallery, in PUPFR!SKY&apos;s Obsidian + Hazard Yellow / Electric Cyan / Neon Amethyst. Die-cut stickers, thick white strokes, tilt —{" "}
                  <span className="text-white">tweaked, not cloned.</span>
                </p>
              </div>
              <button
                onClick={() => setByokOpen(true)}
                className="hidden items-center gap-2 rounded-full border-2 border-white bg-[#FFD100] px-3 py-1.5 font-mono text-xs font-[800] tracking-wide text-[#121212] hover:bg-[#FFE04D] sm:inline-flex"
              >
                <span className={`h-2 w-2 rounded-full border border-[#121212] ${hasKey ? "bg-[#00E5FF]" : "bg-white/40"}`} aria-hidden />{" "}
                {hasKey ? "BYOK activo" : "Añadir API key"}
              </button>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-full border-2 border-white bg-[#191424] p-1">
                <button
                  onClick={() => setTab("disenos")}
                  className={`rounded-full px-3 py-1.5 font-mono text-[13px] font-bold ${tab === "disenos" ? "bg-[#FFD100] text-[#121212]" : "text-white/50 hover:text-white"}`}
                >
                  Diseños
                </button>
                <button
                  onClick={() => setTab("sistemas")}
                  className={`rounded-full px-3 py-1.5 font-mono text-[13px] ${tab === "sistemas" ? "bg-white text-[#121212]" : "text-white/50 hover:text-white"}`}
                >
                  Sistemas de diseño <span className="opacity-60" aria-hidden>
                    →
                  </span>
                </button>
              </div>
              <div className="hidden items-center gap-1 text-white/30 sm:flex">
                <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">⌕</button>
                <button className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10">≡</button>
              </div>
            </div>
            <div className="mt-6 rounded-[18px] border-2 border-white bg-[#191424] p-4 shadow-[0_10px_0_rgba(0,0,0,.45)] sm:p-5">
              <div className="flex items-center gap-2 font-display text-[13px] font-[800] tracking-[-0.02em] text-white">
                <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#FFD100] text-[11px] text-[#121212]">◐</span>{" "}
                Claude Design ahora está aquí — con tweak PUPFR!SKY
              </div>
              <p className="mt-1 text-[13px] leading-5 text-[#A49CB4]">Claude&apos;s Presentaciones + Diseño como artefactos. Este clon respeta el layout, viste Obsidian + neones y el die-cut de pupfrisky.com.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/admin" className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[#00E5FF] px-3 py-1.5 font-mono text-[11px] font-[800] tracking-wide text-[#121212]">
                  Admin · frk_live_ keys
                </Link>
                <a href="https://pupfrisky.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-[#FFD100] px-3 py-1.5 font-mono text-[11px] font-[800] tracking-wide text-[#121212]">
                  pupfrisky.com <span aria-hidden>↗</span>
                </a>
                <a href="https://github.com/friskypup/open-claude-design" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border-2 border-white bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-[#121212]">
                  Ver repo <span aria-hidden>↗</span>
                </a>
              </div>
              {!hasKey ? (
                <div className="mt-3 rounded-xl border border-[#FFD100]/30 bg-[#FFD100]/10 px-3 py-2 font-mono text-[11px] leading-5 tracking-wide text-[#FFD100]/90">
                  Sin API key: modo demo.{" "}
                  <button onClick={() => setByokOpen(true)} className="underline decoration-[#FFD100]/40 underline-offset-2">
                    Añadir API key
                  </button>{" "}
                  y pega tu <code>ANTHROPIC_API_KEY</code> u <code>OPENROUTER_API_KEY</code> para artefactos reales. Todas las <code>tools/call</code> requieren owner JWT o{" "}
                  <code>frk_live_…</code> (como Mobbin).
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] tracking-wide text-emerald-200">
                  BYOK ✓ — keys en <code>localStorage</code>. Prueba un prompt en <span className="font-bold">Design in codebase</span> arriba.
                </div>
              )}
            </div>
            <div className="mt-8">
              <div className="font-mono text-[11px] tracking-[0.2em] text-white/35 uppercase">Make something new</div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <MakeCard title="Slides" beta variant="yellow" />
                <MakeCard title="Design" beta variant="amethyst" />
                <MakeCard title="Design in codebase" variant="cyan" />
                <MakeCard title="Design System" variant="coal" />
              </div>
              <p className="mt-2 font-mono text-[10px] tracking-wide text-white/30">
                Figma Tokens → Style Dictionary → <code className="text-white/50">src/app/globals.css</code> · react-bits · Uiverse Galaxy → re-tokenized · aw-chip pattern on card titles.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProjectCard title="Nocturne" subtitle="Visto hace 52 min" />
              <ProjectCard title="Code Pup" subtitle="Editado anteayer" />
              <ProjectCard title="Spec files shared" subtitle="Visto hace 19 h" />
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
            </div>
            <div className="mt-10">
              <h2 className="font-display text-[13px] font-[800] tracking-wide text-white">Por qué usar este clon en vez de claude.ai</h2>
              <p className="mt-1 max-w-2xl font-mono text-[11px] leading-5 tracking-wide text-white/40 uppercase">Mismo diseño Claude, pero tuyo. Con Mobbin Pro como spec y tu propia key — sin suscripción, sin lock-in.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { k: "BYOK · Tu key, tus costos", d: "Pega tu ANTHROPIC / OPENAI / OPENROUTER key. Solo localStorage, nunca servidor. Por token, no $20/mes.", icon: "◈", c: "#FFD100" },
                  { k: "Privacidad total", d: "Zero storage. Netlify Function es dumb proxy. Tus prompts no se loguean, no hay DB.", icon: "⛨", c: "#00E5FF" },
                  { k: "Cualquier modelo, mismo diseño", d: "Claude Design sobre GPT-5 o Gemini vía OpenRouter. Cambia de modelo, no de UI.", icon: "⬢", c: "#9D00FF" },
                  { k: "Open source · Tuyo", d: "MIT. Forkea, rebrandéa, hostea en Netlify/Vercel. Tweak PUPFR!SKY incluido.", icon: "〈〉", c: "#FFD100" },
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
            </div>
            <div className="mt-8 rounded-xl border-2 border-white bg-[#191424] px-4 py-4 shadow-[0_8px_0_rgba(0,0,0,.4)]">
              <div className="font-mono text-[11px] tracking-[0.2em] text-[#FFD100] uppercase">Open source · Netlify-ready · PUPFR!SKY tweak · Zeabur `mcp.zeabur.com` canonical</div>
              <p className="mt-1 max-w-3xl text-[12px] leading-5 text-white/50">
                Clon del tab <span className="font-bold text-white">Diseño</span> de claude.ai. Layout de Claude, piel de pupfrisky.com: Obsidian{" "}
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
                  Admin · frk_live_ keys
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
      <ByokModal open={byokOpen} onClose={() => setByokOpen(false)} keys={keys} onSave={save} />
    </div>
  );
}
