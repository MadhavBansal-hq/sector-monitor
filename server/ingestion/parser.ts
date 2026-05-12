/**
 * Document Parser and Chunker
 * Handles PDF and HTML parsing, intelligent chunking for LLM processing
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ParsedDocument {
  content: string;
  chunks: string[];
  metadata: {
    url: string;
    title: string;
    fetchedAt: Date;
    contentLength: number;
  };
}

/**
 * Parse HTML content
 */
export async function parseHTML(url: string, htmlContent: string): Promise<string> {
  try {
    const $ = cheerio.load(htmlContent);
    
    // Remove script and style tags
    $('script').remove();
    $('style').remove();
    $('noscript').remove();
    
    // Extract main content
    let content = '';
    
    // Try to find main content areas
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.main-content', '#content'];
    
    for (const selector of mainSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }
    
    // If no main content found, use body text
    if (!content) {
      content = $('body').text();
    }
    
    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .trim();
    
    return content;
  } catch (error) {
    console.error(`[Parser] Error parsing HTML from ${url}:`, error);
    return '';
  }
}

/**
 * Parse PDF content (simplified - in production would use pdf-parse or similar)
 * For now, we'll handle text extraction from PDFs
 */
export async function parsePDF(url: string): Promise<string> {
  try {
    // Download PDF
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    // In production, use pdf-parse or pdfjs to extract text
    // For now, return a placeholder indicating PDF was fetched
    const buffer = response.data as Buffer;
    
    // Simple heuristic: PDFs are binary, so we'll mark them for special handling
    // In production, integrate with pdf-parse:
    // const pdf = await pdfParse(buffer);
    // return pdf.text;
    
    console.log(`[Parser] PDF fetched from ${url}, size: ${buffer.length} bytes`);
    return `[PDF Content from ${url} - requires pdf-parse for full extraction]`;
  } catch (error) {
    console.error(`[Parser] Error parsing PDF from ${url}:`, error);
    return '';
  }
}

/**
 * Chunk content into overlapping segments for LLM processing
 */
function chunkContent(content: string, chunkSize: number = 2000, overlap: number = 200): string[] {
  if (content.length <= chunkSize) {
    return [content];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    chunks.push(content.slice(start, end));
    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

/**
 * Fetch and parse document from URL
 */
export async function fetchAndParseDocument(url: string, title: string): Promise<ParsedDocument | null> {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      maxContentLength: 50 * 1024 * 1024, // 50MB limit
    });
    
    let content = '';
    
    // Determine content type
    const contentType = (response.headers && response.headers['content-type']) || '';
    
    if (url.endsWith('.pdf') || (typeof contentType === 'string' && contentType.includes('application/pdf'))) {
      // For PDFs, we'd need pdf-parse library
      content = await parsePDF(url);
    } else if (typeof contentType === 'string' && contentType.includes('text/html') || url.endsWith('.html')) {
      content = await parseHTML(url, response.data as string);
    } else if (typeof contentType === 'string' && contentType.includes('text/plain') || url.endsWith('.txt')) {
      content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } else {
      // Try to parse as JSON or other formats
      content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    }
    
    if (!content) {
      console.warn(`[Parser] No content extracted from ${url}`);
      return null;
    }

    // Split into chunks
    const chunks = chunkContent(content);

    return {
      content,
      chunks,
      metadata: {
        url,
        title,
        fetchedAt: new Date(),
        contentLength: content.length,
      },
    };
  } catch (error) {
    console.error(`[Parser] Error fetching/parsing document from ${url}:`, error);
    return null;
  }
}
