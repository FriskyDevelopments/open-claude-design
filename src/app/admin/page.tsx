"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/storage";
import { SiteFooter } from "@/components/SiteFooter";

type ApiKeyRecord = {
  id: string;
  prefix: string;
  secret: string;
  name: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
};

const ADMIN_AUTH_KEY = "open-claude-design:owner-auth";
const ADMIN_KEYS_KEY = "open-claude-design:admin-keys";
const OWNER_PASSWORD = "frisky-owner";

const TOOL_SCOPES = [
  { id: "frisky.mcp", label: "frisky.mcp — all tools" },
  { id: "mobbin:read", label: "mobbin:read — Mobbin screens/flows/sections" },
  { id: "memory:read", label: "memory:read — Frisky memory + specialists" },
  { id: "github:read", label: "github:read — allowlisted repos" },
  { id: "model:live", label: "model:live — DashScope / OpenRouter live call" },
];

function makeKey(): { prefix: string; secret: string; display: string } {
  // Local demo only: real frk_live_ keys are issued by the hosted MCP and stored hashed server-side.
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const body = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  const secret = `frk_live_${body}`;
  const prefix = `frk_live_${body.slice(0, 8)}…${body.slice(-4)}`;
  return { prefix, secret, display: secret };
}

export default function AdminPage() {
  const [authRaw, setAuthRaw] = useLocalStorage(ADMIN_AUTH_KEY);
  const [keysRaw, setKeysRaw] = useLocalStorage(ADMIN_KEYS_KEY);
  const authed = authRaw === "true";
  const setAuthed = (v: boolean) => setAuthRaw(v ? "true" : null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const keys = useMemo<ApiKeyRecord[]>(() => {
    try {
      return keysRaw ? (JSON.parse(keysRaw) as ApiKeyRecord[]) : [];
    } catch {
      return [];
    }
  }, [keysRaw]);
  const [newName, setNewName] = useState("MVP — open-claude-design");
  const [newScopes, setNewScopes] = useState<string[]>(["frisky.mcp"]);
  const [newExpiry, setNewExpiry] = useState<"30d" | "90d" | "never">("30d");
  const [justCreated, setJustCreated] = useState<ApiKeyRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const persistKeys = (next: ApiKeyRecord[]) => {
    setKeysRaw(JSON.stringify(next));
  };

  const handleLogin = () => {
    if (password === OWNER_PASSWORD) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Wrong demo password. It is shown above: frisky-owner");
    }
  };

  const handleCreate = () => {
    const { prefix, secret } = makeKey();
    const now = new Date();
    const expiresAt =
      newExpiry === "never" ? null : new Date(now.getTime() + (newExpiry === "30d" ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString();
    const rec: ApiKeyRecord = {
      id: crypto.randomUUID(),
      prefix,
      secret,
      name: newName.trim() || "Untitled key",
      scopes: newScopes,
      createdAt: now.toISOString(),
      expiresAt,
      revokedAt: null,
    };
    const next = [rec, ...keys];
    persistKeys(next);
    setJustCreated(rec);
    setNewName(`Key ${next.length + 1}`);
  };

  const revoke = (id: string) => {
    const next = keys.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k));
    persistKeys(next);
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  if (!authed) {
    return (
      <div className="min-h-screen p-0 sm:p-3">
        <div className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col items-center justify-center rounded-none border-white/10 bg-black/40 backdrop-blur-sm sm:min-h-[calc(100vh-24px)] sm:rounded-[22px] sm:border-2">
          <div className="w-full max-w-[520px] rounded-[22px] border-2 border-white bg-[#191424] p-6 shadow-[0_16px_0_rgba(0,0,0,.55),0_22px_60px_rgba(0,0,0,.55)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-white bg-[#FFD100] text-[#121212] font-[900]">◐</span>
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#00E5FF] uppercase">FR!SKY DESIGN · LOCAL KEY DEMO</div>
                <h1 className="font-[800] text-[20px] tracking-tight text-white" style={{ fontFamily: "var(--font-bricolage)" }}>
                  Key manager demo
                </h1>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-[#A49CB4]">
              Local UI demo, nothing here touches a server. Demo password is <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#121212]">frisky-owner</code>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="font-mono text-[10px] tracking-wide text-white/40 uppercase">Access</div>
                <div className="text-[11px] font-bold text-white">Frisky private gate</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="font-mono text-[10px] tracking-wide text-white/40 uppercase">Role</div>
                <div className="text-[11px] font-bold text-white">owner only (MVP)</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="font-mono text-[10px] tracking-wide text-white/40 uppercase">Return</div>
                <div className="text-[11px] font-bold text-white">back to gallery</div>
              </div>
            </div>
            <label className="mt-5 grid gap-1.5">
              <span className="font-mono text-[11px] tracking-wide text-[#A49CB4]">Owner password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                type="password"
                placeholder="••••••••"
                className="h-10 rounded-xl border-2 border-white bg-[#121212] px-3 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-[#FFD100]"
              />
            </label>
            {authError && <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-200">{authError}</div>}
            <div className="mt-4 flex gap-2">
              <button onClick={handleLogin} className="h-10 flex-1 rounded-full border-2 border-white bg-[#FFD100] px-4 font-mono text-[12px] font-[800] tracking-wide text-[#121212]">
                Sign in · Owner
              </button>
              <Link href="/" className="grid h-10 place-items-center rounded-full border-2 border-white bg-white px-5 font-mono text-[12px] font-bold text-[#121212]">
                Back
              </Link>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-4 tracking-wide text-white/30 uppercase">
              Demo only: everything here lives in your browser (localStorage) and gates nothing on a server. Real <code>frk_live_</code> keys come from the hosted MCP and are stored hashed there.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div className="min-h-screen p-0 sm:p-3">
      <div className="mx-auto w-full max-w-[1120px] rounded-none border-white/10 bg-black/40 backdrop-blur-sm sm:rounded-[22px] sm:border-2">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid h-8 w-8 place-items-center rounded-lg border-2 border-white bg-white text-[#121212] font-bold">
              ←
            </Link>
            <div>
              <div className="font-mono text-[10px] tracking-[0.22em] text-[#00E5FF] uppercase">ADMIN CENTER · API KEYS</div>
              <h1 className="font-[800] text-[16px] tracking-tight text-white" style={{ fontFamily: "var(--font-bricolage)" }}>
                API Keys — <span className="text-[#FFD100]">frk_live_…</span> <span className="font-mono text-[10px] tracking-wide text-white/40 uppercase">(MVP · local)</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 font-mono text-[10px] font-bold tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> owner · local
            </span>
            <button
              onClick={() => {
                setAuthed(false);
                setPassword("");
              }}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] font-bold text-white/70 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-[18px] border-2 border-white bg-[#191424] p-4 shadow-[0_10px_0_rgba(0,0,0,.45)]">
            <h2 className="font-[800] text-[13px] tracking-tight text-white" style={{ fontFamily: "var(--font-bricolage)" }}>
              Create API key
            </h2>
            <p className="mt-1 font-mono text-[11px] leading-4 text-white/40 uppercase">Hashed at rest in production · copy once now</p>

            <label className="mt-4 grid gap-1.5">
              <span className="font-mono text-[11px] tracking-wide text-white/60">Key name</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 rounded-xl border-2 border-white bg-[#121212] px-3 text-[13px] text-white outline-none focus:border-[#FFD100]"
                placeholder="e.g. Figma importer"
              />
            </label>

            <div className="mt-4">
              <div className="font-mono text-[11px] tracking-wide text-white/60">Scopes — every tool checks this before invoke</div>
              <div className="mt-2 grid gap-2">
                {TOOL_SCOPES.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/[0.08]">
                    <input
                      type="checkbox"
                      checked={newScopes.includes(s.id)}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setNewScopes((prev) => (on ? [...prev, s.id] : prev.filter((x) => x !== s.id)));
                      }}
                      className="h-4 w-4 accent-[#FFD100]"
                    />
                    <span className="font-mono text-[11px] font-bold tracking-wide text-white">{s.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 font-mono text-[10px] leading-4 text-white/30 uppercase">Gateway does <code className="text-white/60">gateToolCall → evaluateToolPolicy</code> before every <code className="text-white/60">tools/call</code>. Unknown tool = deny.</p>
            </div>

            <div className="mt-4">
              <div className="font-mono text-[11px] tracking-wide text-white/60">Expiry</div>
              <div className="mt-2 flex gap-2">
                {(["30d", "90d", "never"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setNewExpiry(v)}
                    className={`flex-1 rounded-full border-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-wide ${newExpiry === v ? "border-white bg-[#FFD100] text-[#121212]" : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"}`}
                  >
                    {v === "never" ? "never" : v}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCreate} disabled={newScopes.length === 0} className="mt-5 h-9 w-full rounded-full border-2 border-white bg-[#FFD100] font-mono text-[12px] font-[800] tracking-wide text-[#121212] disabled:opacity-40">
              Create key — frk_live_…
            </button>

            {justCreated && (
              <div className="mt-4 rounded-xl border-2 border-[#FFD100] bg-[#FFD100]/10 p-3">
                <div className="font-mono text-[10px] font-bold tracking-wide text-[#FFD100] uppercase">Copy now — shown once</div>
                <div className="mt-1 break-all rounded-lg border border-white/15 bg-[#121212] px-2 py-2 font-mono text-[11px] font-bold text-white">{justCreated.secret}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => copy(justCreated.secret, justCreated.id)} className="flex-1 rounded-full border-2 border-white bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-[#121212]">
                    {copied === justCreated.id ? "Copied ✓" : "Copy"}
                  </button>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] tracking-wide text-white/40">{justCreated.prefix}</span>
                </div>
                <p className="mt-2 font-mono text-[10px] leading-4 text-[#FFD100]/70 uppercase">Use as <code className="text-[#FFD100]">Authorization: Bearer frk_live_…</code> on <code className="text-[#FFD100]">mcp.zeabur.com/mcp</code> after cutover. Production stores only <code>sha256</code>.</p>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="font-[800] text-[13px] tracking-tight text-white" style={{ fontFamily: "var(--font-bricolage)" }}>
                Keys — all tools protected like Mobbin
              </h2>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] tracking-wide text-white/40 uppercase">
                {activeKeys.length} active · {revokedKeys.length} revoked
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] leading-4 text-white/40 uppercase">Every <code className="text-white/60">tools/call</code> without owner JWT or valid <code className="text-white/60">frk_live_</code> → <code className="text-red-300">401 Frisky Client Access login required</code>. Audit: <code>memory_audit_v2</code>.</p>

            {keys.length === 0 ? (
              <div className="mt-4 rounded-[18px] border-2 border-dashed border-white/15 bg-white/5 p-6 text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-[#191424] text-white">◐</div>
                <div className="mt-3 font-[800] text-[13px] text-white" style={{ fontFamily: "var(--font-bricolage)" }}>
                  No keys yet — create your first
                </div>
                <div className="mt-1 font-mono text-[11px] text-white/40 uppercase">Demo keys live in localStorage only. Hosted keys are HMAC-hashed in D1.</div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {keys.map((k) => (
                  <div key={k.id} className={`rounded-[18px] border-2 bg-[#191424] p-3 ${k.revokedAt ? "border-white/10 opacity-60" : "border-white shadow-[0_6px_0_rgba(0,0,0,.35)]"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`grid h-7 w-7 place-items-center rounded-full border-2 text-[11px] font-[900] ${k.revokedAt ? "border-white/15 bg-white/5 text-white/40" : "border-white bg-[#FFD100] text-[#121212]"}`}>{k.revokedAt ? "✕" : "◈"}</span>
                      <div className="min-w-0">
                        <div className="truncate font-[700] text-[12px] tracking-tight text-white">{k.name}</div>
                        <div className="font-mono text-[10px] tracking-wide text-white/40">
                          {k.prefix} · {k.scopes.join(" · ")} · {new Date(k.createdAt).toLocaleDateString()} {k.expiresAt ? `→ ${new Date(k.expiresAt).toLocaleDateString()}` : "· never"} {k.revokedAt ? "· revoked" : ""}
                        </div>
                      </div>
                      <div className="ml-auto flex gap-1.5">
                        {!k.revokedAt && (
                          <>
                            <button onClick={() => copy(k.secret, k.id)} className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold text-white/70 hover:bg-white/10">
                              {copied === k.id ? "Copied" : "Copy secret"}
                            </button>
                            <button onClick={() => revoke(k.id)} className="rounded-full border-2 border-white bg-white px-2.5 py-1 font-mono text-[10px] font-bold text-[#121212]">
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-xl border-2 border-white bg-[#191424] p-4">
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#FFD100] uppercase">Real keys</div>
              <p className="mt-2 font-mono text-[11px] leading-5 text-white/50">
                This page is a UI demo of the key flow (name, scopes, expiry, copy once, revoke). Real <code className="text-white">frk_live_</code> keys for the hosted MCP are issued after checkout and verified server-side. See the README section &quot;Connect the hosted MCP&quot;.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href="/" className="rounded-full border-2 border-white bg-[#FFD100] px-4 py-1.5 font-mono text-[11px] font-[800] tracking-wide text-[#121212]">
                  Back to gallery
                </Link>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] tracking-wide text-white/40">Next.js 16 · Tailwind 4</span>
              </div>
            </div>
            <SiteFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
