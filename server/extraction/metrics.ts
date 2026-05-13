/**
 * Metrics Extraction (simple, keyword-based placeholder)
 */

import { FintechMetricsSchema, DefenceMetricsSchema, BiotechMetricsSchema } from './metrics.schemas';
import type { FintechMetrics, DefenceMetrics, BiotechMetrics } from './metrics.schemas';

// Re-export schemas for tests
export { FintechMetricsSchema, DefenceMetricsSchema, BiotechMetricsSchema };
export type { FintechMetrics, DefenceMetrics, BiotechMetrics };

// This file provides a lightweight extraction function used by the refresher.
// In production this should call an LLM with proper prompts and schema enforcement.

export async function extractMetricsBySector(chunk: string, companyName: string, sector: 'fintech' | 'defence' | 'biotech') {
  // Very naive keyword extraction for demo purposes
  try {
    if (!chunk || chunk.length === 0) return null;

    if (sector === 'fintech') {
      const result: Partial<FintechMetrics> = {};
      const m = chunk.match(/AUM[:\s]*([0-9,.]+)/i);
      if (m) result.aum = Number(m[1].replace(/,/g, ''));
      const nim = chunk.match(/NIM[:\s]*([0-9.]+)%?/i);
      if (nim) result.nim = Number(nim[1]);
      return result;
    }

    if (sector === 'defence') {
      const result: Partial<DefenceMetrics> = {};
      const ob = chunk.match(/order book[:\s]*([0-9,.]+)/i);
      if (ob) result.orderBookValue = Number(ob[1].replace(/,/g, ''));
      const ebitda = chunk.match(/EBITDA[:\s]*([0-9.]+)%/i);
      if (ebitda) result.ebitdaMargin = Number(ebitda[1]);
      return result;
    }

    if (sector === 'biotech') {
      const result: Partial<BiotechMetrics> = {};
      const pipeline = chunk.match(/phase\s*1[:\s]*([0-9]+)/i) || chunk.match(/phase\s*1\s*count[:\s]*([0-9]+)/i);
      if (pipeline) result.pipelineCountPhase1 = Number(pipeline[1]);
      const cash = chunk.match(/cash[:\s]*\$?([0-9,.]+)/i);
      if (cash) result.cashAndEquivalents = Number(cash[1].replace(/,/g, ''));
      return result;
    }

    return null;
  } catch (e) {
    console.error('[extractMetricsBySector] error', e);
    return null;
  }
}
