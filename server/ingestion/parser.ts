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
    const contentType = response.headers['content-type'] || '';
    
    if (url.endsWith('.pdf') || contentType.includes('application/pdf')) {
      // For PDFs, we'd need pdf-parse library
      content = `[PDF Document: ${title}]`;
    } else if (contentType.includes('text/html') || url.endsWith('.html')) {
      content = await parseHTML(url, response.data);
    } else if (contentType.includes('text/plain') || url.endsWith('.txt')) {
      content = response.data;
    } else {
      // Try HTML parsing as fallback
      content = await parseHTML(url, response.data);
    }
    
    if (!content) {
      console.warn(`[Parser] No content extracted from ${url}`);
      return null;
    }
    
    // Chunk the content
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
    console.error(`[Parser] Error fetching document from ${url}:`, error);
    return null;
  }
}

/**
 * Intelligent chunking for LLM processing
 * Splits content into manageable chunks while preserving context
 */
export function chunkContent(content: string, chunkSize: number = 4000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  
  // Split by paragraphs first
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
    
    if (potentialChunk.length <= chunkSize) {
      currentChunk = potentialChunk;
    } else {
      // Current chunk is full, save it
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      
      // Start new chunk with overlap from previous
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + paragraph;
      
      // If paragraph itself is larger than chunk size, split it
      if (currentChunk.length > chunkSize) {
        // Split by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        currentChunk = '';
        
        for (const sentence of sentences) {
          const potentialSentenceChunk = currentChunk + (currentChunk ? ' ' : '') + sentence.trim();
          
          if (potentialSentenceChunk.length <= chunkSize) {
            currentChunk = potentialSentenceChunk;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk);
            }
            currentChunk = sentence.trim();
          }
        }
      }
    }
  }
  
  // Add final chunk
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0);
}

/**
 * Validate and clean extracted content
 */
export function validateContent(content: string): boolean {
  // Check minimum length
  if (content.length < 100) {
    return false;
  }
  
  // Check for meaningful content (not just HTML tags or whitespace)
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  if (textContent.length < 100) {
    return false;
  }
  
  return true;
}
