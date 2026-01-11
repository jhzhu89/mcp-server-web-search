import { server } from "./server.js";

if (process.argv.includes("--http")) {
  const { WebStandardStreamableHTTPServerTransport } =
    await import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js");
  const transport = new WebStandardStreamableHTTPServerTransport();
  const port = Number(process.env.MCP_SERVER_PORT) || 3001;

  await server.connect(transport);
  Bun.serve({
    port,
    idleTimeout: 255,
    fetch: (req) => {
      if (new URL(req.url).pathname === "/mcp")
        return transport.handleRequest(req);
      return new Response("Not Found", { status: 404 });
    },
  });
  console.log(`MCP Server: http://0.0.0.0:${port}/mcp`);
} else {
  const { StdioServerTransport } =
    await import("@modelcontextprotocol/sdk/server/stdio.js");
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
