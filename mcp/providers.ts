/**
 * BYOK model calls. The key is supplied by whoever runs the code: the browser
 * (localStorage, forwarded per request) or the self-hosted MCP (env vars).
 * Nothing here stores a key.
 */
export type Provider = "anthropic" | "openai" | "openrouter";
export const PROVIDERS: Provider[] = ["anthropic", "openai", "openrouter"];

export const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: "claude-sonnet-4-5",
  openai: "gpt-5-mini",
  openrouter: "anthropic/claude-sonnet-4.5",
};

export const UPSTREAM: Record<Provider, string> = {
  anthropic: "https://api.anthropic.com/v1/messages",
  openai: "https://api.openai.com/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

export function isProvider(v: unknown): v is Provider {
  return typeof v === "string" && (PROVIDERS as string[]).includes(v);
}

/** Build the upstream request headers for a provider. */
export function upstreamHeaders(provider: Provider, apiKey: string, referer?: string): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json" };
  if (provider === "anthropic") {
    h["x-api-key"] = apiKey;
    h["anthropic-version"] = "2023-06-01";
  } else {
    h.authorization = `Bearer ${apiKey}`;
    if (provider === "openrouter") {
      if (referer) h["HTTP-Referer"] = referer;
      h["X-Title"] = "FR!SKY Design";
    }
  }
  return h;
}

/** One-shot completion: system + user prompt in, text out. */
export async function complete(opts: {
  provider: Provider;
  apiKey: string;
  system: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
  fetchImpl?: typeof fetch;
}): Promise<string> {
  const f = opts.fetchImpl ?? fetch;
  const model = opts.model || DEFAULT_MODELS[opts.provider];
  const maxTokens = opts.maxTokens ?? 4096;
  const body =
    opts.provider === "anthropic"
      ? { model, max_tokens: maxTokens, system: opts.system, messages: [{ role: "user", content: opts.prompt }] }
      : { model, max_tokens: maxTokens, messages: [{ role: "system", content: opts.system }, { role: "user", content: opts.prompt }] };
  const res = await f(UPSTREAM[opts.provider], { method: "POST", headers: upstreamHeaders(opts.provider, opts.apiKey), body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = (data.error as { message?: string } | undefined)?.message || `HTTP ${res.status}`;
    throw new Error(`${opts.provider} error: ${err}`);
  }
  if (opts.provider === "anthropic") {
    const content = (data.content as Array<{ type: string; text?: string }>) || [];
    return content.filter((b) => b.type === "text").map((b) => b.text || "").join("");
  }
  const choices = (data.choices as Array<{ message?: { content?: string } }>) || [];
  return choices[0]?.message?.content || "";
}
