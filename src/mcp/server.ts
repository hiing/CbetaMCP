import type {
  JSONRPCRequest,
  JSONRPCResponse,
  Tool,
  ListToolsResult,
  CallToolResult,
} from '../types/index.js';
import type { ToolDefinition } from './types.js';
import { zodToJsonSchema } from './types.js';

export class MCPServer {
  private tools: Map<string, ToolDefinition> = new Map();

  registerTool(definition: ToolDefinition): void {
    this.tools.set(definition.name, definition);
  }

  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    try {
      switch (request.method) {
        case 'tools/list':
          return this.handleListTools(request.id);
        case 'tools/call':
          return this.handleCallTool(request.id, request.params);
        default:
          return this.createErrorResponse(
            request.id,
            -32601,
            `Method not found: ${request.method}`
          );
      }
    } catch (error) {
      return this.createErrorResponse(
        request.id,
        -32603,
        error instanceof Error ? error.message : 'Internal error'
      );
    }
  }

  private handleListTools(id: string | number | null): JSONRPCResponse {
    const tools: Tool[] = Array.from(this.tools.values()).map((def) => ({
      name: def.name,
      description: def.description,
      inputSchema: zodToJsonSchema(def.parameters),
    }));

    const result: ListToolsResult = { tools };

    return {
      jsonrpc: '2.0',
      id,
      result,
    };
  }

  private async handleCallTool(
    id: string | number | null,
    params: unknown
  ): Promise<JSONRPCResponse> {
    const { name, arguments: args } = params as {
      name: string;
      arguments: unknown;
    };

    const tool = this.tools.get(name);
    if (!tool) {
      return this.createErrorResponse(
        id,
        -32602,
        `Tool not found: ${name}`
      );
    }

    try {
      // Validate arguments using Zod
      const validatedArgs = tool.parameters.parse(args);
      const result = await tool.handler(validatedArgs);

      const callResult: CallToolResult = {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      };

      return {
        jsonrpc: '2.0',
        id,
        result: callResult,
      };
    } catch (error) {
      const callResult: CallToolResult = {
        content: [
          {
            type: 'text',
            text: error instanceof Error ? error.message : 'Tool execution failed',
          },
        ],
        isError: true,
      };

      return {
        jsonrpc: '2.0',
        id,
        result: callResult,
      };
    }
  }

  private createErrorResponse(
    id: string | number | null,
    code: number,
    message: string
  ): JSONRPCResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code,
        message,
      },
    };
  }
}
