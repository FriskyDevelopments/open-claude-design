"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const rand = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  const body = (rand() + rand()).slice(0, 32);
  const secret = `frk_live_${body}`;
  const prefix = `frk_live_${body.slice(0, 8)}…${body.slice(-4)}`;
  return { prefix, secret, display: secret };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [newName, setNewName] = useState("MVP — open-claude-design");
  const [newScopes, setNewScopes] = useState<string[]>(["frisky.mcp"]);
  const [newExpiry, setNewExpiry] = useState<"30d" | "90d" | "never">("30d");
  const [justCreated, setJustCreated] = useState<ApiKeyRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const a = localStorage.getItem(ADMIN_AUTH_KEY);
      if (a === "true") setAuthed(true);
      const raw = localStorage.getItem(ADMIN_KEYS_KEY);
      if (raw) setKeys(JSON.parse(raw));
    } catch {}
  }, []);

  const persistKeys = (next: ApiKeyRecord[]) => {
    setKeys(next);
    localStorage.setItem(ADMIN_KEYS_KEY, JSON.stringify(next));
  };

  const handleLogin = () => {
    if (password === OWNER_PASSWORD) {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Wrong owner password. Hint for MVP: frisky-owner");
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
                <div className="font-mono text-[10px] tracking-[0.22em] text-[#00E5FF] uppercase">FRISKY DEV MCP · ADMIN CENTER</div>
                <h1 className="font-[800] text-[20px] tracking-tight text-white" style={{ fontFamily: "var(--font-bricolage)" }}>
                  Frisky Dev Client Access
                </h1>
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-5 text-[#A49CB4]">
              Owner / admin only. Same trust gate as the MCP gateway. MVP password is <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-[#121212]">frisky-owner</code>
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
              MVP note: auth is localStorage-gated. Production will use Supabase + <code>FRISKY_SUPABASE_OWNER_EMAILS</code> + audited JWT, same as <code>/oauth/authorize</code>.
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
                localStorage.removeItem(ADMIN_AUTH_KEY);
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
                <div className="mt-1 font-mono text-[11px] text-white/40 uppercase">MVP stores in localStorage. Production: Mongo <code>api_keys_v2</code> + D1 <code>toolPolicy</code>.</div>
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
              <div className="font-mono text-[10px] tracking-[0.2em] text-[#FFD100] uppercase">MVP → Production path</div>
              <ul className="mt-2 list-disc pl-5 font-mono text-[11px] leading-5 text-white/50">
                <li>
                  Mobbin fix: re-add <code className="text-white">platform?: enum(&quot;ios&quot;,&quot;web&quot;) default &quot;web&quot;</code> to <code className="text-white">mobbin_search_*</code> proxy tools in <code className="text-white">frisky-gpt-mcp</code> before Zeabur cutover.
                </li>
                <li>Zeabur canonical: refresh <code className="text-white">zat_</code> via <code className="text-white">zeabur auth login</code> → bind <code className="text-white">open-claude-design</code> to <code className="text-white">untitled-2</code> → <code className="text-white">mcp.friskydev.com</code> CNAME → <code className="text-white">*.zeabur.app</code>.</li>
                <li>Netlify OSS: <code className="text-white">LICENSE MIT</code> + live URL + apply at <code className="text-white">netlify.com/open-source</code> for Pro perks.</li>
              </ul>
              <div className="mt-3 flex gap-2">
                <Link href="/" className="rounded-full border-2 border-white bg-[#FFD100] px-4 py-1.5 font-mono text-[11px] font-[800] tracking-wide text-[#121212]">
                  Back to gallery
                </Link>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] tracking-wide text-white/40">Next.js 16 · Tailwind 4 · breathtaking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
