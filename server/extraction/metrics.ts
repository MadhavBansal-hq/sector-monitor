/**
 * Metrics Extraction Layer
 * Uses LLM to extract typed, validated metrics from documents
 * Implements Pydantic-style validation for structured output
 */

import { z } from 'zod';
import { invokeLLM } from '../_core/llm';

/**
 * Fintech Sector Metrics Schema
 */
export const FintechMetricsSchema = z.object({
  aum: z.number().optional().describe('Assets Under Management in INR Crores'),
  aumGrowthQoQ: z.number().optional().describe('QoQ AUM growth percentage'),
  aumGrowthYoY: z.number().optional().describe('YoY AUM growth percentage'),
  nim: z.number().optional().describe('Net Interest Margin percentage'),
  nimTrend: z.enum(['improving', 'deteriorating', 'stable']).optional(),
  grossNPA: z.number().optional().describe('Gross NPA percentage'),
  netNPA: z.number().optional().describe('Net NPA percentage'),
  creditCostBPS: z.number().optional().describe('Credit cost in basis points'),
  digitalTransactionVolume: z.number().optional().describe('Digital transaction volume in millions'),
  activeUserCount: z.number().optional().describe('Active user count in millions'),
  costOfFunds: z.number().optional().describe('Cost of funds percentage'),
})
.strict();

export type FintechMetrics = z.infer<typeof FintechMetricsSchema>;

/**
 * Defence Sector Metrics Schema
 */
export const DefenceMetricsSchema = z.object({
  orderBookValue: z.number().optional().describe('Order book value in INR Crores'),
  orderBookGrowthYoY: z.number().optional().describe('YoY order book growth percentage'),
  domesticRevenuePercentage: z.number().optional().describe('Domestic revenue as % of total'),
  exportRevenuePercentage: z.number().optional().describe('Export revenue as % of total'),
  ebitdaMargin: z.number().optional().describe('EBITDA margin percentage'),
  ebitdaTrend: z.enum(['improving', 'deteriorating', 'stable']).optional(),
  rdSpendPercentage: z.number().optional().describe('R&D spend as % of revenue'),
  newOrderWins: z.number().optional().describe('New order wins in INR Crores'),
  newOrderWinsGeography: z.string().optional().describe('Geography of new wins'),
  productCategory: z.string().optional().describe('Product category of new wins'),
})
.strict();

export type DefenceMetrics = z.infer<typeof DefenceMetricsSchema>;

/**
 * Biotech Sector Metrics Schema
 */
export const BiotechMetricsSchema = z.object({
  pipelineCountPhase1: z.number().optional().describe('Number of Phase 1 programs'),
  pipelineCountPhase2: z.number().optional().describe('Number of Phase 2 programs'),
  pipelineCountPhase3: z.number().optional().describe('Number of Phase 3 programs'),
  pipelineCountNDABLASubmitted: z.number().optional().describe('Number of NDA/BLA submitted'),
  totalPipelineCount: z.number().optional().describe('Total pipeline count'),
  cashAndEquivalents: z.number().optional().describe('Cash and equivalents in USD Millions'),
  runwayQuarters: z.number().optional().describe('Cash runway in quarters'),
  revenueByType: z.object({
    productRevenue: z.number().optional(),
    royaltyRevenue: z.number().optional(),
    collaborationRevenue: z.number().optional(),
  }).optional().describe('Revenue breakdown by type'),
  clinicalTrialReadouts: z.array(z.object({
    programName: z.string(),
    outcome: z.enum(['positive', 'negative', 'mixed']),
    indication: z.string(),
  })).optional().describe('Recent clinical trial readouts'),
  aiMLInvestment: z.string().optional().describe('AI/ML investment or partnership callouts'),
})
.strict();

export type BiotechMetrics = z.infer<typeof BiotechMetricsSchema>;

/**
 * Extract Fintech metrics from document content
 */
