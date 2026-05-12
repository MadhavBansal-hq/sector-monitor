/**
 * Lightweight metric schemas (re-exported) for extraction file
 */
import { z } from 'zod';

export const FintechMetricsSchema = z.object({
  aum: z.number().optional(),
  aumGrowthQoQ: z.number().optional(),
  aumGrowthYoY: z.number().optional(),
  nim: z.number().optional(),
  nimTrend: z.enum(['improving','deteriorating','stable']).optional(),
  grossNPA: z.number().optional(),
  netNPA: z.number().optional(),
  creditCostBPS: z.number().optional(),
  digitalTransactionVolume: z.number().optional(),
  activeUserCount: z.number().optional(),
  costOfFunds: z.number().optional(),
}).strict();

export const DefenceMetricsSchema = z.object({
  orderBookValue: z.number().optional(),
  orderBookGrowthYoY: z.number().optional(),
  domesticRevenuePercentage: z.number().optional(),
  exportRevenuePercentage: z.number().optional(),
  ebitdaMargin: z.number().optional(),
  ebitdaTrend: z.enum(['improving','deteriorating','stable']).optional(),
  rdSpendPercentage: z.number().optional(),
  newOrderWins: z.number().optional(),
  newOrderWinsGeography: z.string().optional(),
  productCategory: z.string().optional(),
}).strict();

export const BiotechMetricsSchema = z.object({
  pipelineCountPhase1: z.number().optional(),
  pipelineCountPhase2: z.number().optional(),
  pipelineCountPhase3: z.number().optional(),
  pipelineCountNDABLASubmitted: z.number().optional(),
  totalPipelineCount: z.number().optional(),
  cashAndEquivalents: z.number().optional(),
  runwayQuarters: z.number().optional(),
  revenueByType: z.object({
    productRevenue: z.number().optional(),
    royaltyRevenue: z.number().optional(),
    collaborationRevenue: z.number().optional(),
  }).optional(),
}).strict();

export type FintechMetrics = z.infer<typeof FintechMetricsSchema>;
export type DefenceMetrics = z.infer<typeof DefenceMetricsSchema>;
export type BiotechMetrics = z.infer<typeof BiotechMetricsSchema>;
