/**
 * Core MCP tools that ship with the open source build.
 * Self-hosters bring their own model key (env), nothing is metered.
 */
import { ARTIFACT_KINDS, GALLERY, artifactSystemPrompt, extractHtml, isArtifactKind, renderArtifact } from "./artifacts.ts";
import { DEFAULT_MODELS, PROVIDERS, complete, isProvider, type Provider } from "./providers.ts";
import { McpServer, json, text, toolError, type Tool } from "./server.ts";
import { formatTokens, type TokenFormat } from "./tokens.ts";

export const VERSION = "0.2.0";

/** Keys available to the self-hosted server (from env). */
export type ByokKeys = Partial<Record<Provider, string>>;
export type CoreContext = { keys: ByokKeys; fetchImpl?: typeof fetch };

export function coreTools<C extends CoreContext = CoreContext>(): Tool<C>[] {
  return [
    {
      name: "list_gallery",
      title: "List gallery templates",
      description: "List the built-in FR!SKY Design gallery templates (slides, design, codebase, design-system). Use an id or kind with scaffold_artifact.",
      inputSchema: { type: "object", properties: { kind: { type: "string", enum: [...ARTIFACT_KINDS] } }, additionalProperties: false },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      handler: (args) => {
        const items = isArtifactKind(args.kind) ? GALLERY.filter((g) => g.kind === args.kind) : GALLERY;
        return json({ items });
      },
    },
    {
      name: "get_design_tokens",
      title: "Get FR!SKY design tokens",
      description: "Return the FR!SKY design tokens (colors, fonts, radii) as JSON, CSS custom properties or a Tailwind v4 @theme block.",
      inputSchema: { type: "object", properties: { format: { type: "string", enum: ["json", "css", "tailwind"], default: "json" } }, additionalProperties: false },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      handler: (args) => {
        const format = (["json", "css", "tailwind"].includes(String(args.format)) ? args.format : "json") as TokenFormat;
        return text(formatTokens(format));
      },
    },
    {
      name: "scaffold_artifact",
      title: "Scaffold an artifact",
      description: "Create a starter HTML artifact (no model call) for a kind: slides, design, codebase or design-system. Returns a self-contained HTML document.",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", enum: [...ARTIFACT_KINDS] },
          title: { type: "string", maxLength: 80 },
          prompt: { type: "string", maxLength: 280, description: "Short description shown in the artifact" },
        },
        required: ["kind"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
      handler: (args) => {
        if (!isArtifactKind(args.kind)) return toolError(`kind must be one of: ${ARTIFACT_KINDS.join(", ")}`);
        const html = renderArtifact(args.kind, { title: String(args.title ?? ""), prompt: String(args.prompt ?? "") });
        return { content: [{ type: "resource", resource: { uri: `artifact://scaffold/${args.kind}`, mimeType: "text/html", text: html } }] };
      },
    },
    {
      name: "generate_artifact",
      title: "Generate an artifact (BYOK)",
      description:
        "Generate a self-contained HTML artifact from a prompt with your own model key. Uses ANTHROPIC_API_KEY, OPENAI_API_KEY or OPENROUTER_API_KEY from the server environment.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string", maxLength: 4000 },
          kind: { type: "string", enum: [...ARTIFACT_KINDS], default: "design" },
          provider: { type: "string", enum: PROVIDERS },
          model: { type: "string" },
        },
        required: ["prompt"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
      handler: async (args, { ctx }) => {
        const kind = isArtifactKind(args.kind) ? args.kind : "design";
        const provider: Provider | undefined = isProvider(args.provider) ? args.provider : PROVIDERS.find((p) => ctx.keys[p]);
        if (!provider || !ctx.keys[provider]) {
          return toolError("No model key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY or OPENROUTER_API_KEY where this server runs, or use scaffold_artifact.");
        }
        const out = await complete({
          provider,
          apiKey: ctx.keys[provider] as string,
          system: artifactSystemPrompt(kind),
          prompt: String(args.prompt),
          model: typeof args.model === "string" && args.model ? args.model : DEFAULT_MODELS[provider],
          fetchImpl: ctx.fetchImpl,
        });
        const html = extractHtml(out);
        return { content: [{ type: "resource", resource: { uri: `artifact://generated/${kind}`, mimeType: "text/html", text: html } }] };
      },
    },
  ];
}

export const CORE_INSTRUCTIONS =
  "FR!SKY Design MCP. Use list_gallery to browse templates, get_design_tokens for the palette, scaffold_artifact for an instant starter, and generate_artifact to create an HTML artifact from a prompt with the operator's own model key.";

export function createCoreServer(): McpServer<CoreContext> {
  return new McpServer<CoreContext>({ name: "frisky-design", title: "FR!SKY Design", version: VERSION, instructions: CORE_INSTRUCTIONS, tools: coreTools() });
}

/** Read BYOK keys from an env-like object (process.env or Worker env). */
export function keysFromEnv(env: Record<string, unknown>): ByokKeys {
  const pick = (k: string) => (typeof env[k] === "string" && env[k] ? (env[k] as string) : undefined);
  return { anthropic: pick("ANTHROPIC_API_KEY"), openai: pick("OPENAI_API_KEY"), openrouter: pick("OPENROUTER_API_KEY") };
}
