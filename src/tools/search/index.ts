import { z } from 'zod';
import type { ToolDefinition } from '../../mcp/types';

const CBETA_BASE_URL = 'https://api.cbetaonline.cn';

// Tool 1: Fulltext Search
const fulltextSearchParams = z.object({
  q: z.string().describe('搜尋關鍵字（必填）'),
  fields: z.string().optional().describe('指定欄位，例如 "work,juan,term_hits"'),
  rows: z.number().optional().default(20).describe('每頁回傳筆數，預設為 20'),
  start: z.number().optional().default(0).describe('起始位置，預設為 0'),
  order: z.string().optional().describe('排序欄位，例如 "time_from-" 表示依成立年代降序'),
});

// Tool 2: Extended Search
const extendedSearchParams = z.object({
  q: z.string().describe('查詢語句，支援 AND/OR/NOT/NEAR 語法'),
  start: z.number().optional().default(0).describe('起始位置，預設為 0'),
  rows: z.number().optional().default(20).describe('回傳筆數，預設為 20'),
});

// Tool 3: Synonym Search
const synonymSearchParams = z.object({
  q: z.string().describe('查詢詞，如：文殊師利'),
});

// Tool 4: SC (Simplified/Traditional) Search
const scSearchParams = z.object({
  q: z.string().describe('搜尋關鍵詞（支持簡體/繁體）'),
  fields: z.string().optional().describe('限定欄位，如 "juan,text"'),
  rows: z.number().optional().default(10).describe('回傳結果數量'),
  start: z.number().optional().default(0).describe('起始位置'),
  order: z.string().optional().describe('排序方式'),
});

// Tool 5: Facet Query
const facetQueryParams = z.object({
  q: z.string().describe('查詢關鍵字'),
  f: z.string().optional().describe('指定 facet 類型（canon、category、dynasty、creator、work）'),
});

// Tool 6: All-in-One Search
const allInOneParams = z.object({
  q: z.string().describe('查詢關鍵字，必填'),
  note: z.number().optional().default(1).describe('是否包含夾注，0: 不含，1: 含（預設）'),
  fields: z.string().optional().describe('指定回傳欄位'),
  facet: z.number().optional().default(0).describe('是否回傳 facet，0: 不回傳（預設），1: 回傳'),
  rows: z.number().optional().default(20).describe('每頁筆數，預設為 20'),
  start: z.number().optional().default(0).describe('起始筆數位置，預設為 0'),
  around: z.number().optional().default(10).describe('KWIC 前後字數，預設為 10'),
  order: z.string().optional().describe('排序條件，如 time_from+ 表升冪，time_from- 表降冪'),
  cache: z.number().optional().default(1).describe('是否使用快取，預設為 1'),
});

// Tool 7: Notes Search
const notesSearchParams = z.object({
  q: z.string().describe('要搜尋的字詞，需加雙引號（且需 URL encode）'),
  around: z.number().optional().default(10).describe('highlight 關鍵字週圍字數，預設為 10'),
  rows: z.number().optional().default(20).describe('每頁回傳筆數，預設為 20'),
  start: z.number().optional().default(0).describe('起始位置，預設為 0'),
  facet: z.number().optional().default(0).describe('是否回傳 facet，0=不回傳，1=回傳四種 facet'),
});

// Tool 8: Title Search
const titleSearchParams = z.object({
  q: z.string().describe('搜尋經名（至少三個字）'),
  rows: z.number().optional().default(20).describe('每頁回傳筆數，預設為 20'),
  start: z.number().optional().default(0).describe('起始位置，預設為 0（分頁使用）'),
});

// Tool 9: KWIC Search
const kwicSearchParams = z.object({
  work: z.string().describe('佛典編號，如 T0001、X0600'),
  juan: z.number().describe('卷號，如 1、11'),
  q: z.string().describe('查詢關鍵詞'),
  note: z.number().optional().default(1).describe('是否包含夾注，0=不含，1=包含（預設=1）'),
  mark: z.number().optional().default(0).describe('是否加 mark 標記，0=不加（預設），1=加'),
  sort: z.string().optional().default('f').describe('排序方式，f=關鍵詞後排序，b=前排序，location=依卷內出現位置排序'),
});

