import { z } from 'zod';
import type { ToolDefinition } from '../../mcp/types';

const CBETA_BASE_URL = 'https://api.cbetaonline.cn';

// Tool 1: Get Catalog
const catalogParams = z.object({
  q: z.string().describe('查詢節點編號，例如 "root"、"CBETA"、"orig-T"、"CBETA.001"、"Vol-J.001" 等'),
});

// Tool 2: Search Texts
const textSearchParams = z.object({
  q: z.string().describe('搜尋關鍵詞或藏經冊號，如 "阿含" 或 "T01"'),
});

// Tool 3: Search by Volume Range
const volumeSearchParams = z.object({
  canon: z.string().describe('藏經 ID，如 T 或 X'),
  vol_start: z.number().describe('開始冊數，如 1'),
  vol_end: z.number().describe('結束冊數，如 2'),
});

// Tool 4: Search by Translator
const translatorSearchParams = z.object({
  creator_id: z.string().optional().describe('作譯者 ID，如 A000439'),
  creator: z.string().optional().describe('作譯者姓名模糊搜尋，如 "竺"'),
  creator_name: z.string().optional().describe('僅搜尋尚未確認 ID 的譯者，如 "竺"'),
});

// Tool 5: Search by Dynasty
const dynastySearchParams = z.object({
  dynasty: z.string().optional().describe('朝代名稱，支援多個朝代用英文逗號分隔'),
  time_start: z.number().optional().describe('起始年份，如 600'),
  time_end: z.number().optional().describe('結束年份，如 700'),
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

export const catalogTools: ToolDefinition[] = [
  {
    name: 'get_cbeta_catalog',
    description: '查詢 CBETA Online 提供的佛典目錄結構資料，可用於取得特定藏經分類、原書結構、或進一步展開經文節點。支援查詢 root、CBETA、orig、orig-T 等節點。',
    parameters: catalogParams,
    handler: async (args: unknown) => {
      const params = catalogParams.parse(args);
      return fetchCBETA('/catalog_entry', params);
    },
  },
  {
    name: 'search_cbeta_texts',
    description: '搜尋 CBETA 佛典經目，根據關鍵詞或冊號進行查詢。type 欄位說明：catalog 表示部類目錄、work 表示經名層級、toc 表示佛典內目次層級。',
    parameters: textSearchParams,
    handler: async (args: unknown) => {
      const params = textSearchParams.parse(args);
      return fetchCBETA('/toc', params);
    },
  },
  {
    name: 'search_buddhist_canons_by_vol',
    description: '根據指定藏經 (canon) ID 與冊數起迄範圍 (vol_start ~ vol_end)，查詢對應範圍內的佛典資料。',
    parameters: volumeSearchParams,
    handler: async (args: unknown) => {
      const params = volumeSearchParams.parse(args);
      const data = await fetchCBETA('/works', params);
      return {
        num_found: (data as { num_found?: number }).num_found,
        results: (data as { results?: unknown[] }).results || [],
      };
    },
  },
  {
    name: 'search_works_by_translator',
    description: '根據 CBETA Online 的作譯者資訊搜尋作品。支援三種搜尋方式：creator_id (指定ID)、creator (姓名模糊搜尋)、creator_name (僅搜未確認ID的姓名)。',
    parameters: translatorSearchParams,
    handler: async (args: unknown) => {
      const params = translatorSearchParams.parse(args);
      if (!params.creator_id && !params.creator && !params.creator_name) {
        throw new Error('請至少提供一個搜尋參數：creator_id、creator 或 creator_name');
      }
      const queryParams: Record<string, string> = {};
      if (params.creator_id) queryParams.creator_id = params.creator_id;
      if (params.creator) queryParams.creator = params.creator;
      if (params.creator_name) queryParams.creator_name = params.creator_name;
      return fetchCBETA('/works', queryParams);
    },
  },
  {
    name: 'search_cbeta_by_dynasty',
    description: '通过朝代名称或公元时间范围搜索 CBETA 佛典。可輸入 dynasty 参数（支持多个朝代名，用英文逗号隔开）或公元年范围：time_start 和 time_end。',
    parameters: dynastySearchParams,
    handler: async (args: unknown) => {
      const params = dynastySearchParams.parse(args);
      if (!params.dynasty && !(params.time_start && params.time_end)) {
        throw new Error('请提供 dynasty 或 time_start 与 time_end 参数');
      }
      const queryParams: Record<string, string | number> = {};
      if (params.dynasty) queryParams.dynasty = params.dynasty;
      if (params.time_start) queryParams.time_start = params.time_start;
      if (params.time_end) queryParams.time_end = params.time_end;
      const data = await fetchCBETA('/works', queryParams);
      return {
        num_found: (data as { num_found?: number }).num_found || 0,
        sample_result: ((data as { results?: unknown[] }).results || []).slice(0, 2),
      };
    },
  },
];
