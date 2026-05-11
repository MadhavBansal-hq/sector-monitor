# Sector Intelligence Monitor - Architecture Guide

## Overview

The Sector Intelligence Monitor is a full-stack financial research platform that ingests, extracts, synthesizes, and visualizes multi-quarter company data across three sectors: Indian Fintech, Indian Defence, and US Biotech. The system uses AI-powered metrics extraction with Pydantic-style validation and generates sector-level narratives and investing lens insights.

## System Architecture

### Backend Stack

**Framework & Runtime**
- Node.js with TypeScript
- Express.js for HTTP server
- tRPC for type-safe API procedures
- Drizzle ORM for database abstraction

**Database**
- MySQL/TiDB for persistent storage
- Five core tables: `companies`, `documents`, `metrics`, `synthesis`, `refresh_log`

**External Services**
- Manus LLM API for metrics extraction and synthesis generation
- SEC EDGAR API for US company filings
- Brave Search API for document discovery
- Company IR pages for investor presentations

### Frontend Stack

**Framework & UI**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui for component library
- Recharts for data visualization

**State Management & Data Fetching**
- tRPC React Query integration for server state
- React hooks for local state

## Data Flow

### 1. Document Ingestion Pipeline

```
Company Configuration
    ↓
Fetch from Multiple Sources (SEC EDGAR, BSE/NSE, Brave Search, etc.)
    ↓
Parse HTML/PDF Content
    ↓
Intelligent Chunking (4000 char chunks with 200 char overlap)
    ↓
Store in Documents Table
```

**Key Files:**
- `server/ingestion/sources.ts` - Multi-source document fetching
- `server/ingestion/parser.ts` - HTML/PDF parsing and chunking

### 2. Metrics Extraction Layer

```
Document Chunks
    ↓
LLM Extraction (Sector-specific prompts)
    ↓
Pydantic Validation (Zod schemas)
    ↓
Store in Metrics Table
```

**Sector-Specific Metrics:**

**Fintech:** AUM, NIM, NPA %, credit cost, digital volumes, user counts, cost of funds

**Defence:** Order book, revenue mix (domestic/export %), EBITDA margin, R&D spend, new order wins

**Biotech:** Pipeline counts (by stage), cash runway, revenue breakdown, clinical trial readouts, AI/ML investments

**Key Files:**
- `server/extraction/metrics.ts` - LLM-powered extraction with validation
- `server/extraction/metrics.test.ts` - Comprehensive schema tests

### 3. Synthesis Engine

```
Extracted Metrics (4 most recent quarters)
    ↓
Cross-Company Analysis (LLM)
    ↓
Sector Narrative Generation
    ↓
Investing Lens Generation
    ↓
Store in Synthesis Table
```

**Key Files:**
- `server/synthesis/engine.ts` - Synthesis generation and storage

### 4. Refresh Scheduler

```
Scheduled Trigger (Weekly or On-Demand)
    ↓
For Each Sector:
  - Fetch new documents
  - Parse and extract metrics
  - Generate synthesis
    ↓
Log Results in Refresh Log
    ↓
Notify Owner (if configured)
```

**Key Files:**
- `server/scheduler/refresher.ts` - Refresh orchestration
- `server/routers.ts` - tRPC endpoints for refresh

## Database Schema

### Companies Table
```sql
- id (PK)
- name (varchar)
- sector (enum: fintech, defence, biotech)
- ticker (varchar)
- exchange (varchar: NSE, BSE, NASDAQ, NYSE)
- createdAt, updatedAt
```

### Documents Table
```sql
- id (PK)
- companyId (FK)
- sourceUrl (text)
- documentType (enum: earnings_call_transcript, investor_presentation, etc.)
- period (varchar: Q3FY24)
- dateFetched (timestamp)
- parseStatus (enum: pending, success, failed, partial)
- parseError (text)
- rawContent (text)
- createdAt, updatedAt
```

### Metrics Table
```sql
- id (PK)
- companyId (FK)
- period (varchar: Q3FY24)
- metricName (varchar)
- metricValue (decimal)
- unit (varchar: INR Cr, %, units)
- direction (enum: up, down, neutral)
- sourceDocumentId (FK)
- createdAt, updatedAt
```

