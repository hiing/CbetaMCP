# CbetaMCP Workers Migration Plan

## Overview
Migrate Python FastAPI MCP server to Cloudflare Workers TypeScript

## Directory Structure
```
CbetaMCP-Workers/
├── src/
│   ├── index.ts              # Workers entry point
│   ├── types/
│   │   └── index.ts          # MCP protocol types
│   ├── mcp/
│   │   ├── types.ts          # Tool types & Zod schemas
│   │   └── server.ts         # MCP Server implementation
│   └── tools/
│       ├── search/
│       │   └── index.ts      # All search tools
│       ├── catalog/
│       │   └── index.ts      # All catalog tools
│       └── work/
│           └── index.ts      # All work tools
├── package.json
├── tsconfig.json
├── wrangler.toml
└── README.md
```

## Tools to Migrate (20 total)

### Search Tools (10)
1. search - 搜索佛经
2. search_advanced - 高级搜索
3. search_simple - 简单搜索
4. search_facet - 分面搜索
5. search_catalog - 目录搜索
6. search_work - 典籍搜索
7. search_author - 作者搜索
8. search_keyword - 关键字搜索
9. search_category - 分类搜索
10. search_date - 日期搜索

### Catalog Tools (5)
1. catalog_entry - 目录条目
2. catalog_info - 目录信息
3. catalog_list - 目录列表
4. catalog_tree - 目录树
5. catalog_search - 目录搜索

### Work Tools (5)
1. work_info - 典籍信息
2. work_list - 典籍列表
3. work_detail - 典籍详情
4. work_content - 典籍内容
5. work_reference - 典籍引用

## API Endpoint
Base URL: https://api.cbetaonline.cn

## Migration Steps
1. Create project structure ✓
2. Implement MCP protocol core
3. Create type definitions
4. Migrate all tools
5. Test and deploy
