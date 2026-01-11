# @jhzhu89/mcp-server-web-search

MCP Server for web search via Azure OpenAI Responses API with `web_search_preview` tool.

## Installation

### Prerequisites

- [Bun](https://bun.sh) runtime installed

### Claude Code (Recommended)

```bash
# Install globally (available in all projects)
claude mcp add web-search bunx @jhzhu89/mcp-server-web-search \
  -s user \
  -e AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com \
  -e AZURE_OPENAI_DEPLOYMENT=gpt-5-mini

# Or install for current project only (default)
claude mcp add web-search bunx @jhzhu89/mcp-server-web-search \
  -e AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com \
  -e AZURE_OPENAI_DEPLOYMENT=gpt-5-mini
```

### Manual Configuration

Add to your `.mcp.json`:
```json
{
  "mcpServers": {
    "web-search": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@jhzhu89/mcp-server-web-search"],
      "env": {
        "AZURE_OPENAI_ENDPOINT": "https://your-resource.openai.azure.com",
        "AZURE_OPENAI_DEPLOYMENT": "gpt-5-mini"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AZURE_OPENAI_ENDPOINT` | ✓ | - | Azure OpenAI endpoint URL |
| `AZURE_OPENAI_DEPLOYMENT` | | `gpt-5-mini` | Deployment name |
| `AZURE_OPENAI_API_VERSION` | | `2025-03-01-preview` | API version |

## Authentication

This server uses [DefaultAzureCredential](https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential) for Azure authentication. Supported methods:

1. **Azure CLI** (local development): Run `az login` before starting
2. **Environment variables**: Set `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET`
3. **Managed Identity**: Works automatically in Azure environments

## Tool: web_search

Search the web for real-time information with source citations.

### Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✓ | Search query |
| `search_context_size` | `"low"` \| `"medium"` \| `"high"` | | Amount of context (default: `"medium"`) |
| `user_location` | object | | `{type, city, country, region, timezone}` for localized results |

### Output (structuredContent)

```json
{
  "results": [
    {
      "query": "original search query",
      "text": "Answer text with inline [citations](url)...",
      "citations": [
        {
          "title": "Source Title",
          "url": "https://example.com",
          "start_index": 0,
          "end_index": 100
        }
      ]
    }
  ]
}
```

## Development

```bash
# Clone and install
bun install

# Run locally
export AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
az login
bun run start

# Run with HTTP transport
bun run start:http

# Test
bun test
```

## License

MIT
