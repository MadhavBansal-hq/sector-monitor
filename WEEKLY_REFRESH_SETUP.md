# Weekly Refresh Setup

## Overview

The Sector Intelligence Monitor platform includes an automated weekly refresh system that updates dashboard data every Monday at 9 AM UTC. This document describes the setup and configuration.

## Scheduled Refresh Configuration

### Cron Job Details

- **Name**: `weekly-refresh`
- **Schedule**: Every Monday at 9:00 AM UTC (6-field cron: `0 0 9 * * 1`)
- **Endpoint**: `/api/scheduled/refresh`
- **Task UID**: `2YbR2HcPsoFQ8g4xedNuHu`
- **Status**: Active and enabled

### What Happens During Refresh

When the weekly refresh is triggered, the following operations occur:

1. **Document Fetching** - Fetches new documents from all configured sources:
   - SEC EDGAR (US biotech companies)
   - BSE/NSE filings portal (Indian companies)
   - Screener.in (Indian financial data)
   - Macrotrends.net (historical financials)
   - Brave Search API (document discovery)

2. **Document Processing** - Parses and chunks all new documents:
   - PDF parsing for earnings reports and presentations
   - HTML parsing for web-based documents
   - Intelligent chunking with context preservation
   - Deduplication to prevent re-processing

3. **Metrics Extraction** - Extracts sector-specific KPIs:
   - **Fintech**: AUM, NIM, NPA metrics, digital volumes, user counts
   - **Defence**: Order book, EBITDA margins, R&D spend, new order wins
   - **Biotech**: Pipeline counts, cash runway, clinical trial readouts

4. **Synthesis Generation** - Creates sector-level narratives:
   - Analyzes all companies in each sector
   - Generates investing lens insights
   - Identifies white spaces and opportunities
   - Pre-computes and stores synthesis in database

5. **Owner Notification** - Sends completion summary:
   - Total documents checked
   - New documents found
   - Any errors encountered
   - Synthesis generation status

## Implementation Details

### Scheduled Refresh Endpoint

**Path**: `/api/scheduled/refresh`
**Method**: `POST`
**Authentication**: Cron-only (verified via `user.isCron` flag)

### Handler Location

- **File**: `server/scheduled/refreshHandler.ts`
- **Function**: `handleScheduledRefresh(req, res)`
- **Registered in**: `server/_core/index.ts` (line 68-82)

### Error Handling

The refresh handler includes comprehensive error handling:

- Try-catch wrapping all operations
- Graceful degradation if individual document fetches fail
- Error logging with context for debugging
- Proper HTTP response codes for Manus platform retry logic
- Detailed error information for investigation

### Idempotency

The refresh operation is idempotent:

- Documents are deduplicated before processing
- Metrics extraction handles partial data gracefully
- Synthesis generation overwrites previous results
- Failed operations don't block subsequent steps

## Managing the Cron Job

### View Current Status

```bash
manus-heartbeat list
```

This shows all scheduled jobs including:
- Cron expression
- Next execution time
- Enable/disable status
- Task UID for reference

### Pause Refresh

```bash
manus-heartbeat update --task-uid 2YbR2HcPsoFQ8g4xedNuHu --enable=false
```

### Resume Refresh

```bash
manus-heartbeat update --task-uid 2YbR2HcPsoFQ8g4xedNuHu --enable=true
```

### Change Schedule

To change the refresh schedule (e.g., to run daily instead of weekly):

```bash
manus-heartbeat update --task-uid 2YbR2HcPsoFQ8g4xedNuHu --cron "0 0 9 * * *"
```

This would run at 9 AM UTC every day.

### View Execution History

```bash
manus-heartbeat logs --task-uid 2YbR2HcPsoFQ8g4xedNuHu
```

View last 20 executions with status and timestamps.

### View Detailed Execution

```bash
manus-heartbeat logs --task-uid 2YbR2HcPsoFQ8g4xedNuHu --with-body
```

Shows full response bodies for each execution.

### Delete Cron Job

```bash
manus-heartbeat delete --task-uid 2YbR2HcPsoFQ8g4xedNuHu
```

⚠️ This will permanently remove the scheduled refresh.

## Monitoring & Notifications

### Owner Notifications

The refresh handler automatically sends notifications to the project owner:

- **Refresh Completion**: Summary of documents checked and new documents found
- **Synthesis Generated**: Notification when new sector narratives are created
- **Critical Failures**: Alert if refresh encounters critical errors

### Checking Refresh Status

In the dashboard, you can see:

- Last refresh timestamp (visible on dashboard)
- Refresh status (completed/failed)
- Number of documents processed
- Any errors encountered

### Manual Refresh

Users can also trigger an immediate refresh via the dashboard:

- Click "Refresh Now" button on the dashboard
- Or call the tRPC endpoint: `trpc.refresh.trigger.useMutation()`

## Cron Expression Format

The cron expression uses 6 fields with UTC timezone:

```
sec min hour dom mon dow
0   0   9    *   *   1
```

- **sec**: Seconds (0-59) - Always use 0
- **min**: Minutes (0-59)
- **hour**: Hours (0-23) in UTC
- **dom**: Day of month (1-31)
- **mon**: Month (1-12)
- **dow**: Day of week (0-6, where 0=Sunday, 1=Monday)

### Common Schedules

| Schedule | Cron Expression | Description |
|----------|-----------------|-------------|
| Daily at 9 AM UTC | `0 0 9 * * *` | Every day at 9:00 AM |
| Weekly Monday 9 AM | `0 0 9 * * 1` | Every Monday at 9:00 AM |
| Twice daily | `0 0 9,21 * * *` | 9 AM and 9 PM UTC |
| Every 6 hours | `0 0 */6 * * *` | 12 AM, 6 AM, 12 PM, 6 PM UTC |
| Every 4 hours | `0 0 */4 * * *` | 12 AM, 4 AM, 8 AM, 12 PM, 4 PM, 8 PM UTC |

## Deployment Considerations

### Before First Deployment

1. Ensure the `/api/scheduled/refresh` endpoint is registered in production
2. Verify the refresh handler is included in the build
3. Test the endpoint manually before relying on automation

### After Deployment

1. The cron job will automatically start triggering on the configured schedule
2. Monitor the first few executions via `manus-heartbeat logs`
3. Check owner notifications for any issues
4. Verify dashboard data updates after each refresh

### Troubleshooting

If the refresh doesn't trigger:

1. Check cron job is enabled: `manus-heartbeat list`
2. Review execution logs: `manus-heartbeat logs --task-uid <task_uid> --with-body`
3. Verify endpoint is accessible: `curl -X POST https://<your-domain>/api/scheduled/refresh`
4. Check server logs for errors

## Future Enhancements

Potential improvements to the refresh system:

1. **Incremental Refresh** - Only fetch documents from the last refresh onwards
2. **Parallel Processing** - Process multiple sectors simultaneously
3. **Retry Logic** - Automatically retry failed document fetches
4. **Custom Schedules** - Allow users to configure their own refresh times
5. **Refresh Webhooks** - Trigger external systems when refresh completes
6. **Data Validation** - Validate extracted metrics against historical ranges
7. **Compression** - Archive old refresh logs to reduce storage

## Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoint reference
- [periodic-updates.md](./references/periodic-updates.md) - Manus scheduler reference
