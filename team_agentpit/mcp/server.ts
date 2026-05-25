import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { loadEnv } from "../shared/load-env.js";
import { toolRegistry } from "./tools/index.js";

loadEnv();

const app = createMcpExpressApp();

app.use("/mcp", (req, _res, next) => {
  if (req.method === "POST") {
    next();
    return;
  }

  req.body = undefined;
  next();
});

app.use("/mcp", (await import("express")).json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "delegent-mcp",
    endpoint: "/mcp",
    tools: toolRegistry.map((tool) => tool.name),
  });
});

app.get("/vault-signals", async (req, res) => {
  const params = new URLSearchParams();
  if (typeof req.query.ownerAddress === "string") {
    params.set("ownerAddress", req.query.ownerAddress);
  }
  if (typeof req.query.vaultAddress === "string") {
    params.set("vaultAddress", req.query.vaultAddress);
  }

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3001";
  const response = await fetch(`${backendUrl}/vault-signals?${params.toString()}`);
  if (!response.ok) {
    res.status(response.status).send(await response.text());
    return;
  }

  res.type("application/json").send(await response.text());
});

const transports: Record<string, StreamableHTTPServerTransport> = {};

function buildServer() {
  const server = new McpServer(
    {
      name: "delegent-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        logging: {},
        tools: {
          listChanged: true,
        },
      },
    },
  );

  for (const tool of toolRegistry) {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      },
      async (args, extra) => {
        const result = await tool.handler({
          agentId: extra.sessionId,
          args,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, jsonReplacer, 2),
            },
          ],
          structuredContent: JSON.parse(JSON.stringify(result, jsonReplacer)),
        };
      },
    );
  }

  return server;
}

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  try {
    let transport: StreamableHTTPServerTransport | undefined;

    if (typeof sessionId === "string" && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = transport!;
        },
      });

      transport.onclose = () => {
        if (transport?.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      const server = buildServer();
      await server.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid MCP session ID provided",
        },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : String(error),
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (typeof sessionId !== "string" || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  await transports[sessionId].handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  if (typeof sessionId !== "string" || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }

  await transports[sessionId].handleRequest(req, res);
});

const port = Number(process.env.MCP_PORT ?? 3002);
app.listen(port, () => {
  console.log(`[mcp] listening on http://localhost:${port}/mcp`);
});

function jsonReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}