### Synthesis Table
```sql
- id (PK)
- sector (enum: fintech, defence, biotech)
- period (varchar)
- synthesisText (text) - Sector narrative
- investingLensText (text) - Investing insights
- generatedAt (timestamp)
- createdAt, updatedAt
```

### Refresh Log Table
```sql
- id (PK)
- sector (enum)
- runTimestamp (timestamp)
- documentsChecked (int)
- newDocumentsFound (int)
- errors (text: JSON array)
- status (enum: pending, in_progress, completed, failed)
- createdAt, updatedAt
```

## API Endpoints

### tRPC Procedures

**Companies**
- `companies.list` - Get all companies
- `companies.bySector` - Get companies by sector

**Metrics**
- `metrics.bySector` - Get all metrics for a sector

**Synthesis**
- `synthesis.bySector` - Get latest synthesis for a sector

**Refresh**
- `refresh.trigger` - Trigger refresh (sector or all)
- `refresh.status` - Get refresh status

## Frontend Pages

### Home Page (`/`)
- Landing page with feature highlights
- Sector overview
- Call-to-action to dashboard

### Dashboard Page (`/dashboard`)
- Sector selector (tabs)
- Company list with selection
- 12-quarter metric trend charts
- Sector synthesis narrative
- Investing lens insights
- Refresh status monitoring
- On-demand refresh button

## Configuration

### Environment Variables

**Required:**
- `DATABASE_URL` - MySQL connection string
- `BUILT_IN_FORGE_API_KEY` - Manus LLM API key
- `BUILT_IN_FORGE_API_URL` - Manus LLM API URL

**Optional:**
- `BRAVE_SEARCH_API_KEY` - For document discovery
- `SEC_EDGAR_API_KEY` - For SEC filings (if needed)

## Company Data

### Fintech (9 companies)
1. Bajaj Finance (BAJAJFINSV)
2. SBI Cards (SBICARD)
3. Paytm (PAYTM)
4. PB Fintech (PBFINTECH)
5. CAMS (CAMS)
6. CDSL (CDSL)
7. Zaggle (ZAGGLE)
8. CreditAccess Grameen (CREDITACC)
9. Five Star Business Finance (FIVESTAR)

### Defence (8 companies)
1. HAL (HAL)
2. BEL (BEL)
3. MTAR Technologies (MTAR)
4. Paras Defence (PARASDEF)
5. Astra Microwave (ASTRATECH)
6. Data Patterns (DATAPATTERN)
7. Zen Technologies (ZENTECH)
8. Bharat Forge (BHARATFORG)

### Biotech (8 companies)
1. Moderna (MRNA)
2. Regeneron (REGN)
3. Vertex Pharmaceuticals (VRTX)
4. Biogen (BIIB)
5. Illumina (ILMN)
6. 10x Genomics (TXG)
7. Pacific Biosciences (PACB)
8. Recursion Pharmaceuticals (RXRX)

## Development Workflow

### Setup
```bash
# Install dependencies
pnpm install

# Run migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Seed companies
node server/seed-companies.mjs

# Start dev server
pnpm dev
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/extraction/metrics.test.ts
```

### Building
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Performance Considerations

1. **Document Chunking** - 4000 character chunks with 200 character overlap preserve context while staying within LLM token limits

2. **Metrics Caching** - Extracted metrics are stored in database; synthesis is pre-computed and cached

3. **Batch Processing** - Refresh processes all companies in a sector sequentially to avoid rate limiting

4. **Error Resilience** - Failed document fetches are logged but don't block the entire refresh

## Security

1. **API Authentication** - All tRPC endpoints use Manus OAuth
2. **Database Credentials** - Stored in environment variables
3. **LLM API Keys** - Kept server-side, never exposed to frontend
4. **Input Validation** - Pydantic schemas validate all LLM outputs

## Future Enhancements

1. **Real-time Updates** - WebSocket support for live refresh status
2. **Advanced Filtering** - Filter metrics by company, period, metric type
3. **Export Functionality** - Export synthesis and metrics to PDF/Excel
4. **Custom Alerts** - Notify on significant metric changes
5. **Comparative Analysis** - Compare metrics across companies and sectors
6. **Historical Trends** - Multi-year trend analysis and forecasting
