/**
 * Refresh Scheduler
 * Handles weekly automated refresh and on-demand refresh of documents and synthesis
 */

import { createRefreshLog, updateRefreshLog, getLatestRefreshLog } from '../db';
import { fetchAllDocumentsForCompany } from '../ingestion/sources';
import { fetchAndParseDocument } from '../ingestion/parser';
import { extractMetricsBySector } from '../extraction/metrics';
import { generateSectorSynthesis, getMostRecentQuarters } from '../synthesis/engine';
import { notifyRefreshCompletion, notifyCriticalFailure, notifySynthesisGenerated } from '../notifications/owner';

export interface RefreshResult {
  sector: string;
  documentsChecked: number;
  newDocumentsFound: number;
  errors: string[];
  status: 'completed' | 'failed';
}

/**
 * Company configuration for ingestion
 */
const COMPANY_CONFIG: Record<string, any> = {
  // Fintech
  'Bajaj Finance': { sector: 'fintech', ticker: 'BAJAJFINSV', exchange: 'NSE', cik: '' },
  'SBI Cards': { sector: 'fintech', ticker: 'SBICARD', exchange: 'NSE', cik: '' },
  'Paytm': { sector: 'fintech', ticker: 'PAYTM', exchange: 'NSE', cik: '' },
  'PB Fintech': { sector: 'fintech', ticker: 'PBFINTECH', exchange: 'NSE', cik: '' },
  'CAMS': { sector: 'fintech', ticker: 'CAMS', exchange: 'NSE', cik: '' },
  'CDSL': { sector: 'fintech', ticker: 'CDSL', exchange: 'NSE', cik: '' },
  'Zaggle': { sector: 'fintech', ticker: 'ZAGGLE', exchange: 'NSE', cik: '' },
  'CreditAccess Grameen': { sector: 'fintech', ticker: 'CREDITACC', exchange: 'NSE', cik: '' },
  'Five Star Business Finance': { sector: 'fintech', ticker: 'FIVESTAR', exchange: 'NSE', cik: '' },
  
  // Defence
  'HAL': { sector: 'defence', ticker: 'HAL', exchange: 'NSE', cik: '' },
  'BEL': { sector: 'defence', ticker: 'BEL', exchange: 'NSE', cik: '' },
  'MTAR Technologies': { sector: 'defence', ticker: 'MTAR', exchange: 'NSE', cik: '' },
  'Paras Defence': { sector: 'defence', ticker: 'PARASDEF', exchange: 'NSE', cik: '' },
  'Astra Microwave': { sector: 'defence', ticker: 'ASTRATECH', exchange: 'NSE', cik: '' },
  'Data Patterns': { sector: 'defence', ticker: 'DATAPATTERN', exchange: 'NSE', cik: '' },
  'Zen Technologies': { sector: 'defence', ticker: 'ZENTECH', exchange: 'NSE', cik: '' },
  'Bharat Forge': { sector: 'defence', ticker: 'BHARATFORG', exchange: 'NSE', cik: '' },
  
  // Biotech
  'Moderna': { sector: 'biotech', ticker: 'MRNA', exchange: 'NASDAQ', cik: '1682852' },
  'Regeneron': { sector: 'biotech', ticker: 'REGN', exchange: 'NASDAQ', cik: '1102312' },
  'Vertex Pharmaceuticals': { sector: 'biotech', ticker: 'VRTX', exchange: 'NASDAQ', cik: '875320' },
  'Biogen': { sector: 'biotech', ticker: 'BIIB', exchange: 'NASDAQ', cik: '875094' },
  'Illumina': { sector: 'biotech', ticker: 'ILMN', exchange: 'NASDAQ', cik: '1084701' },
  '10x Genomics': { sector: 'biotech', ticker: 'TXG', exchange: 'NASDAQ', cik: '1770787' },
  'Pacific Biosciences': { sector: 'biotech', ticker: 'PACB', exchange: 'NASDAQ', cik: '1385543' },
  'Recursion Pharmaceuticals': { sector: 'biotech', ticker: 'RXRX', exchange: 'NASDAQ', cik: '1845701' },
};

/**
 * Run refresh for a specific sector
 */
