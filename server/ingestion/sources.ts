/**
 * Document Ingestion Pipeline
 * Fetches earnings transcripts, investor presentations, and quarterly financials
 * from multiple sources: SEC EDGAR, BSE/NSE, Screener.in, Macrotrends, Brave Search
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SourceDocument {
  url: string;
  title: string;
  documentType: 'earnings_call_transcript' | 'investor_presentation' | 'quarterly_financial_statement' | 'annual_report' | 'other';
  period: string;
  company: string;
  sector: string;
  content?: string;
}

/**
 * SEC EDGAR - US Companies (Biotech)
 * Fetches 10-Q, 10-K, 8-K filings
 */
export async function fetchFromSECEdgar(ticker: string, cik: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  
  try {
    // SEC EDGAR API endpoint for company filings
    const edgarUrl = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
    const response = await axios.get(edgarUrl, { timeout: 10000 });
    
    const filings = response.data.filings.recent.filings || [];
    
    for (const filing of filings.slice(0, 20)) {
      const form = filing.form;
      let documentType: SourceDocument['documentType'] = 'other';
      
      if (form === '10-Q') documentType = 'quarterly_financial_statement';
      else if (form === '10-K') documentType = 'annual_report';
      else if (form === '8-K') documentType = 'other';
      
      const accessionNumber = filing.accessionNumber.replace(/-/g, '');
      const url = `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${filing.accessionNumber}&xbrl_type=v`;
      
      documents.push({
        url,
        title: `${ticker} ${form} - ${filing.filingDate}`,
        documentType,
        period: filing.filingDate,
        company: ticker,
        sector: 'biotech',
      });
    }
  } catch (error) {
    console.error(`[SEC EDGAR] Error fetching ${ticker}:`, error);
  }
  
  return documents;
}

/**
 * BSE/NSE Filings Portal - Indian Companies
 * Fetches concall transcripts and annual reports
 */
export async function fetchFromBSENSE(company: string, sector: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  
  try {
    // BSE/NSE filings typically require scraping or API access
    // Using a generic search approach for demonstration
    const searchUrl = `https://www.bseindia.com/corporates/`;
    
    // In production, this would require proper authentication and parsing
    // For now, we'll return empty and rely on Screener.in for Indian data
    console.log(`[BSE/NSE] Placeholder for ${company}`);
  } catch (error) {
    console.error(`[BSE/NSE] Error fetching ${company}:`, error);
  }
  
  return documents;
}

/**
 * Screener.in - Indian Financial Data
 * Fetches structured historical financials and reports
 */
export async function fetchFromScreener(company: string, sector: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  
  try {
    // Screener.in provides structured financial data
    // This would require API access or web scraping
    const screenerUrl = `https://www.screener.in/company/${company.toLowerCase()}/`;
    
    // In production, parse the page to extract financial statements
    console.log(`[Screener.in] Placeholder for ${company}`);
  } catch (error) {
    console.error(`[Screener.in] Error fetching ${company}:`, error);
  }
  
  return documents;
}

/**
 * Macrotrends.net - Historical Financial Data
 * Fetches historical financials for US companies
 */
export async function fetchFromMacrotrends(ticker: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  
  try {
    // Macrotrends provides historical financial data
    const macrotrendsUrl = `https://www.macrotrends.net/stocks/charts/${ticker.toLowerCase()}/`;
    
    // In production, parse financial statements from the page
    console.log(`[Macrotrends] Placeholder for ${ticker}`);
  } catch (error) {
    console.error(`[Macrotrends] Error fetching ${ticker}:`, error);
  }
  
  return documents;
}

/**
 * Brave Search API - Document Discovery
 * Uses Brave Search to locate IR pages and filing PDFs
 */
