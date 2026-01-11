import { AzureOpenAI } from "openai";
import {
  DefaultAzureCredential,
  getBearerTokenProvider,
} from "@azure/identity";
import type {
  Response,
  WebSearchPreviewTool,
} from "openai/resources/responses/responses";

const credential = new DefaultAzureCredential();
const client = new AzureOpenAI({
  azureADTokenProvider: getBearerTokenProvider(
    credential,
    "https://cognitiveservices.azure.com/.default",
  ),
  apiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2025-03-01-preview",
});

const deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-5-mini";

export async function webSearch(
  query: string,
  searchContextSize: "low" | "medium" | "high" = "medium",
  userLocation?: WebSearchPreviewTool.UserLocation,
): Promise<Response> {
  return client.responses.create({
    model: deployment,
    input: query,
    instructions: `You are a web search tool. Your ONLY job is to search the web and return the search results directly.

CRITICAL RULES:
- NEVER ask clarifying questions or seek confirmation
- NEVER offer options like "Which would you like?" or "Do you want me to..."
- NEVER use conversational phrases or confirmatory language
- ALWAYS perform the search immediately and return the results
- Present information directly and factually from search results
- Include relevant citations and sources
- Be comprehensive but concise`,
    tools: [
      {
        type: "web_search_preview",
        search_context_size: searchContextSize,
        user_location: userLocation,
      },
    ],
    tool_choice: { type: "web_search_preview" },
  });
}
