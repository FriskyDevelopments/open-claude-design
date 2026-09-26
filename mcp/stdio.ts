#!/usr/bin/env node
/**
 * Local stdio transport for the FR!SKY Design MCP.
 *   node mcp/stdio.ts            (Node 22.18+ runs TypeScript directly)
 * Keys come from the environment: ANTHROPIC_API_KEY / OPENAI_API_KEY / OPENROUTER_API_KEY.
 */
import { createInterface } from "node:readline";
import { createCoreServer, keysFromEnv } from "./tools.ts";

const server = createCoreServer();
const ctx = { keys: keysFromEnv(process.env as Record<string, unknown>) };
const rl = createInterface({ input: process.stdin });

rl.on("line", async (line) => {
  if (!line.trim()) return;
  let msg: unknown;
  try {
    msg = JSON.parse(line);
  } catch {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n");
    return;
  }
  const res = await server.handleBody(msg, ctx);
  if (res) process.stdout.write(JSON.stringify(res) + "\n");
});
