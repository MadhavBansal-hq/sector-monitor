# Sector Intelligence Monitor - User Guide

## Getting Started

### 1. Accessing the Platform

1. Navigate to the Sector Intelligence Monitor homepage
2. Click "Sign In" or "Get Started" to authenticate with Manus OAuth
3. After authentication, you'll be redirected to the dashboard

### 2. Dashboard Overview

The dashboard is your central hub for exploring financial data across three sectors:

- **Indian Fintech** - 9 companies including Bajaj Finance, Paytm, CAMS
- **Indian Defence** - 8 companies including HAL, BEL, Bharat Forge
- **US Biotech** - 8 companies including Moderna, Regeneron, Vertex

## Features

### Dashboard

The main dashboard provides:

1. **Sector Selector** - Switch between Fintech, Defence, and Biotech views
2. **Company List** - Browse all companies in the selected sector
3. **Metric Charts** - View 12-quarter trend data with interactive Recharts visualizations
4. **Synthesis Narrative** - AI-generated sector-level analysis covering:
   - Consistent metric trends across companies
   - Product bets and competitive dynamics
   - Structural vs cyclical market changes
5. **Investing Lens** - Strategic insights including:
   - Where incumbents are investing (validating startup markets)
   - Where incumbents are struggling (white space opportunities)
   - Acquisition and partnership trends
   - Benchmark metrics for early-stage evaluation
6. **Refresh Status** - Monitor data freshness with:
   - Last refresh timestamp
   - Documents checked
   - New documents found
   - Current status

### Companies Page

The Companies management page shows:

1. **Company Cards** - Each card displays:
   - Company name and ticker
   - Ingestion status (Completed, In Progress, Pending, Failed)
   - Document count
   - Error count
   - Ingestion progress bar
   - View Documents and Retry buttons

2. **Summary Statistics**:
   - Total companies tracked
   - Total documents ingested
   - Completed ingestions
   - Failed ingestions

### Documents Page

The Documents management page provides:

1. **Document Table** - Shows all ingested documents with:
   - Company name
   - Document title
   - Document type (Earnings Call, Investor Presentation, Financial Results)
   - Period (e.g., Q3FY24)
   - Parsing status (Success/Failed)
   - Number of chunks extracted
   - View and Retry actions

2. **Company Filter** - Filter documents by company or view all
3. **Summary Statistics**:
   - Total documents
   - Successfully parsed
   - Failed documents
   - Total chunks extracted

## Sector-Specific Metrics

### Fintech Metrics

Tracked metrics include:
- **AUM** - Assets Under Management with QoQ and YoY growth
- **NIM** - Net Interest Margin with trend direction
- **NPA** - Gross and Net Non-Performing Assets
- **Credit Cost** - Measured in basis points
- **Digital Volumes** - Transaction volumes and active user counts
- **Cost of Funds** - Funding cost percentage

### Defence Metrics

Tracked metrics include:
- **Order Book** - Value and YoY growth
- **Revenue Mix** - Domestic vs Export percentage breakdown
- **EBITDA Margin** - Profitability with trend
- **R&D Spend** - R&D as percentage of revenue
- **New Order Wins** - Recent wins with geography and product category

### Biotech Metrics

Tracked metrics include:
- **Pipeline** - Count by stage (Phase 1, 2, 3, NDA/BLA submitted)
- **Cash Runway** - Cash position and runway in quarters
- **Revenue** - Breakdown by product, royalty, collaboration
- **Clinical Readouts** - Recent trial outcomes and indications
- **AI/ML** - Investment and partnership callouts

## Data Refresh

### On-Demand Refresh

1. Go to the Dashboard
2. Click the "Refresh Data" button
3. Select sector or refresh all sectors
4. Monitor refresh progress in the Refresh Status panel

### Automatic Refresh

The platform automatically refreshes data on a weekly schedule. You'll receive notifications when:
- Refresh completes successfully
- New documents are ingested
- Critical failures occur

## Understanding the Data

### Synthesis Narrative

The synthesis narrative provides cross-company analysis addressing:
- Which metrics are improving or deteriorating consistently?
- What product bets are multiple companies making?
- What's structurally new vs cyclical?
- Key competitive dynamics

### Investing Lens

The investing lens answers key questions for early-stage investors:
- Where are incumbents validating new markets through investment?
- Where are white space opportunities emerging?
- What are they acquiring vs building?
- What benchmarks should inform company evaluation?

## Navigation

### Main Menu

- **Home** - Landing page with platform overview
- **Dashboard** - Main analytics dashboard
- **Companies** - Company management and ingestion status
- **Documents** - Document management and source links

### Quick Actions

- **Sector Selector** - Switch between sectors with tabs
- **Company List** - Click to select and view company-specific data
- **Refresh Button** - Trigger on-demand data refresh
- **External Links** - Click to view source documents

## Tips & Best Practices

### 1. Exploring Trends

- Use the metric charts to identify consistent trends across quarters
- Compare metrics across companies within a sector
- Look for inflection points where trends change

### 2. Understanding Synthesis

- Read the sector synthesis first for high-level context
- Then dive into specific companies and metrics
- Use the investing lens to identify opportunities

### 3. Document Management

- Check the Documents page for data freshness
- Review failed documents and retry if needed
- Use source links to verify data from original documents

### 4. Data Interpretation

- Consider context: macroeconomic factors, regulatory changes
- Look for leading indicators (pipeline, cash runway)
- Compare metrics across sectors for relative positioning

## Troubleshooting

### No Data Showing

1. Check if companies are loaded (Companies page)
2. Verify refresh status (Dashboard)
3. Trigger a manual refresh if data is stale

### Refresh Failures

1. Check the Refresh Status panel for error details
2. Review the Documents page for parsing failures
3. Click "Retry" on failed documents

### Slow Performance

1. Try selecting a specific sector instead of viewing all
2. Clear browser cache
3. Refresh the page

## Notifications

You'll receive notifications for:

1. **Refresh Completion** - When weekly refresh finishes
2. **New Documents** - When documents are successfully ingested
3. **Critical Failures** - When fetch or parsing fails for multiple companies

## Data Privacy & Security

- All data is encrypted in transit and at rest
- Authentication is handled via Manus OAuth
- Your account is secure and isolated
- No data is shared with third parties

## Support

For issues or questions:
1. Check this user guide
2. Review the Architecture documentation
3. Contact support through the Manus platform

## Glossary

- **AUM** - Assets Under Management
- **NIM** - Net Interest Margin
- **NPA** - Non-Performing Assets
- **EBITDA** - Earnings Before Interest, Taxes, Depreciation, and Amortization
- **Pipeline** - Drug candidates in clinical development
- **Cash Runway** - Months of operations sustainable with current cash
- **Order Book** - Contracted revenue for future delivery
- **Synthesis** - AI-generated cross-company analysis
- **Investing Lens** - Strategic insights for early-stage investors
