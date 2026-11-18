"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ARTIFACT_KINDS, artifactSystemPrompt, extractHtml, isArtifactKind, renderArtifact, type ArtifactKind } from "../../../mcp/artifacts.ts";
import { DEFAULT_MODELS, type Provider } from "../../../mcp/providers.ts";
import { useByok } from "@/lib/byok";
import { SiteFooter } from "@/components/SiteFooter";
import { StarPopout } from "@/components/StarPopout";

const KIND_LABEL: Record<ArtifactKind, string> = { slides: "Slides", design: "Design", codebase: "Design in codebase", "design-system": "Design system" };
const PROMPTS: Record<ArtifactKind, string> = {
  slides: "A three-slide pitch for a dog-walking app",
  design: "Landing page for an indie design tool",
  codebase: "A pill button component with a loading state",
  "design-system": "Token sheet for a neon night-mode brand",
};

async function generate(provider: Provider, apiKey: string, kind: ArtifactKind, prompt: string): Promise<string> {
  const system = artifactSystemPrompt(kind);
  const model = DEFAULT_MODELS[provider];
  const body =
    provider === "anthropic"
      ? { model, max_tokens: 4096, system, messages: [{ role: "user", content: prompt }] }
      : { model, max_tokens: 4096, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] };
  const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json", "x-api-key": apiKey, "x-provider": provider }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || data?.error || `HTTP ${res.status}`);
  const out = provider === "anthropic" ? (data.content || []).map((b: { text?: string }) => b.text || "").join("") : data.choices?.[0]?.message?.content || "";
  return extractHtml(out);
}

export function CanvasApp() {
  const params = useSearchParams();
  const initialKind = isArtifactKind(params.get("kind")) ? (params.get("kind") as ArtifactKind) : "design";
  const { keys, hasKey } = useByok();
  const [kind, setKind] = useState<ArtifactKind>(initialKind);
  const [prompt, setPrompt] = useState(PROMPTS[initialKind]);
  const [html, setHtml] = useState(() => renderArtifact(initialKind, { prompt: PROMPTS[initialKind] }));
  const [view, setView] = useState<"preview" | "code">("preview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const provider = useMemo<Provider | null>(() => (keys.anthropic ? "anthropic" : keys.openai ? "openai" : keys.openrouter ? "openrouter" : null), [keys]);

  const pickKind = (k: ArtifactKind) => {
    setKind(k);
    setPrompt(PROMPTS[k]);
    setHtml(renderArtifact(k, { prompt: PROMPTS[k] }));
    setError("");
    try { window.history.replaceState(null, "", `/canvas?kind=${k}`); } catch {}
  };

  const run = async () => {
    setError("");
    if (!provider) {
      setHtml(renderArtifact(kind, { prompt }));
      return;
    }
    setBusy(true);
    try {
      setHtml(await generate(provider, keys[provider], kind, prompt));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-artifact.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-0 sm:p-3">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col overflow-hidden rounded-none border-white/10 bg-black/40 backdrop-blur-sm sm:min-h-[calc(100vh-24px)] sm:rounded-[22px] sm:border-2">
        <header className="flex h-[56px] items-center gap-3 border-b border-white/10 px-4">
          <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-bold text-white/70 hover:text-white">
            ← Gallery
          </Link>
          <span className="font-display text-[15px] font-[800] tracking-[-0.02em] text-white">
            FR!SKY Design <span className="text-white/40">/ canvas</span>
          </span>
          <nav className="ml-auto flex flex-wrap gap-1 rounded-full border-2 border-white bg-[#191424] p-1" aria-label="Artifact kind">
            {ARTIFACT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => pickKind(k)}
                aria-pressed={kind === k}
                className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ${kind === k ? "bg-[#FFD100] text-[#121212]" : "text-white/55 hover:text-white"}`}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </nav>
        </header>
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[360px_1fr]">
          <section className="flex flex-col gap-3 border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
            <div className="font-mono text-[10px] tracking-[0.22em] text-[#00E5FF] uppercase">Prompt</div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              aria-label="Prompt"
              className="rounded-xl border-2 border-white bg-[#121212] p-3 text-[13px] leading-5 text-white outline-none focus:border-[#FFD100]"
            />
            <button
              type="button"
              onClick={run}
              disabled={busy}
              className="press h-10 rounded-full border-2 border-white bg-[#FFD100] font-mono text-[12px] font-[800] tracking-wide text-[#121212] disabled:opacity-60"
            >
              {busy ? "Generating…" : provider ? `Generate with ${provider}` : "Render starter (demo mode)"}
            </button>
            <p className="font-mono text-[10px] leading-4 tracking-wide text-white/40">
              {hasKey
                ? `BYOK: your ${provider} key stays in this browser and goes through /api/chat. Model: ${provider ? DEFAULT_MODELS[provider] : ""}.`
                : "Demo mode renders a starter artifact. Add an API key on the gallery page to generate from your prompt."}
            </p>
            {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-200" role="alert">{error}</div>}
            <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-3 font-mono text-[10px] leading-4 text-white/45">
              Same tools in your editor: connect the MCP (<code className="text-white/70">scaffold_artifact</code>, <code className="text-white/70">generate_artifact</code>, <code className="text-white/70">get_design_tokens</code>).
            </div>
          </section>
          <section className="flex min-h-[520px] flex-col">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
              <div className="flex gap-1 rounded-full border border-white/15 bg-white/5 p-0.5">
                {(["preview", "code"] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold capitalize ${view === v ? "bg-white text-[#121212]" : "text-white/50"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[10px] tracking-wide text-white/35">{KIND_LABEL[kind]} artifact</span>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(html)} className="rounded-full border border-white/20 px-3 py-1 font-mono text-[11px] text-white/70 hover:text-white">Copy HTML</button>
                <button type="button" onClick={download} className="rounded-full border-2 border-white bg-[#00E5FF] px-3 py-1 font-mono text-[11px] font-[800] text-[#121212]">Download</button>
              </div>
            </div>
            <div className="flex-1 bg-[#0B0B0F] p-3">
              {view === "preview" ? (
                <iframe title="Artifact preview" data-testid="artifact-frame" sandbox="allow-scripts" srcDoc={html} className="h-full min-h-[480px] w-full rounded-[14px] border-2 border-white bg-[#121212]" />
              ) : (
                <pre className="h-full min-h-[480px] overflow-auto rounded-[14px] border-2 border-white bg-black p-4 font-mono text-[12px] leading-5 text-[#00E5FF]">{html}</pre>
              )}
            </div>
          </section>
        </div>
        <div className="px-4">
          <SiteFooter />
        </div>
      </div>
      <StarPopout />
    </div>
  );
}
