import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { webSearch } from "./azure-openai.js";
import pkg from "../package.json" with { type: "json" };

export const server = new McpServer({
  name: pkg.name,
  version: pkg.version,
});

// Output schema for structured content
const citationSchema = z.object({
  title: z.string().describe("Title of the source"),
  url: z.string().describe("URL of the source"),
  start_index: z.number().describe("Start character index in text"),
  end_index: z.number().describe("End character index in text"),
});

const searchResultSchema = z.object({
  query: z
    .string()
    .optional()
    .describe("Original search query (first item only)"),
  text: z.string().describe("Search result text with inline citations"),
  citations: z.array(citationSchema).describe("Source citations for the text"),
});

const outputSchema = z.object({
  results: z.array(searchResultSchema),
});

server.registerTool(
  "web_search",
  {
    description:
      "Search the web for real-time information. Returns results with source citations.",
    inputSchema: {
      query: z.string().describe("The search query"),
      search_context_size: z
        .enum(["low", "medium", "high"])
        .default("medium")
        .describe("Amount of search context"),
      user_location: z
        .object({
          type: z.literal("approximate"),
          city: z.string().nullish(),
          country: z.string().nullish(),
          region: z.string().nullish(),
          timezone: z.string().nullish(),
        })
        .optional()
        .describe("User location for localized results"),
    },
    outputSchema,
  },
  async ({ query, search_context_size, user_location }) => {
    try {
      const response = await webSearch(
        query,
        search_context_size,
        user_location,
      );

      // Extract message content, keep structure but only useful fields
      const message = response.output.find(
        (item): item is Extract<typeof item, { type: "message" }> =>
          item.type === "message",
      );

      const results = (message?.content ?? [])
        .filter(
          (c): c is Extract<typeof c, { type: "output_text" }> =>
            c.type === "output_text",
        )
        .map(({ text, annotations }, index) => ({
          ...(index === 0 ? { query } : {}),
          text,
          citations: annotations
            .filter(
              (a): a is Extract<typeof a, { type: "url_citation" }> =>
                a.type === "url_citation",
            )
            .map(({ title, url, start_index, end_index }) => ({
              title,
              url,
              start_index,
              end_index,
            })),
        }));

      return {
        content: [],
        structuredContent: { results },
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${String(error)}` }],
        isError: true,
      };
    }
  },
);
