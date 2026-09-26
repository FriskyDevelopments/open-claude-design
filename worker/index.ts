/**
 * Cloudflare Worker for self-hosting FR!SKY Design.
 *   /api/chat  BYOK proxy (same-origin only)
 *   /mcp       self-hosted MCP (core tools)
 *   *          static app from ./out (Workers static assets)
 */
import { proxyChat } from "../mcp/chat-proxy.ts";
import { handleMcpHttp } from "../mcp/server.ts";
import { createCoreServer, keysFromEnv, type CoreContext } from "../mcp/tools.ts";

export interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  /** Optional bearer token for /mcp. Model keys are only used when this is set. */
  MCP_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}

const server = createCoreServer();

function timingSafeEqual(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") return proxyChat(request);

    if (url.pathname === "/mcp") {
      const token = env.MCP_TOKEN;
      if (token) {
        const auth = request.headers.get("authorization") || "";
        const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (!timingSafeEqual(given, token)) {
          return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json", "www-authenticate": 'Bearer realm="mcp"' } });
        }
      }
      // Never spend the operator's model key on an unauthenticated endpoint.
      const ctx: CoreContext = { keys: token ? keysFromEnv(env as unknown as Record<string, unknown>) : {} };
      return handleMcpHttp(request, server, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};

export default worker;
