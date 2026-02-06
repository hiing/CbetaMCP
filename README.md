# Cbeta MCP Workers

Cloudflare Workers 版本的 Cbeta MCP 服务器，提供 CBETA 佛经数据库的 MCP 工具支持。

## 项目说明

本项目是将 Python FastAPI 版本的 [CbetaMCP](https://github.com/tendayspace/CbetaMCP) 迁移到 Cloudflare Workers 的版本。

## 技术栈

- Cloudflare Workers
- TypeScript
- Zod (数据验证)
- MCP (Model Context Protocol)

## 安装

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 部署

```bash
npm run deploy
```

## 配置与使用

部署完成后，你需要在 MCP 客户端中配置该 MCP 服务器。

### 本地开发环境配置

在本地开发时，可以使用以下配置：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-proxy"],
      "env": {
        "SERVER_URL": "http://localhost:8787/mcp"
      }
    }
  }
}
```

### 部署后配置（Claude Desktop）

在 Claude Desktop 的配置文件 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-proxy"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

配置文件位置：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### 部署后配置（Cursor）

在 Cursor 的 Settings > Features > MCP Servers 中添加：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-proxy"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

### 部署后配置（Cline）

在 Cline 的 MCP Server 配置中添加：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-proxy"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

### 部署后配置（Windsurf）

在 Windsurf 的 MCP 配置面板中添加上述相同的 JSON 配置。

### 调用示例

配置完成后，你可以在对话中直接调用 CBETA 工具，例如：

- "搜索心经相关内容"
- "查找《金刚经》的详细信息"
- "列出所有禅宗典籍"

AI 助手会自动调用相应的 MCP 工具来获取 CBETA 佛经数据。

### 直接 HTTP 调用

你也可以直接通过 HTTP POST 请求调用 MCP 服务：

```bash
curl -X POST https://your-worker-name.your-subdomain.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

调用工具示例：

```bash
curl -X POST https://your-worker-name.your-subdomain.workers.dev/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search_cbeta_keyword",
      "arguments": {
        "keyword": "般若"
      }
    }
  }'
```

## API 端点

- `POST /mcp` - MCP 协议接口
  - `tools/list` - 列出所有可用工具
  - `tools/call` - 调用指定工具

## 可用工具

### 搜索工具
- `search_cbeta_keyword` - 关键词搜索
- `search_cbeta_work` - 典籍搜索
- `search_cbeta_author` - 作者搜索
- `search_cbeta_category` - 分类搜索

### 目录工具
- `catalog_cbeta_sutra` - 经文目录
- `catalog_cbeta_author` - 作者目录
- `catalog_cbeta_dynasty` - 朝代目录

### 典籍工具
- `work_cbeta_info` - 典籍信息
- `work_cbeta_content` - 典籍内容
- `work_cbeta_toc` - 目录结构

## CBETA API

本项目使用 CBETA API: https://api.cbetaonline.cn/

## 许可证

MIT
