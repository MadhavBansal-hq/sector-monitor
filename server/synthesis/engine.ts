/**
 * Sector synthesis engine (simple implementation)
 */
import * as db from '../db';

export function getMostRecentQuarters(count: number = 4): string[] {
  const now = new Date();
  const quarters: string[] = [];
  let year = now.getFullYear();
  const month = now.getMonth() + 1;
  let currentQuarter = Math.ceil(month / 3);

  for (let i = 0; i < count; i++) {
    const q = currentQuarter - i;
    let qLabel = q;
    let y = year;
    if (q <= 0) {
      qLabel = ((q % 4) + 4) % 4 || 4;
      y = year - Math.ceil(Math.abs(q) / 4);
    }
    quarters.push(`Q${qLabel}FY${String(y).slice(-2)}`);
  }

  return quarters;
}

export async function generateSectorSynthesis(sector: 'fintech' | 'defence' | 'biotech', quarters: string[]) {
  try {
    // Simple placeholder: summarize that synthesis has been generated
    const synthesisText = `Synthesis for ${sector} for periods ${quarters.join(', ')}.`;
    const investingLensText = `Investing lens for ${sector}: monitor key metrics and runway.`;

    const record = {
      sector,
      period: quarters[0] || 'unknown',
      synthesisText,
      investingLensText,
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    // Persist synthesis (db.createSynthesis returns insert result)
    await db.createSynthesis(record);

    return record;
  } catch (e) {
    console.error('[synthesis] generateSectorSynthesis error', e);
    return null;
  }
}
