import { z } from 'zod';

// CBETA API Types

export const SearchParamsSchema = z.object({
  keyword: z.string().describe('搜索关键词'),
  canon: z.string().optional().describe('藏经版本'),
  work: z.string().optional().describe('佛典编号'),
  juan: z.number().optional().describe('卷号'),
  start: z.number().optional().default(0).describe('起始位置'),
  rows: z.number().optional().default(20).describe('返回条数'),
  facet: z.string().optional().describe('分面字段'),
  sort: z.string().optional().describe('排序方式'),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export const CatalogParamsSchema = z.object({
  work: z.string().describe('佛典编号'),
});

export type CatalogParams = z.infer<typeof CatalogParamsSchema>;

export const WorkParamsSchema = z.object({
  work: z.string().describe('佛典编号'),
});

export type WorkParams = z.infer<typeof WorkParamsSchema>;

// API Response Types
export interface CBETASearchResponse {
  num_found: number;
  q: string;
  results: Array<{
    canon: string;
    work: string;
    juan: number;
    lb: string;
    body: string;
  }>;
}

export interface CBETACatalogResponse {
  work: string;
  title: string;
  creator: string;
  juan: number;
}

export interface CBETAWorkResponse {
  work: string;
  title: string;
  creator: string;
  juan: number;
}
