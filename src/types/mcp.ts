// MCP Protocol Types
export interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  handler: (args: unknown) => Promise<unknown>;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export type Content = TextContent | ImageContent;

export interface CallToolResult {
  content: Content[];
  isError?: boolean;
}

// JSON-RPC Types
export interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: string | number | null;
  method: string;
  params?: unknown;
}

export interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface ListToolsResult {
  tools: Array<{
    name: string;
    description: string;
    inputSchema: object;
  }>;
}
