import { describe, expect, it } from "vitest";
import { proxyChat } from "../mcp/chat-proxy.ts";

const req = (headers: Record<string, string>, body = "{}", method = "POST") => new Request("https://app.example/api/chat", { method, headers, body: method === "GET" ? undefined : body });

describe("BYOK chat proxy", () => {
  it("requires a key", async () => {
    expect((await proxyChat(req({}))).status).toBe(401);
  });
  it("blocks cross-origin callers", async () => {
    expect((await proxyChat(req({ origin: "https://evil.example", "x-api-key": "k" }))).status).toBe(403);
  });
  it("rejects unknown providers and non-JSON", async () => {
    expect((await proxyChat(req({ "x-api-key": "k", "x-provider": "nope" }))).status).toBe(400);
    expect((await proxyChat(req({ "x-api-key": "k" }, "not json"))).status).toBe(400);
  });
  it("forwards to Anthropic with the right headers", async () => {
    let seen: { url: string; headers: Headers } | null = null;
    const fetchImpl = (async (url: string, init: RequestInit) => {
      seen = { url, headers: new Headers(init.headers) };
      return new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } });
    }) as unknown as typeof fetch;
    const res = await proxyChat(req({ origin: "https://app.example", "x-api-key": "sk-ant-test" }), fetchImpl);
    expect(res.status).toBe(200);
    expect(seen!.url).toBe("https://api.anthropic.com/v1/messages");
    expect(seen!.headers.get("x-api-key")).toBe("sk-ant-test");
    expect(seen!.headers.get("anthropic-version")).toBe("2023-06-01");
  });
});
