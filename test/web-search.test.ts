import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { config as loadEnv } from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { server } from "../src/server.js";

loadEnv();

let client: Client;
let clientTransport: InMemoryTransport;
let serverTransport: InMemoryTransport;

beforeAll(async () => {
  [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test-client", version: "1.0.0" });
  await Promise.all([
    client.connect(clientTransport),
    server.server.connect(serverTransport),
  ]);
});

afterAll(async () => {
  await clientTransport.close();
});

describe("web_search tool", () => {
  test("should list web_search tool", async () => {
    const { tools } = await client.listTools();
    expect(tools.some((t) => t.name === "web_search")).toBe(true);
  });

  test("should search and return results with citations", async () => {
    const result = (await client.callTool({
      name: "web_search",
      arguments: { query: "what is MCP protocol" },
    })) as CallToolResult;

    expect(result.structuredContent).toBeDefined();

    const structured = result.structuredContent as {
      results: Array<{
        query?: string;
        text: string;
        citations: Array<{
          title: string;
          url: string;
          start_index: number;
          end_index: number;
        }>;
      }>;
    };

    console.log(
      "\n=== web_search output ===\n",
      JSON.stringify(structured, null, 2),
    );

    expect(structured.results).toBeDefined();
    expect(structured.results.length).toBeGreaterThan(0);
    expect(structured.results[0]).toHaveProperty("query");
    expect(structured.results[0]).toHaveProperty("text");
    expect(structured.results[0]).toHaveProperty("citations");
  }, 60000);
});
