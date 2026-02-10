# Cbeta MCP Workers

Cloudflare Workers 版本的 Cbeta MCP 服务器，提供 CBETA 佛经数据库的 MCP 工具支持。

## 项目说明

本项目是将 Python FastAPI 版本的 [CbetaMCP](https://github.com/tendayspace/CbetaMCP) 迁移到 Cloudflare Workers 的版本。

## 快速开始

本项目需要**自己部署**到 Cloudflare Workers。请按以下步骤操作：

### 1. Fork 并部署

1. Fork 本项目到你的 GitHub
2. 克隆到本地：
   ```bash
   git clone https://github.com/YOUR_USERNAME/CbetaMCP.git
   cd CbetaMCP
   ```
3. 安装依赖：
   ```bash
   npm install
   ```
4. 登录 Cloudflare：
   ```bash
   npx wrangler login
   ```
5. 部署：
   ```bash
   npm run deploy
   ```

### 2. 获取你的 Workers 地址

部署成功后，你会得到类似这样的地址：
```
https://cbeta-mcp-workers.YOUR_SUBDOMAIN.workers.dev
```

### 3. 配置 MCP 客户端

在 MCP 客户端配置中，将 `SERVER_URL` 设置为你的地址：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["/path/to/mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta-mcp-workers.YOUR_SUBDOMAIN.workers.dev/mcp"
      }
    }
  }
}
```

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

### 📋 MCP 桥接脚本使用指南

由于 Cloudflare Workers 只支持 HTTP 传输，而 MCP 客户端通常使用 stdio，所以需要 `mcp-bridge.js` 作为中间桥梁。

#### 准备桥接脚本

将项目中的 `mcp-bridge.js` 文件复制到你的工作目录，或记住它的存放位置：

```bash
# 方式1：复制到项目目录
cp mcp-bridge.js ~/my-project/

# 方式2：复制到全局位置
cp mcp-bridge.js ~/.local/bin/

# 方式3：保持原位置，使用绝对路径
```

#### 路径配置方式

支持以下路径写法（在 MCP 客户端配置中使用）：

| 方式 | 示例 | 适用场景 |
|------|------|----------|
| **相对路径** | `"./mcp-bridge.js"` | 脚本与配置文件同目录 |
| **绝对路径(Linux/Mac)** | `"/home/user/project/mcp-bridge.js"` | Linux/Mac 系统 |
| **绝对路径(Windows)** | `"C:/Users/name/project/mcp-bridge.js"` | Windows 系统（注意使用正斜杠） |
| **用户目录** | `"~/mcp-bridge.js"` | 存放在用户主目录 |

#### 环境变量配置

你可以通过环境变量灵活配置：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["${MCP_BRIDGE_PATH}"],
      "env": {
        "SERVER_URL": "https://your-worker.your-subdomain.workers.dev/mcp",
        "MCP_BRIDGE_PATH": "./mcp-bridge.js"
      }
    }
  }
}
```

或者设置系统环境变量：

```bash
# Linux/Mac
export MCP_BRIDGE_PATH="/path/to/mcp-bridge.js"
export CBETA_MCP_URL="https://your-worker.your-subdomain.workers.dev/mcp"

# Windows (PowerShell)
$env:MCP_BRIDGE_PATH="C:/path/to/mcp-bridge.js"
$env:CBETA_MCP_URL="https://your-worker.your-subdomain.workers.dev/mcp"
```

### 本地开发环境配置

在本地开发时，可以使用以下配置：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["/path/to/mcp-bridge.js"],
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
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

**路径说明**：
- `./mcp-bridge.js` 表示脚本与配置文件在同一目录
- 也可以使用绝对路径，如 `"/Users/name/mcp/cbeta-mcp-bridge.js"`（Mac）或 `"C:/Users/name/mcp/mcp-bridge.js"`（Windows）

配置文件位置：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### 部署后配置（Cursor）

在 Cursor 的 Settings > Features > MCP Servers 中添加：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

**路径说明**：
- 如果使用相对路径 `./mcp-bridge.js`，确保 mcp-bridge.js 文件在项目根目录
- 或者使用绝对路径指向 mcp-bridge.js 的实际位置

### 部署后配置（Cline）

在 Cline 的 MCP Server 配置中添加：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

**提示**：Cline 支持使用环境变量 `${env:VAR_NAME}` 来引用系统环境变量

### 部署后配置（Windsurf）

在 Windsurf 的 MCP 配置面板中添加：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["/path/to/mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

### 部署后配置（OpenCode）

在 OpenCode 的 MCP Servers 配置中，添加以下内容：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["/path/to/mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://your-worker-name.your-subdomain.workers.dev/mcp"
      }
    }
  }
}
```

配置方法：
1. 打开 OpenCode 设置
2. 找到 MCP Servers 或 Tools 配置选项
3. 点击添加新的 MCP Server
4. 输入名称（如 `cbeta`）
5. 粘贴上述 JSON 配置
6. 保存并刷新配置

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
