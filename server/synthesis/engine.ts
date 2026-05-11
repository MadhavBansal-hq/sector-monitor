/**
 * Synthesis Engine
 * Generates per-sector narratives and investing lens from extracted metrics
 */

import { invokeLLM } from '../_core/llm';
import { getMetrics, getCompanies } from '../db';

export interface SectorSynthesis {
  sector: string;
  period: string;
  synthesisText: string;
  investingLensText: string;
  generatedAt: Date;
}

/**
 * Generate sector-level synthesis across all companies
 */
export async function generateSectorSynthesis(
  sector: 'fintech' | 'defence' | 'biotech',
  periods: string[] // Most recent 4 quarters
): Promise<SectorSynthesis | null> {
  try {
    // Fetch all companies in the sector
    const companies = await getCompanies(sector);
    
    if (!companies || companies.length === 0) {
      console.warn(`[Synthesis] No companies found for sector: ${sector}`);
      return null;
    }
    
    // Collect metrics for all companies across periods
    const metricsData: Record<string, any> = {};
    
    for (const company of companies) {
      metricsData[company.name] = {};
      
      for (const period of periods) {
        const metrics = await getMetrics(company.id, period);
        metricsData[company.name][period] = metrics;
      }
    }
    
    // Generate synthesis narrative
    const synthesisText = await generateSynthesisNarrative(sector, metricsData, periods);
    
    // Generate investing lens
    const investingLensText = await generateInvestingLens(sector, metricsData, periods);
    
    return {
      sector,
      period: periods[0], // Most recent period
      synthesisText,
      investingLensText,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error(`[Synthesis] Error generating synthesis for ${sector}:`, error);
    return null;
  }
}

/**
 * Generate sector-level narrative
 */
async function generateSynthesisNarrative(
  sector: string,
  metricsData: Record<string, any>,
  periods: string[]
): Promise<string> {
  try {
    const metricsJson = JSON.stringify(metricsData, null, 2);
    
    const systemPrompt = `You are a financial analyst synthesizing sector trends from company metrics.
Generate a concise, insightful narrative about the ${sector} sector based on the provided metrics.

Focus on:
1. Which metrics are consistently improving or deteriorating across companies?
2. What product bets are multiple companies making simultaneously?
3. What is structurally new vs cyclical in the sector?
4. Key competitive dynamics and market positioning

Keep the narrative to 3-4 paragraphs, professional and data-driven.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Analyze these ${sector} sector metrics from the last ${periods.length} quarters:\n\n${metricsJson}`,
        },
      ],
    });

    const messageContent = response.choices[0]?.message.content;
    return typeof messageContent === 'string' ? messageContent : '';
  } catch (error) {
    console.error('[Synthesis] Error generating narrative:', error);
    return '';
  }
}

/**
 * Generate investing lens insights
 */
async function generateInvestingLens(
  sector: string,
  metricsData: Record<string, any>,
  periods: string[]
): Promise<string> {
  try {
    const metricsJson = JSON.stringify(metricsData, null, 2);
    
    const systemPrompt = `You are an early-stage investor analyzing sector opportunities.
Generate an investing lens for the ${sector} sector based on company metrics.

Address these questions:
1. Where are incumbents investing that validates startup markets?
2. Where are incumbents struggling, creating white spaces for startups?
3. What are they buying or partnering on rather than building?
4. What metric benchmarks should inform early-stage company evaluation?

Keep the lens to 3-4 paragraphs, focused on actionable investment insights.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Provide investing lens for ${sector} sector based on these metrics:\n\n${metricsJson}`,
        },
      ],
    });

    const messageContent = response.choices[0]?.message.content;
    return typeof messageContent === 'string' ? messageContent : '';
  } catch (error) {
    console.error('[Synthesis] Error generating investing lens:', error);
    return '';
  }
}

/**
 * Get the most recent 4 quarters for a sector
 */
export async function getMostRecentQuarters(count: number = 4): Promise<string[]> {
  // This would typically query the database for available periods
  // For now, return a placeholder that would be populated from actual data
  const quarters: string[] = [];
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Calculate current quarter (1-4)
  let currentQuarter = Math.ceil(currentMonth / 3);
  
  for (let i = 0; i < count; i++) {
    let year = currentYear;
    let quarter = currentQuarter - i;
    
    if (quarter <= 0) {
      quarter += 4;
      year -= 1;
    }
    
    quarters.push(`Q${quarter}FY${year % 100}`);
  }
  
  return quarters;
}
