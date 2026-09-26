/**
 * Minimal, dependency-free MCP server core (JSON-RPC 2.0 over Streamable HTTP
 * or stdio). Runs on Cloudflare Workers, Node 22+ and in tests.
 *
 * The open source build registers the core tools from ./tools.ts. Other
 * builds can register more tools on the same server.
 */
export const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"] as const;
export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

export type JsonSchema = { type: "object"; properties?: Record<string, unknown>; required?: string[]; additionalProperties?: boolean };
export type ToolContent = { type: "text"; text: string } | { type: "resource"; resource: { uri: string; mimeType?: string; text: string } };
export type ToolResult = { content: ToolContent[]; structuredContent?: Record<string, unknown>; isError?: boolean };
export type ToolAnnotations = { title?: string; readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };

export type ToolContext<C = unknown> = { ctx: C; signal?: AbortSignal };
export type Tool<C = unknown> = {
  name: string;
  title?: string;
  description: string;
  inputSchema: JsonSchema;
  annotations?: ToolAnnotations;
  handler: (args: Record<string, unknown>, tc: ToolContext<C>) => Promise<ToolResult> | ToolResult;
};

type JsonRpcId = string | number | null;
export type JsonRpcRequest = { jsonrpc: "2.0"; id?: JsonRpcId; method: string; params?: Record<string, unknown> };
export type JsonRpcResponse = { jsonrpc: "2.0"; id: JsonRpcId; result?: unknown; error?: { code: number; message: string; data?: unknown } };

export const RPC = { PARSE: -32700, INVALID_REQUEST: -32600, METHOD_NOT_FOUND: -32601, INVALID_PARAMS: -32602, INTERNAL: -32603 } as const;

export function text(t: string): ToolResult {
  return { content: [{ type: "text", text: t }] };
}
export function json(data: Record<string, unknown>): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
}
export function toolError(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

export class McpServer<C = unknown> {
  readonly info: { name: string; title?: string; version: string };
  readonly instructions?: string;
  private tools = new Map<string, Tool<C>>();

  constructor(opts: { name: string; title?: string; version: string; instructions?: string; tools?: Tool<C>[] }) {
    this.info = { name: opts.name, title: opts.title, version: opts.version };
    this.instructions = opts.instructions;
    for (const t of opts.tools ?? []) this.register(t);
  }

  register(tool: Tool<C>): this {
    this.tools.set(tool.name, tool);
    return this;
  }

  listTools(): Omit<Tool<C>, "handler">[] {
    return [...this.tools.values()].map((t) => ({ name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: t.annotations }));
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /** Handle one JSON-RPC message. Returns null for notifications. */
  async handle(msg: unknown, ctx: C, signal?: AbortSignal): Promise<JsonRpcResponse | null> {
    if (!msg || typeof msg !== "object" || (msg as JsonRpcRequest).jsonrpc !== "2.0" || typeof (msg as JsonRpcRequest).method !== "string") {
      return { jsonrpc: "2.0", id: null, error: { code: RPC.INVALID_REQUEST, message: "Invalid Request" } };
    }
    const req = msg as JsonRpcRequest;
    const isNotification = req.id === undefined;
    const ok = (result: unknown): JsonRpcResponse => ({ jsonrpc: "2.0", id: req.id ?? null, result });
    const fail = (code: number, message: string, data?: unknown): JsonRpcResponse => ({ jsonrpc: "2.0", id: req.id ?? null, error: { code, message, ...(data === undefined ? {} : { data }) } });

    if (isNotification) return null; // notifications/initialized, cancelled, etc.

    try {
      switch (req.method) {
        case "initialize": {
          const requested = String(req.params?.protocolVersion ?? "");
          const protocolVersion = (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(requested) ? requested : LATEST_PROTOCOL_VERSION;
          return ok({
            protocolVersion,
            capabilities: { tools: { listChanged: false } },
            serverInfo: this.info,
            ...(this.instructions ? { instructions: this.instructions } : {}),
          });
        }
        case "ping":
          return ok({});
        case "tools/list":
          return ok({ tools: this.listTools() });
        case "tools/call": {
          const name = req.params?.name;
          const args = (req.params?.arguments ?? {}) as Record<string, unknown>;
          if (typeof name !== "string") return fail(RPC.INVALID_PARAMS, "Missing tool name");
          const tool = this.tools.get(name);
          if (!tool) return fail(RPC.INVALID_PARAMS, `Unknown tool: ${name}`);
          const missing = (tool.inputSchema.required ?? []).filter((k) => args[k] === undefined || args[k] === null || args[k] === "");
          if (missing.length) return ok(toolError(`Missing required argument(s): ${missing.join(", ")}`));
          try {
            return ok(await tool.handler(args, { ctx, signal }));
          } catch (e) {
            return ok(toolError(e instanceof Error ? e.message : String(e)));
          }
        }
        case "resources/list":
          return ok({ resources: [] });
        case "prompts/list":
          return ok({ prompts: [] });
        default:
          return fail(RPC.METHOD_NOT_FOUND, `Method not found: ${req.method}`);
      }
    } catch (e) {
      return fail(RPC.INTERNAL, e instanceof Error ? e.message : "Internal error");
    }
  }

  /** Handle a single message or a batch. */
  async handleBody(body: unknown, ctx: C, signal?: AbortSignal): Promise<JsonRpcResponse | JsonRpcResponse[] | null> {
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((m) => this.handle(m, ctx, signal)))).filter((r): r is JsonRpcResponse => r !== null);
      return out.length ? out : null;
    }
    return this.handle(body, ctx, signal);
  }
}

/** Methods that only describe the server (safe to allow without auth if an operator chooses to). */
export const DISCOVERY_METHODS = new Set(["initialize", "ping", "tools/list", "resources/list", "prompts/list", "notifications/initialized"]);

export function methodsOf(body: unknown): string[] {
  const arr = Array.isArray(body) ? body : [body];
  return arr.map((m) => (m && typeof m === "object" ? String((m as JsonRpcRequest).method ?? "") : ""));
}

/**
 * Streamable HTTP transport (stateless, JSON responses only).
 * POST /mcp  -> JSON-RPC; notifications-only -> 202
 * GET  /mcp  -> 405 (no server-initiated stream)
 */
export async function handleMcpHttp<C>(request: Request, server: McpServer<C>, ctx: C, headers: Record<string, string> = {}): Promise<Response> {
  const base = { "content-type": "application/json", ...headers };
  if (request.method === "GET") return new Response(JSON.stringify({ error: "SSE stream not supported; POST JSON-RPC to this endpoint" }), { status: 405, headers: { ...base, allow: "POST" } });
  if (request.method === "DELETE") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...base, allow: "POST" } });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: RPC.PARSE, message: "Parse error" } }), { status: 400, headers: base });
  }
  const res = await server.handleBody(body, ctx, request.signal);
  if (res === null) return new Response(null, { status: 202, headers });
  return new Response(JSON.stringify(res), { status: 200, headers: base });
}