export async function fetchFromBraveSearch(company: string, sector: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  
  try {
    // Brave Search API for locating documents
    // Requires API key from environment
    const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
    
    if (!braveApiKey) {
      console.warn('[Brave Search] API key not configured');
      return documents;
    }
    
    const searchQueries = [
      `${company} earnings call transcript filetype:pdf`,
      `${company} investor presentation filetype:pdf`,
      `${company} quarterly financial statement filetype:pdf`,
      `${company} annual report filetype:pdf`,
    ];
    
    for (const query of searchQueries) {
      const braveUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(braveUrl, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': braveApiKey,
        },
        timeout: 10000,
      });
      
      const results = response.data.web || [];
      
      for (const result of results.slice(0, 5)) {
        let documentType: SourceDocument['documentType'] = 'other';
        
        if (query.includes('earnings')) documentType = 'earnings_call_transcript';
        else if (query.includes('presentation')) documentType = 'investor_presentation';
        else if (query.includes('financial')) documentType = 'quarterly_financial_statement';
        else if (query.includes('annual')) documentType = 'annual_report';
        
        documents.push({
          url: result.url,
          title: result.title,
          documentType,
          period: new Date().toISOString().split('T')[0],
          company,
          sector,
        });
      }
    }
  } catch (error) {
    console.error(`[Brave Search] Error fetching ${company}:`, error);
  }
  
  return documents;
}

/**
 * Company IR Pages - Direct Scraping
 * Fetches investor presentations and reports from company websites
 */
export async function fetchFromCompanyIR(company: string, irPageUrl: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];
  
  try {
    const response = await axios.get(irPageUrl, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    // Look for PDF links and document references
    const links = $('a[href*=".pdf"]');
    
    links.each((_: number, element: any) => {
      const href = $(element).attr('href');
      const text = $(element).text();
      
      if (href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, irPageUrl).href;
        
        let documentType: SourceDocument['documentType'] = 'other';
        
        if (text.toLowerCase().includes('earnings') || text.toLowerCase().includes('transcript')) {
          documentType = 'earnings_call_transcript';
        } else if (text.toLowerCase().includes('presentation')) {
          documentType = 'investor_presentation';
        } else if (text.toLowerCase().includes('financial') || text.toLowerCase().includes('statement')) {
          documentType = 'quarterly_financial_statement';
        } else if (text.toLowerCase().includes('annual')) {
          documentType = 'annual_report';
        }
        
        documents.push({
          url: fullUrl,
          title: text || 'Investor Document',
          documentType,
          period: new Date().toISOString().split('T')[0],
          company,
          sector: 'unknown',
        });
      }
    });
  } catch (error) {
    console.error(`[Company IR] Error fetching from ${irPageUrl}:`, error);
  }
  
  return documents;
}

/**
 * Fetch all available documents for a company
 */
export async function fetchAllDocumentsForCompany(
  company: string,
  ticker: string,
  sector: string,
  cik?: string,
  irPageUrl?: string
): Promise<SourceDocument[]> {
  const allDocuments: SourceDocument[] = [];
  
  // Fetch from all available sources
  if (sector === 'biotech' && cik) {
    const secDocs = await fetchFromSECEdgar(ticker, cik);
    allDocuments.push(...secDocs);
  }
  
  if (sector === 'fintech' || sector === 'defence') {
    const screenerDocs = await fetchFromScreener(company, sector);
    allDocuments.push(...screenerDocs);
  }
  
  if (sector === 'biotech') {
    const macroDocs = await fetchFromMacrotrends(ticker);
    allDocuments.push(...macroDocs);
  }
  
  // Always try Brave Search
  const braveDocs = await fetchFromBraveSearch(company, sector);
  allDocuments.push(...braveDocs);
  
  // Try company IR page if provided
  if (irPageUrl) {
    const irDocs = await fetchFromCompanyIR(company, irPageUrl);
    allDocuments.push(...irDocs);
  }
  
  // Deduplicate by URL
  const uniqueUrls = new Set<string>();
  const deduplicatedDocs: SourceDocument[] = [];
  
  for (const doc of allDocuments) {
    if (!uniqueUrls.has(doc.url)) {
      uniqueUrls.add(doc.url);
      deduplicatedDocs.push(doc);
    }
  }
  
  return deduplicatedDocs;
}
