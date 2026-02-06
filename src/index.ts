import { MCPServer } from './mcp/server.js';
import { searchTools } from './tools/search/index.js';
import { catalogTools } from './tools/catalog/index.js';
import { workTools } from './tools/work/index.js';
import type { JSONRPCRequest } from './types/index.js';

const server = new MCPServer();

// Register all tools
searchTools.forEach((tool) => server.registerTool(tool));
catalogTools.forEach((tool) => server.registerTool(tool));
workTools.forEach((tool) => server.registerTool(tool));

export interface Env {
  APP_NAME: string;
  APP_VERSION: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only handle POST requests to /mcp
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/mcp') {
      return new Response('Not Found', {
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    try {
      const body = await request.json() as JSONRPCRequest;
      const response = await server.handleRequest(body);

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: error instanceof Error ? error.message : 'Parse error',
          },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