// Tool 10: Similar Search
const similarSearchParams = z.object({
  q: z.string().describe('要搜尋的字串，不含標點，建議長度 6~50 字'),
  k: z.number().optional().default(500).describe('模糊搜尋取 top k 筆，預設為 500'),
  gain: z.number().optional().default(2).describe('Smith-Waterman 比對加分，預設為 2'),
  penalty: z.number().optional().default(-1).describe('Smith-Waterman 扣分，預設為 -1'),
  score_min: z.number().optional().default(16).describe('Score 最小值，預設為 16'),
  facet: z.number().optional().default(0).describe('是否回傳 facet：0 不回傳，1 回傳五種 facet 資訊'),
  cache: z.number().optional().default(1).describe('是否使用快取：1 使用，0 不使用'),
});

async function fetchCBETA(endpoint: string, params: Record<string, unknown>): Promise<unknown> {
  const url = new URL(`${CBETA_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`CBETA API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const searchTools: ToolDefinition[] = [
  {
    name: 'cbeta_fulltext_search',
    description: 'CBETA 一般全文檢索工具，使用 CBETA Open API 搜尋佛典。',
    parameters: fulltextSearchParams,
    handler: async (args: unknown) => {
      const params = fulltextSearchParams.parse(args);
      return fetchCBETA('/search', params);
    },
  },
  {
    name: 'cbeta_extended_search',
    description: 'CBETA 擴充模式全文檢索工具，支援 AND、OR、NOT、NEAR 語法。',
    parameters: extendedSearchParams,
    handler: async (args: unknown) => {
      const params = extendedSearchParams.parse(args);
      const encodedQuery = encodeURIComponent(params.q);
      return fetchCBETA('/search/extended', { ...params, q: encodedQuery });
    },
  },
  {
    name: 'cbeta_synonym_search',
    description: 'CBETA Online 近义词搜索，返回与关键词相关的近义词列表。',
    parameters: synonymSearchParams,
    handler: async (args: unknown) => {
      const params = synonymSearchParams.parse(args);
      return fetchCBETA('/search/synonym', params);
    },
  },
  {
    name: 'cbeta_search_sc',
    description: 'CBETA 簡體/繁體搜尋工具（無需手動轉換）',
    parameters: scSearchParams,
    handler: async (args: unknown) => {
      const params = scSearchParams.parse(args);
      const data = await fetchCBETA('/search/sc', params);
      return { q: params.q, hits: (data as { hits?: number }).hits || 0 };
    },
  },
  {
    name: 'cbeta_facet_query',
    description: 'CBETA Facet 多維面向查詢，支援 canon、category、dynasty、creator、work 五種分類。',
    parameters: facetQueryParams,
    handler: async (args: unknown) => {
      const params = facetQueryParams.parse(args);
      const endpoint = params.f ? `/search/facet/${params.f}` : '/search/facet';
      return fetchCBETA(endpoint, { q: params.q });
    },
  },
  {
    name: 'cbeta_all_in_one',
    description: 'CBETA 全文檢索 All in One，同時回傳 KWIC 與命中資料，支援 AND/OR/NOT/NEAR 進階語法。',
    parameters: allInOneParams,
    handler: async (args: unknown) => {
      const params = allInOneParams.parse(args);
      return fetchCBETA('/search/all_in_one', params);
    },
  },
  {
    name: 'cbeta_notes_search',
    description: 'CBETA Online 註解／校勘條目搜尋工具，搜尋註解內容。',
    parameters: notesSearchParams,
    handler: async (args: unknown) => {
      const params = notesSearchParams.parse(args);
      return fetchCBETA('/search/notes', params);
    },
  },
  {
    name: 'cbeta_title_search',
    description: '搜尋佛典標題（經名），至少需要三個字。',
    parameters: titleSearchParams,
    handler: async (args: unknown) => {
      const params = titleSearchParams.parse(args);
      if (params.q.trim().length < 3) {
        throw new Error('搜尋關鍵字至少需三個字以上');
      }
      return fetchCBETA('/search/title', params);
    },
  },
  {
    name: 'cbeta_kwic_search',
    description: 'CBETA KWIC 單卷關鍵詞檢索工具，支援 NEAR/查詢、排除前後詞搭配。',
    parameters: kwicSearchParams,
    handler: async (args: unknown) => {
      const params = kwicSearchParams.parse(args);
      return fetchCBETA('/search/kwic', params);
    },
  },
  {
    name: 'cbeta_similar_search',
    description: 'CBETA 相似搜尋工具，使用 Smith-Waterman 演算法實現字句相似搜尋。',
    parameters: similarSearchParams,
    handler: async (args: unknown) => {
      const params = similarSearchParams.parse(args);
      return fetchCBETA('/search/similar', params);
    },
  },
];