export async function refreshSector(sector: 'fintech' | 'defence' | 'biotech'): Promise<RefreshResult> {
  const errors: string[] = [];
  let documentsChecked = 0;
  let newDocumentsFound = 0;
  
  // Create refresh log entry
  const logId = await createRefreshLog({
    sector,
    runTimestamp: new Date(),
    status: 'in_progress',
  });
  
  try {
    // Get companies for this sector
    const companies = Object.entries(COMPANY_CONFIG)
      .filter(([_, config]) => config.sector === sector)
      .map(([name, config]) => ({ name, ...config }));
    
    for (const company of companies) {
      try {
        // Fetch documents for company
        const documents = await fetchAllDocumentsForCompany(
          company.name,
          company.ticker,
          sector,
          company.cik
        );
        
        documentsChecked += documents.length;
        
        for (const doc of documents) {
          try {
            // Parse document
            const parsed = await fetchAndParseDocument(doc.url, doc.title);
            
            if (parsed) {
              newDocumentsFound++;
              
              // Extract metrics from document chunks
              for (const chunk of parsed.chunks.slice(0, 3)) {
                const metrics = await extractMetricsBySector(chunk, company.name, sector);
                
                if (metrics) {
                  console.log(`[Refresh] Extracted metrics for ${company.name}`);
                }
              }
            }
          } catch (error) {
            const errorMsg = `Error processing ${doc.url}: ${error}`;
            errors.push(errorMsg);
            console.error(`[Refresh] ${errorMsg}`);
          }
        }
      } catch (error) {
        const errorMsg = `Error fetching documents for ${company.name}: ${error}`;
        errors.push(errorMsg);
        console.error(`[Refresh] ${errorMsg}`);
      }
    }
    
    // Generate synthesis for the sector
    const quarters = await getMostRecentQuarters(4);
    const synthesis = await generateSectorSynthesis(sector, quarters);
    
    if (!synthesis) {
      errors.push(`Failed to generate synthesis for ${sector}`);
    }
    
    // Update refresh log
    if (logId) {
      await updateRefreshLog(logId as any, {
        documentsChecked,
        newDocumentsFound,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        status: 'completed',
      });
    }
    
    // Send notifications
    if (errors.length > 0) {
      const failedCompanies = companies
        .filter((c: any) => errors.some(e => e.includes(c.name)))
        .map((c: any) => c.name);
      
      if (failedCompanies.length > 0) {
        await notifyCriticalFailure(sector, failedCompanies, errors[0] || 'Unknown error');
      }
    } else {
      await notifyRefreshCompletion(sector, documentsChecked, newDocumentsFound, []);
    }
    
    // Notify synthesis generation
    if (synthesis) {
      await notifySynthesisGenerated(sector, synthesis.period);
    }
    
    return {
      sector,
      documentsChecked,
      newDocumentsFound,
      errors,
      status: 'completed',
    };
  } catch (error) {
    const errorMsg = `Critical error during refresh: ${error}`;
    errors.push(errorMsg);
    console.error(`[Refresh] ${errorMsg}`);
    
    // Update refresh log with failure
    if (logId) {
      await updateRefreshLog(logId as any, {
        errors: JSON.stringify(errors),
        status: 'failed',
      });
    }
    
    // Notify of critical failure
    await notifyCriticalFailure(sector, [], errorMsg);
    
    return {
      sector,
      documentsChecked,
      newDocumentsFound,
      errors,
      status: 'failed',
    };
  }
}

/**
 * Run refresh for all sectors
 */
export async function refreshAllSectors(): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];
  
  const sectors: Array<'fintech' | 'defence' | 'biotech'> = ['fintech', 'defence', 'biotech'];
  
  for (const sector of sectors) {
    const result = await refreshSector(sector);
    results.push(result);
  }
  
  return results;
}

/**
 * Get refresh status
 */
export async function getRefreshStatus(sector?: string) {
  const latestLog = await getLatestRefreshLog(sector);
  
  return {
    lastRefresh: latestLog?.runTimestamp,
    status: latestLog?.status,
    documentsChecked: latestLog?.documentsChecked,
    newDocumentsFound: latestLog?.newDocumentsFound,
    errors: latestLog?.errors ? JSON.parse(latestLog.errors) : [],
  };
}
