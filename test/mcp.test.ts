import { describe, expect, it } from "vitest";
import { createCoreServer, handleMcpHttp, LATEST_PROTOCOL_VERSION, type JsonRpcResponse } from "../mcp/index.ts";

const server = createCoreServer();
const call = (method: string, params?: Record<string, unknown>, keys = {}) =>
  server.handle({ jsonrpc: "2.0", id: 1, method, params }, { keys }) as Promise<JsonRpcResponse>;

describe("MCP core", () => {
  it("initializes and negotiates the protocol version", async () => {
    const res = await call("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } });
    expect(res.result).toMatchObject({ protocolVersion: "2025-06-18", serverInfo: { name: "frisky-design" }, capabilities: { tools: {} } });
    const unknown = await call("initialize", { protocolVersion: "1999-01-01" });
    expect((unknown.result as { protocolVersion: string }).protocolVersion).toBe(LATEST_PROTOCOL_VERSION);
  });

  it("lists the core tools", async () => {
    const res = await call("tools/list");
    const names = (res.result as { tools: { name: string }[] }).tools.map((t) => t.name);
    expect(names).toEqual(["list_gallery", "get_design_tokens", "scaffold_artifact", "generate_artifact"]);
  });

  it("scaffolds an HTML artifact", async () => {
    const res = await call("tools/call", { name: "scaffold_artifact", arguments: { kind: "slides", title: "Hello <b>" } });
    const content = (res.result as { content: { resource: { text: string } }[] }).content[0];
    expect(content.resource.text).toContain("<!doctype html>");
    expect(content.resource.text).toContain("Hello &lt;b&gt;");
  });

  it("returns tool errors instead of throwing", async () => {
    const res = await call("tools/call", { name: "scaffold_artifact", arguments: {} });
    expect(res.result).toMatchObject({ isError: true });
    const gen = await call("tools/call", { name: "generate_artifact", arguments: { prompt: "x" } });
    expect(gen.result).toMatchObject({ isError: true });
  });

  it("calls the BYOK provider when a key is configured", async () => {
    const fetchImpl = (async () =>
      new Response(JSON.stringify({ content: [{ type: "text", text: "```html\n<!doctype html><p>hi</p>\n```" }] }), { status: 200 })) as typeof fetch;
    const res = (await server.handle(
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "generate_artifact", arguments: { prompt: "hi" } } },
      { keys: { anthropic: "sk-test" }, fetchImpl },
    )) as JsonRpcResponse;
    expect(JSON.stringify(res.result)).toContain("<!doctype html><p>hi</p>");
  });

  it("rejects unknown methods and ignores notifications", async () => {
    expect((await call("nope")).error?.code).toBe(-32601);
    expect(await server.handle({ jsonrpc: "2.0", method: "notifications/initialized" }, { keys: {} })).toBeNull();
  });

  it("speaks Streamable HTTP", async () => {
    const post = (body: unknown) => handleMcpHttp(new Request("https://x/mcp", { method: "POST", body: JSON.stringify(body) }), server, { keys: {} });
    expect((await post({ jsonrpc: "2.0", method: "notifications/initialized" })).status).toBe(202);
    const batch = await post([{ jsonrpc: "2.0", id: 1, method: "ping" }, { jsonrpc: "2.0", id: 2, method: "tools/list" }]);
    expect(batch.status).toBe(200);
    expect(((await batch.json()) as unknown[]).length).toBe(2);
    expect((await handleMcpHttp(new Request("https://x/mcp"), server, { keys: {} })).status).toBe(405);
  });
});
