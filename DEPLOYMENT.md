# Sector Intelligence Monitor - Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm
- MySQL 8.0+ or TiDB
- Manus account with LLM API access
- Optional: Brave Search API key for enhanced document discovery

## Environment Setup

### 1. Database Configuration

Create a MySQL database and user:

```sql
CREATE DATABASE sector_monitor;
CREATE USER 'sector_monitor'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON sector_monitor.* TO 'sector_monitor'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Environment Variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="mysql://sector_monitor:secure_password@localhost:3306/sector_monitor"

# Manus LLM API
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your_api_key_here"

# Optional: Brave Search API
BRAVE_SEARCH_API_KEY="your_brave_api_key_here"

# JWT Secret
JWT_SECRET="your_jwt_secret_here"

# OAuth Configuration
VITE_APP_ID="your_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"

# Owner Information
OWNER_OPEN_ID="your_open_id"
OWNER_NAME="Your Name"
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd /home/ubuntu/sector-monitor
pnpm install
```

### 2. Database Migrations

```bash
# Generate migration files from schema
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit migrate
```

### 3. Seed Initial Data

```bash
# Populate 25 companies across 3 sectors
node server/seed-companies.mjs
```

## Development

### Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/extraction/metrics.test.ts

# Watch mode
pnpm test --watch
```

### Code Quality

```bash
# Type checking
pnpm check

# Format code
pnpm format
```

## Production Deployment

### 1. Build Application

```bash
pnpm build
```

This creates:
- `dist/` - Production server bundle
- `client/dist/` - Optimized frontend assets

### 2. Start Production Server

```bash
pnpm start
```

The server will run on the configured port (default: 3000)

### 3. Environment Configuration

For production, ensure:
- `NODE_ENV=production`
- All required environment variables are set
- Database is properly backed up
- API keys are securely stored

## Scheduled Refresh

### Weekly Automated Refresh

The platform supports weekly automated refresh of documents and metrics. To enable:

1. **Using Manus Scheduler:**
   - Configure via the Manus dashboard
   - Set refresh trigger to weekly
   - Specify target sectors

2. **Using External Cron:**
   ```bash
   # Add to crontab for weekly Monday 2 AM refresh
   0 2 * * 1 curl -X POST http://localhost:3000/api/trpc/refresh.trigger \
     -H "Content-Type: application/json" \
     -d '{"input":null}'
   ```

### On-Demand Refresh

Trigger refresh manually via the dashboard or API:

```bash
curl -X POST http://localhost:3000/api/trpc/refresh.trigger \
  -H "Content-Type: application/json" \
  -d '{"input":"fintech"}'
```

## Monitoring & Maintenance

### Health Checks

Monitor the following endpoints:
- `/api/trpc/refresh.status` - Refresh status for all sectors
- `/api/trpc/companies.list` - Company data availability

### Log Files

The application logs are available at:
- `.manus-logs/devserver.log` - Server startup and runtime logs
- `.manus-logs/browserConsole.log` - Frontend console output
- `.manus-logs/networkRequests.log` - API request logs

### Database Maintenance

Recommended maintenance tasks:

```sql
-- Optimize tables
OPTIMIZE TABLE companies, documents, metrics, synthesis, refresh_log;

-- Check table integrity
CHECK TABLE companies, documents, metrics, synthesis, refresh_log;

-- Backup database
mysqldump -u sector_monitor -p sector_monitor > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
mysql -u sector_monitor -p -h localhost sector_monitor -e "SELECT 1;"
```

### LLM API Errors

Check API key and rate limits:
```bash
# Verify API key
curl -H "Authorization: Bearer $BUILT_IN_FORGE_API_KEY" \
  https://api.manus.im/health
```

### Document Fetch Failures

Review refresh logs:
```bash
# Check latest refresh status
curl http://localhost:3000/api/trpc/refresh.status
```

### Frontend Build Issues

Clear cache and rebuild:
```bash
rm -rf node_modules/.vite
pnpm build
```

## Performance Optimization

### Database Indexing

Key indexes are automatically created by Drizzle migrations. For additional performance:

```sql
-- Add indexes for common queries
CREATE INDEX idx_documents_company_period ON documents(companyId, period);
CREATE INDEX idx_metrics_company_period ON metrics(companyId, period);
CREATE INDEX idx_synthesis_sector_period ON synthesis(sector, period);
```

### Caching Strategy

- Synthesis results are cached in the database
- Metrics are cached per company/period
- Frontend uses React Query for client-side caching

### API Rate Limiting

The platform respects rate limits from:
- Manus LLM API: ~100 requests/minute
- Brave Search API: ~100 requests/day
- SEC EDGAR: ~10 requests/second

## Backup & Recovery

### Database Backup

```bash
# Full backup
mysqldump -u sector_monitor -p sector_monitor > backup_full.sql

# Incremental backup
mysqldump -u sector_monitor -p sector_monitor --single-transaction > backup_incremental.sql
```

### Restore from Backup

```bash
mysql -u sector_monitor -p sector_monitor < backup_full.sql
```

### Application Recovery

If the application fails to start:

1. Check database connectivity
2. Verify all environment variables are set
3. Review server logs in `.manus-logs/`
4. Restart the application

## Security Considerations

1. **API Keys:** Never commit `.env` files to version control
2. **Database:** Use strong passwords and restrict access
3. **HTTPS:** Always use HTTPS in production
4. **Authentication:** Leverage Manus OAuth for user authentication
5. **Data Privacy:** Ensure compliance with data protection regulations

## Support & Resources

- **Documentation:** See `ARCHITECTURE.md` for system design
- **API Reference:** tRPC procedures documented in `server/routers.ts`
- **Database Schema:** See `drizzle/schema.ts`
- **Issues:** Check `.manus-logs/` for detailed error messages

## Version Management

Current version: 1.0.0

### Update Procedure

1. Pull latest changes
2. Run `pnpm install` to update dependencies
3. Run `pnpm drizzle-kit generate` if schema changed
4. Run `pnpm build` to rebuild
5. Restart the application

## Rollback Procedure

If an update causes issues:

1. Revert to previous commit: `git revert HEAD`
2. Restore database backup: `mysql ... < backup.sql`
3. Rebuild and restart: `pnpm build && pnpm start`
