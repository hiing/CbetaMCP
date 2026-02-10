# Cbeta MCP Workers

Cloudflare Workers 版本的 Cbeta MCP 服务器，提供 CBETA 佛经数据库的 MCP 工具支持。

## 项目说明

本项目是将 Python FastAPI 版本的 [CbetaMCP](https://github.com/tendayspace/CbetaMCP) 迁移到 Cloudflare Workers 的版本。

## ⚠️ 重要提醒：必须使用自定义域名

**Cloudflare Workers 提供的 `*.workers.dev` 域名在某些网络环境下无法正常访问。**

### ❌ 不可使用
```
https://your-worker.your-subdomain.workers.dev  ❌ 无法调用
```

### ✅ 必须使用
```
https://cbeta.yourdomain.com          ✅ 自定义域名
https://cbeta-mcp.yourdomain.com      ✅ 子域名
```

**你需要在 Cloudflare 中为自己的 Workers 绑定自定义域名后才能正常使用。**

---

## 快速开始

本项目需要**自己部署**到 Cloudflare Workers，并**绑定自定义域名**。请按以下步骤操作：

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

### 2. 绑定自定义域名（⚠️ 关键步骤）

**workers.dev 域名无法使用，必须绑定自己的域名。**

#### 步骤 1：添加自定义域名到 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的 Workers 项目
3. 进入 **Settings** > **Triggers** > **Custom Domains**
4. 点击 **Add Custom Domain**
5. 输入你的域名，例如：
   - `cbeta.yourdomain.com`
   - `mcp.yourdomain.com`
   - `cbeta-mcp.yourdomain.com`

#### 步骤 2：确保域名在 Cloudflare 托管

- 你的域名必须使用 Cloudflare 的 DNS
- 在 Cloudflare 添加域名后，会提供 DNS 记录
- 在你的域名注册商处修改 DNS 为 Cloudflare 提供的地址

#### 步骤 3：验证域名生效

```bash
# 测试你的自定义域名
curl https://cbeta.yourdomain.com/mcp -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test"}}}'
```

**看到返回 JSON 数据即表示成功。**

### 3. 获取你的 Workers 地址

部署并绑定自定义域名后，你会得到这样的地址：
```
https://cbeta.yourdomain.com
```

**注意**：不要使用 Cloudflare 提供的 `*.workers.dev` 地址，那个无法调用。

### 3. 配置 MCP 客户端

本项目包含 `mcp-bridge.js` 文件，它作为 MCP 客户端与 Cloudflare Workers 之间的桥梁。你需要配置两个环境变量：

#### 环境变量说明

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| `SERVER_URL` | **必需** - 你的 Cloudflare Workers 自定义域名地址 | `https://cbeta.yourdomain.com/mcp` |
| `MCP_BRIDGE_PATH` | **可选** - mcp-bridge.js 的路径，默认为 `./mcp-bridge.js` | `/absolute/path/to/mcp-bridge.js` |

#### 配置示例

**方式一：使用默认相对路径（推荐）**

确保 `mcp-bridge.js` 与 MCP 配置文件在同一目录：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
      }
    }
  }
}
```

**⚠️ 注意**：使用你自己的自定义域名，不是 `workers.dev`

**方式二：使用环境变量指定路径**

先设置环境变量：
```bash
# Linux/Mac
export MCP_BRIDGE_PATH="/path/to/cbeta-mcp/mcp-bridge.js"
export SERVER_URL="https://cbeta.yourdomain.com/mcp"

# Windows PowerShell
$env:MCP_BRIDGE_PATH="C:/path/to/cbeta-mcp/mcp-bridge.js"
$env:SERVER_URL="https://cbeta.yourdomain.com/mcp"
```

然后配置 MCP 客户端：
```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
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

#### 项目文件结构

下载/克隆项目后，你会得到以下文件：

```
CbetaMCP/
├── mcp-bridge.js          # ⭐ 桥接脚本（使用此文件）
├── src/                   # 源代码（无需修改）
├── package.json           # 项目配置
├── wrangler.toml          # Workers 配置
└── README.md              # 本文档
```

你只需要关注 `mcp-bridge.js` 文件，其他是部署到 Cloudflare 所需的代码。

#### 路径配置方式

`mcp-bridge.js` 支持多种路径写法：

| 方式 | 示例 | 适用场景 |
|------|------|----------|
| **相对路径（推荐）** | `"./mcp-bridge.js"` | 脚本与 MCP 配置文件同目录 |
| **绝对路径(Linux/Mac)** | `"/home/user/CbetaMCP/mcp-bridge.js"` | 指定完整路径 |
| **绝对路径(Windows)** | `"C:/Users/name/CbetaMCP/mcp-bridge.js"` | Windows 系统（使用正斜杠） |
| **用户目录** | `"~/CbetaMCP/mcp-bridge.js"` | 存放在用户主目录下 |

### 🛠️ 各客户端配置示例

以下配置适用于所有 MCP 客户端。只需将 `SERVER_URL` 替换为你自己的 Workers 地址，并根据实际情况调整 `mcp-bridge.js` 的路径。

#### 配置模板

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
      }
    }
  }
}
```

**⚠️ 重要提醒**：
- `args`: mcp-bridge.js 的路径（相对或绝对路径）
- `SERVER_URL`: 你的 Cloudflare Workers **自定义域名**地址（**不是 workers.dev**）

---

#### 本地开发配置

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "http://localhost:8787/mcp"
      }
    }
  }
}
```

**注意**：本地开发使用 `localhost`，生产环境必须使用自定义域名。

---

#### Claude Desktop

配置文件位置：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

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

---

#### Cursor

Settings > Features > MCP Servers：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
      }
    }
  }
}
```

---

#### Cline

MCP Server 配置：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
      }
    }
  }
}
```

**提示**：Cline 支持使用环境变量 `${env:VAR_NAME}`

---

#### Windsurf

MCP 配置面板：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
      }
    }
  }
}
```

---

#### OpenCode

配置方法：
1. 打开 OpenCode 设置
2. 找到 MCP Servers 配置
3. 添加以下配置：

```json
{
  "mcpServers": {
    "cbeta": {
      "command": "node",
      "args": ["./mcp-bridge.js"],
      "env": {
        "SERVER_URL": "https://cbeta.yourdomain.com/mcp"
      }
    }
  }
}
```
4. 保存并刷新配置

### 调用示例

配置完成后，你可以在对话中直接调用 CBETA 工具，例如：

- "搜索心经相关内容"
- "查找《金刚经》的详细信息"
- "列出所有禅宗典籍"

AI 助手会自动调用相应的 MCP 工具来获取 CBETA 佛经数据。

### 直接 HTTP 调用

你也可以直接通过 HTTP POST 请求调用 MCP 服务：

```bash
curl -X POST https://cbeta.yourdomain.com/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

调用工具示例：

```bash
curl -X POST https://cbeta.yourdomain.com/mcp \
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
