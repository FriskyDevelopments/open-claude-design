/**
 * BYOK chat proxy shared by the Cloudflare Worker (/api/chat) and the
 * Netlify Function. Stateless: the key arrives per request in `x-api-key`,
 * is forwarded upstream and never stored or logged.
 *
 * Only same-origin browser requests are accepted, so a deployment cannot be
 * used as an open relay by other sites.
 */
import { UPSTREAM, isProvider, upstreamHeaders } from "./providers.ts";

const MAX_BODY = 256 * 1024;

export async function proxyChat(request: Request, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  if (request.method !== "POST") return json(405, { error: "Method not allowed" });

  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin) return json(403, { error: "Cross-origin requests are not allowed" });

  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return json(401, { error: "Missing x-api-key. Add your key in the app (BYOK)." });
  const provider = request.headers.get("x-provider") || "anthropic";
  if (!isProvider(provider)) return json(400, { error: "Unknown x-provider" });

  const body = await request.text();
  if (body.length > MAX_BODY) return json(413, { error: "Request too large" });
  try {
    JSON.parse(body || "{}");
  } catch {
    return json(400, { error: "Body must be JSON" });
  }

  const upstream = await fetchImpl(UPSTREAM[provider], { method: "POST", headers: upstreamHeaders(provider, apiKey, url.origin), body: body || "{}" });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") || "application/json", "cache-control": "no-store" },
  });
}