export async function extractFintechMetrics(content: string, company: string): Promise<FintechMetrics | null> {
  try {
    const systemPrompt = `You are a financial analyst extracting key metrics from fintech company documents.
Extract the following metrics from the provided content:
- AUM (Assets Under Management) and growth rates (QoQ, YoY)
- NIM (Net Interest Margin) and trend
- NPA metrics (Gross and Net)
- Credit cost in basis points
- Digital transaction volumes and active user counts
- Cost of funds

Return ONLY valid JSON matching the schema. If a metric is not found, omit it.
Never include explanations or markdown formatting.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Extract metrics from this ${company} document:\n\n${content}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'fintech_metrics',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              aum: { type: 'number' },
              aumGrowthQoQ: { type: 'number' },
              aumGrowthYoY: { type: 'number' },
              nim: { type: 'number' },
              nimTrend: { type: 'string', enum: ['improving', 'deteriorating', 'stable'] },
              grossNPA: { type: 'number' },
              netNPA: { type: 'number' },
              creditCostBPS: { type: 'number' },
              digitalTransactionVolume: { type: 'number' },
              activeUserCount: { type: 'number' },
              costOfFunds: { type: 'number' },
            },
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message.content;
    const responseText = typeof messageContent === 'string' ? messageContent : '';
    const parsed = JSON.parse(responseText);
    const validated = FintechMetricsSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error(`[Extraction] Error extracting Fintech metrics for ${company}:`, error);
    return null;
  }
}

/**
 * Extract Defence metrics from document content
 */
export async function extractDefenceMetrics(content: string, company: string): Promise<DefenceMetrics | null> {
  try {
    const systemPrompt = `You are a financial analyst extracting key metrics from defence company documents.
Extract the following metrics from the provided content:
- Order book value and growth rates
- Domestic vs export revenue percentages
- EBITDA margin and trend
- R&D spend as % of revenue
- New order wins with geography and product category

Return ONLY valid JSON matching the schema. If a metric is not found, omit it.
Never include explanations or markdown formatting.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Extract metrics from this ${company} document:\n\n${content}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'defence_metrics',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              orderBookValue: { type: 'number' },
              orderBookGrowthYoY: { type: 'number' },
              domesticRevenuePercentage: { type: 'number' },
              exportRevenuePercentage: { type: 'number' },
              ebitdaMargin: { type: 'number' },
              ebitdaTrend: { type: 'string', enum: ['improving', 'deteriorating', 'stable'] },
              rdSpendPercentage: { type: 'number' },
              newOrderWins: { type: 'number' },
              newOrderWinsGeography: { type: 'string' },
              productCategory: { type: 'string' },
            },
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message.content;
    const responseText = typeof messageContent === 'string' ? messageContent : '';
    const parsed = JSON.parse(responseText);
    const validated = DefenceMetricsSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error(`[Extraction] Error extracting Defence metrics for ${company}:`, error);
    return null;
  }
}

/**
 * Extract Biotech metrics from document content
 */
export async function extractBiotechMetrics(content: string, company: string): Promise<BiotechMetrics | null> {
  try {
    const systemPrompt = `You are a financial analyst extracting key metrics from biotech company documents.
Extract the following metrics from the provided content:
- Pipeline count by stage (Phase 1, 2, 3, NDA/BLA submitted)
- Cash and equivalents, runway in quarters
- Revenue breakdown (product, royalty, collaboration)
- Clinical trial readouts with outcomes and indications
- AI/ML investments or partnerships

Return ONLY valid JSON matching the schema. If a metric is not found, omit it.
Never include explanations or markdown formatting.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Extract metrics from this ${company} document:\n\n${content}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'biotech_metrics',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              pipelineCountPhase1: { type: 'number' },
              pipelineCountPhase2: { type: 'number' },
              pipelineCountPhase3: { type: 'number' },
              pipelineCountNDABLASubmitted: { type: 'number' },
              totalPipelineCount: { type: 'number' },
              cashAndEquivalents: { type: 'number' },
              runwayQuarters: { type: 'number' },
              revenueByType: {
                type: 'object',
                properties: {
                  productRevenue: { type: 'number' },
                  royaltyRevenue: { type: 'number' },
                  collaborationRevenue: { type: 'number' },
                },
              },
              clinicalTrialReadouts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    programName: { type: 'string' },
                    outcome: { type: 'string', enum: ['positive', 'negative', 'mixed'] },
                    indication: { type: 'string' },
                  },
                },
              },
              aiMLInvestment: { type: 'string' },
            },
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message.content;
    const responseText = typeof messageContent === 'string' ? messageContent : '';
    const parsed = JSON.parse(responseText);
    const validated = BiotechMetricsSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error(`[Extraction] Error extracting Biotech metrics for ${company}:`, error);
    return null;
  }
}

/**
 * Extract metrics based on sector
 */
export async function extractMetricsBySector(
  content: string,
  company: string,
  sector: 'fintech' | 'defence' | 'biotech'
): Promise<Record<string, any> | null> {
  if (sector === 'fintech') {
    return extractFintechMetrics(content, company);
  } else if (sector === 'defence') {
    return extractDefenceMetrics(content, company);
  } else if (sector === 'biotech') {
    return extractBiotechMetrics(content, company);
  }
  
  return null;
}
