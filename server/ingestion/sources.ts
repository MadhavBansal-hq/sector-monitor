/**
 * Document Ingestion Sources
 */

import axios from 'axios';

export interface SourceDocument {
  url: string;
  title: string;
  documentType: 'earnings_call_transcript' | 'investor_presentation' | 'quarterly_financial_statement' | 'annual_report' | 'other';
  period: string;
  company: string;
  sector: string;
  content?: string;
}

export async function fetchFromSECEdgar(ticker: string, cik: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  if (!cik) return documents;

  try {
    const edgarUrl = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
    const resp = await axios.get(edgarUrl, { timeout: 10000 });
    const filings = resp.data.filings?.recent?.filings || resp.data.filings?.recent?.accessionNumbers || [];

    // Best-effort parsing
    const recent = resp.data.filings?.recent?.recent || resp.data.filings?.recent || resp.data.filings || [];
    // Fallback: if structure unknown, return empty
    if (!Array.isArray(recent)) return documents;

    for (const filing of recent.slice(0, 20)) {
      const form = filing.form || filing.type || filing.formType;
      let documentType: SourceDocument['documentType'] = 'other';
      if (form === '10-Q') documentType = 'quarterly_financial_statement';
      else if (form === '10-K') documentType = 'annual_report';

      const filingDate = filing.filingDate || filing.filing_date || filing.date || filing.filingdate || '';
      const accession = filing.accessionNumber || filing.accession || '';
      const url = accession
        ? `https://www.sec.gov/ix?doc=/Archives/edgar/data/${cik}/${accession.replace(/-/g, '')}/${accession}.txt`
        : `https://www.sec.gov/`; 

      documents.push({
        url,
        title: `${ticker} ${form} - ${filingDate}`,
        documentType,
        period: filingDate || '',
        company: ticker,
        sector: 'biotech',
      });
    }
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.warn(`[SECEdgar] failed for ${ticker}:`, errorMsg);
  }

  return documents;
}

export async function fetchFromBSENSE(company: string): Promise<SourceDocument[]> {
  // Placeholder - live scraping of BSE/NSE needs selectors and might be fragile
  // Return empty array to avoid introducing brittle code
  return [];
}

export async function fetchFromScreener(company: string): Promise<SourceDocument[]> {
  // Placeholder - Screener scraping is beyond scope; return empty
  return [];
}

export async function fetchAllDocumentsForCompany(company: string, ticker: string, sector: string, cik: string): Promise<SourceDocument[]> {
  const results: SourceDocument[] = [];

  try {
    if (sector === 'biotech') {
      const edgar = await fetchFromSECEdgar(ticker, cik);
      results.push(...edgar);
    }

    // For Indian companies we might use Screener/BSE data
    const screener = await fetchFromScreener(company);
    results.push(...screener);

    const bse = await fetchFromBSENSE(company);
    results.push(...bse);

    // Dedupe by URL
    const seen = new Set<string>();
    const unique = results.filter((d) => {
      if (!d.url) return false;
      if (seen.has(d.url)) return false;
      seen.add(d.url);
      return true;
    });

    return unique;
  } catch (e) {
    console.error(`[Sources] fetchAllDocumentsForCompany error for ${company}:`, e);
    return [];
  }
}
