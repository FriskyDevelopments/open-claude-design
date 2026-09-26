"use client";

import { useEffect, useRef, useState } from "react";

const REPO_URL = "https://github.com/FriskyDevelopments/open-claude-design";
const SUBSCRIBE_URL = "https://frisky-lists.hrgrrtks2p.workers.dev/subscribe";
const STORE_KEY = "frisky-design:popout";
const DISMISS_DAYS = 14;
const DELAY_MS = 40_000;
const SCROLL_RATIO = 0.6;

type Stored = { until: number };

function snoozed(): boolean {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return false;
    return Date.now() < (JSON.parse(raw) as Stored).until;
  } catch {
    return false;
  }
}

function snooze(days: number) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ until: Date.now() + days * 86_400_000 } satisfies Stored));
  } catch {}
}

/**
 * Corner toast: appears after ~40s or 60% scroll, asks for a star and
 * (optionally) an email for release notes. Dismissal is remembered for 14 days.
 * `?popout=1` forces it open (for screenshots and testing).
 */
export function StarPopout() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot, humans never see it
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const shown = useRef(false);

  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get("popout") === "1";
    if (!force && snoozed()) return;
    const show = () => {
      if (shown.current) return;
      shown.current = true;
      setOpen(true);
    };
    if (force) {
      const id = window.setTimeout(show, 300);
      return () => window.clearTimeout(id);
    }
    const timer = window.setTimeout(show, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= SCROLL_RATIO) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      snooze(DISMISS_DAYS);
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    snooze(DISMISS_DAYS);
    setOpen(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    try {
      const res = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), list: "open-claude-design", source: "popout", website }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      snooze(180);
    } catch {
      setState("error");
    }
  }

  if (!open) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="star-popout-title"
      data-testid="star-popout"
      className="star-popout fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] rounded-[18px] border-2 border-white bg-[#191424] p-4 text-white shadow-[0_10px_0_rgba(0,0,0,.45),0_20px_50px_rgba(0,0,0,.5)]"
    >
      <button type="button" onClick={close} aria-label="Close" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-white text-xs font-bold text-[#121212]">
        ✕
      </button>
      <div className="font-mono text-[10px] tracking-[0.22em] text-[#00E5FF] uppercase">FR!SKY Design</div>
      <h2 id="star-popout-title" className="mt-1 pr-8 font-display text-[16px] font-[800] leading-snug tracking-[-0.02em]">
        Finding it useful? A star helps other people find it.
      </h2>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        onClick={() => snooze(180)}
        className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-white bg-[#FFD100] px-4 py-1.5 font-mono text-[12px] font-[800] text-[#121212]"
      >
        <span aria-hidden>★</span> Star on GitHub
      </a>
      {state === "done" ? (
        <p className="mt-3 font-mono text-[11px] text-emerald-300" role="status">
          Thanks. Check your inbox to confirm.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-3 grid gap-2">
          <label htmlFor="star-popout-email" className="font-mono text-[11px] text-[#A49CB4]">
            Release notes by email (optional, unsubscribe anytime)
          </label>
          <div className="flex gap-2">
            <input
              id="star-popout-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-9 min-w-0 flex-1 rounded-xl border-2 border-white bg-[#121212] px-3 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-[#FFD100]"
            />
            <button type="submit" disabled={state === "sending"} className="h-9 rounded-xl border-2 border-white bg-white px-3 font-mono text-[12px] font-bold text-[#121212] disabled:opacity-60">
              {state === "sending" ? "…" : "Notify me"}
            </button>
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden />
          {state === "error" && (
            <p className="font-mono text-[11px] text-red-300" role="alert">
              Could not subscribe right now. Try again later.
            </p>
          )}
        </form>
      )}
    </aside>
  );
}
