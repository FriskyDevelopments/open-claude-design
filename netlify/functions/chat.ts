/**
 * Netlify Function — BYOK proxy
 * Client sends: x-api-key + x-provider (anthropic|openai|openrouter) + body
 * Server never stores keys. Just forwards to upstream with streaming.
 * Works as fallback if you want server-side streaming; primary path is
 * client-side localStorage (no server needed). Keep this for open-source repo
 * so Deploys on Netlify work even with strict CSP.
 */
import type { Handler } from "@netlify/functions";

const UPSTREAM: Record<string, { url: string; header: string }> = {
  anthropic: { url: "https://api.anthropic.com/v1/messages", header: "x-api-key" },
  openai: { url: "https://api.openai.com/v1/chat/completions", header: "Authorization" },
  openrouter: { url: "https://openrouter.ai/api/v1/chat/completions", header: "Authorization" },
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(), body: "Method not allowed" };
  }

  const apiKey = event.headers["x-api-key"] || event.headers["X-Api-Key"];
  const provider = (event.headers["x-provider"] as string) || "anthropic";
  if (!apiKey) return { statusCode: 401, headers: cors(), body: JSON.stringify({ error: "Missing x-api-key. Set it in the UI (BYOK)." }) };

  const target = UPSTREAM[provider];
  if (!target) return { statusCode: 400, headers: cors(), body: "Unknown x-provider" };

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (provider === "anthropic") {
    upstreamHeaders["x-api-key"] = apiKey;
    upstreamHeaders["anthropic-version"] = "2023-06-01";
  } else {
    upstreamHeaders["Authorization"] = `Bearer ${apiKey}`;
    if (provider === "openrouter") upstreamHeaders["HTTP-Referer"] = event.headers.referer || "https://open-claude-design.netlify.app";
  }

  const res = await fetch(target.url, {
    method: "POST",
    headers: upstreamHeaders,
    body: event.body || "{}",
  });

  const contentType = res.headers.get("content-type") || "application/json";
  const body = await res.text();
  return {
    statusCode: res.status,
    headers: { ...cors(), "content-type": contentType },
    body,
  };
};

function cors() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Content-Type, x-api-key, x-provider, Authorization",
    "access-control-allow-methods": "POST, OPTIONS",
  };
}
