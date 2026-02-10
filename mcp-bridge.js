#!/usr/bin/env node
/**
 * HTTP to stdio MCP proxy bridge
 * Connects to HTTP-based MCP server and exposes it via stdio
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const SERVER_URL = process.env.SERVER_URL;

if (!SERVER_URL) {
  console.error('错误：未设置 SERVER_URL 环境变量');
  console.error('请设置您的 MCP 服务器地址，例如：');
  console.error('  SERVER_URL=https://your-worker.your-subdomain.workers.dev/mcp');
  console.error('');
  console.error('部署步骤：');
  console.error('  1. Fork 本项目');
  console.error('  2. 运行 npm install && npm run deploy');
  console.error('  3. 获取您的 Workers 地址');
  console.error('  4. 设置 SERVER_URL 环境变量');
  process.exit(1);
}

// Read JSON-RPC messages from stdin
let buffer = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  
  // Process complete JSON-RPC messages (newline delimited)
  let lines = buffer.split('\n');
  buffer = lines.pop(); // Keep incomplete line in buffer
  
  for (const line of lines) {
    if (line.trim()) {
      handleRequest(line.trim());
    }
  }
});

process.stdin.on('end', () => {
  process.exit(0);
});

async function handleRequest(jsonLine) {
  try {
    const request = JSON.parse(jsonLine);
    
    // Forward request to HTTP MCP server
    const response = await postToServer(SERVER_URL, request);
    
    // Write response to stdout
    console.log(JSON.stringify(response));
  } catch (error) {
    console.error('Error:', error.message);
    // Send JSON-RPC error response
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: error.message
      }
    };
    console.log(JSON.stringify(errorResponse));
  }
}

function postToServer(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };
    
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  });
}

console.error(`HTTP MCP Bridge started: ${SERVER_URL}`);
