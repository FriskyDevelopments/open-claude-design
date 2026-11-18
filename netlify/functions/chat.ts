/**
 * Netlify Function: BYOK proxy at /api/chat (same logic as the Cloudflare Worker).
 * Stateless; the key arrives per request and is never stored.
 */
import type { Config } from "@netlify/functions";
import { proxyChat } from "../../mcp/chat-proxy.ts";

const handler = async (request: Request) => proxyChat(request);
export default handler;

export const config: Config = { path: "/api/chat" };
