import { z } from 'zod';
import type { ToolDefinition } from '../../mcp/types';

const CBETA_BASE_URL = 'https://api.cbetaonline.cn';

// Tool 1: Get Work Info
const workInfoParams = z.object({
  work: z.string().describe('佛典編號，例如 "T1501"'),
});

// Tool 2: Get TOC
const tocParams = z.object({
  work: z.string().describe('佛典編號，例如 T0001'),
});

// Tool 3: Get Juan HTML
const juanHTMLParams = z.object({
  work: z.string().describe('佛典編號，例如 T0001'),
  juan: z.number().describe('卷號（從 1 開始）'),
  work_info: z.number().optional().default(0).describe('是否回傳佛典資訊（0=否，1=是）'),
  toc: z.number().optional().default(0).describe('是否回傳目次（0=否，1=是）'),
});

// Tool 4: Goto (Navigate)
const gotoParams = z.object({
  canon: z.string().optional().describe('藏經編號，如 T、X、N'),
  work: z.string().optional().describe('經號，如 1、2、150A'),
  juan: z.number().optional().describe('卷數'),
  vol: z.number().optional().describe('冊數'),
  page: z.number().optional().describe('頁碼'),
  col: z.string().optional().describe('欄位，a, b, c'),
  line: z.number().optional().describe('行數'),
  linehead: z.string().optional().describe('行首引用，如 T01n0001_p0066c25 或 CBETA 格式'),
});

// Tool 5: Get Lines
const linesParams = z.object({
  linehead: z.string().optional().describe('指定單一行首資訊'),
  linehead_start: z.string().optional().describe('起始行首'),
  linehead_end: z.string().optional().describe('結束行首'),
  before: z.number().optional().describe('額外前幾行（搭配 linehead）'),
  after: z.number().optional().describe('額外後幾行（搭配 linehead）'),
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

export const workTools: ToolDefinition[] = [
  {
    name: 'get_cbeta_work_info',
    description: '根據 CBETA 佛典編號（work），取得該佛典詳細資訊。包含：title（經名）、byline（作譯者說明）、creators（貢獻者）、category（分類）、time_dynasty（朝代）、places（地點列表）等。',
    parameters: workInfoParams,
    handler: async (args: unknown) => {
      const params = workInfoParams.parse(args);
      const data = await fetchCBETA('/works', { work: params.work });
      const results = (data as { results?: unknown[] }).results || [];
      if (results.length === 0) {
        throw new Error('查無此佛典資訊');
      }
      const result = results[0] as Record<string, unknown>;
      return {
        work: result.work,
        title: result.title,
        byline: result.byline,
        creators: result.creators,
        category: result.category,
        orig_category: result.orig_category,
        time_dynasty: result.time_dynasty,
        time_from: result.time_from,
        time_to: result.time_to,
        cjk_chars: result.cjk_chars,
        en_words: result.en_words,
        file: result.file,
        juan_start: result.juan_start,
        places: result.places,
      };
    },
  },
  {
    name: 'get_cbeta_toc',
    description: '通過 CBETA Online API 获取指定佛典的目次結構。返回 mulu 欄位包含目次節點列表，每個節點有 title（標題）、file（檔案名）、juan（卷號）、lb（頁欄行位置）、type（節點類型）等資訊。',
    parameters: tocParams,
    handler: async (args: unknown) => {
      const params = tocParams.parse(args);
      return fetchCBETA('/toc', { work: params.work });
    },
  },
  {
    name: 'get_juan_html',
    description: '通過 CBETA API 抓取指定佛典 work 的指定卷（juan）HTML 內容。可選是否同時返回「佛典資訊 work_info」與「目次 toc」內容。適用於 CBETA 閱讀器前端渲染、段落分析、結構轉換等。',
    parameters: juanHTMLParams,
    handler: async (args: unknown) => {
      const params = juanHTMLParams.parse(args);
      return fetchCBETA('/juans', {
        work: params.work,
        juan: params.juan,
        work_info: params.work_info,
        toc: params.toc,
      });
    },
  },
  {
    name: 'cbeta_goto',
    description: '跳轉到 CBETA 對應的經文位置 URL。支持三種跳轉模式：(1) canon + work + (juan/page/col/line)、(2) canon + vol + (page/col/line)、(3) linehead (優先)。',
    parameters: gotoParams,
    handler: async (args: unknown) => {
      const params = gotoParams.parse(args);
      const queryParams: Record<string, string | number> = {};

      if (params.linehead) {
        queryParams.linehead = params.linehead;
      } else {
        ['canon', 'work', 'juan', 'vol', 'page', 'col', 'line'].forEach((field) => {
          const value = params[field as keyof typeof params];
          if (value !== undefined && value !== null) {
            queryParams[field] = value;
          }
        });
      }

      const url = new URL(`${CBETA_BASE_URL}/juans/goto`);
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`CBETA goto failed: ${response.status}`);
      }

      return { url: response.url };
    },
  },
  {
    name: 'get_cbeta_lines',
    description: 'CBETA 行文擷取工具，依據 CBETA 大正藏 API，抓取指定行或行段的 HTML 內容與註解。支援單行（linehead）、行段範圍（linehead_start / linehead_end）、以及上下文擴展（before / after）。',
    parameters: linesParams,
    handler: async (args: unknown) => {
      const params = linesParams.parse(args);
      const queryParams: Record<string, string | number> = {};
      
      if (params.linehead) queryParams.linehead = params.linehead;
      if (params.linehead_start) queryParams.linehead_start = params.linehead_start;
      if (params.linehead_end) queryParams.linehead_end = params.linehead_end;
      if (params.before !== undefined) queryParams.before = params.before;
      if (params.after !== undefined) queryParams.after = params.after;

      return fetchCBETA('/lines', queryParams);
    },
  },
];
