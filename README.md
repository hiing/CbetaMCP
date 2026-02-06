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
