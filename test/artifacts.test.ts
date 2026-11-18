import { describe, expect, it } from "vitest";
import { ARTIFACT_KINDS, extractHtml, formatTokens, renderArtifact } from "../mcp/index.ts";

describe("artifacts and tokens", () => {
  it("renders every kind as a full document", () => {
    for (const k of ARTIFACT_KINDS) expect(renderArtifact(k)).toMatch(/^<!doctype html>/);
  });
  it("extracts HTML from fenced model output", () => {
    expect(extractHtml("Sure!\n```html\n<!doctype html><h1>x</h1>\n```")).toBe("<!doctype html><h1>x</h1>");
  });
  it("formats tokens", () => {
    expect(formatTokens("css")).toContain("--color-yellow: #ffd100;");
    expect(formatTokens("tailwind")).toContain("@theme inline {");
    expect(JSON.parse(formatTokens("json")).name).toBe("FR!SKY");
  });
});
