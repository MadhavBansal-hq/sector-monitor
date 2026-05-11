# Production Deployment Checklist

## Pre-Deployment

### Environment Preparation

- [ ] Verify all environment variables are set and correct
- [ ] Confirm database is running and accessible
- [ ] Test database connection with credentials
- [ ] Backup existing database if upgrading
- [ ] Verify all API keys are valid and have sufficient quota
- [ ] Set `NODE_ENV=production`
- [ ] Ensure HTTPS is enabled on the server

### Code Verification

- [ ] All tests pass: `pnpm test`
- [ ] TypeScript compilation succeeds: `pnpm check`
- [ ] No console errors or warnings in development
- [ ] All dependencies are up to date: `pnpm install`
- [ ] Build completes successfully: `pnpm build`
- [ ] Review git log for any uncommitted changes

### Database Preparation

- [ ] Run migrations: `pnpm drizzle-kit migrate`
- [ ] Seed initial data: `node server/seed-companies.mjs`
- [ ] Verify all 25 companies are in database
- [ ] Check database indexes are created
- [ ] Verify database user has correct permissions
- [ ] Create database backup

### Security Review

- [ ] API keys are not in version control
- [ ] Environment variables are securely stored
- [ ] Database credentials are strong and unique
- [ ] HTTPS certificates are valid
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is in place

### Performance Optimization

- [ ] Database indexes are created
- [ ] Frontend assets are minified
- [ ] Images are optimized
- [ ] Caching headers are configured
- [ ] CDN is configured (if applicable)
- [ ] Load testing has been performed

## Deployment

### Application Deployment

- [ ] Build production bundle: `pnpm build`
- [ ] Copy build artifacts to production server
- [ ] Verify all files are in correct locations
- [ ] Set production environment variables
- [ ] Start application: `pnpm start`
- [ ] Verify application starts without errors
- [ ] Check application logs for warnings

### Service Configuration

- [ ] Configure process manager (PM2, systemd, Docker)
- [ ] Set up automatic restart on failure
- [ ] Configure log rotation
- [ ] Set up monitoring and alerting
- [ ] Configure backup schedule
- [ ] Set up health check endpoint

### DNS & Networking

- [ ] DNS records are updated
- [ ] SSL/TLS certificates are installed
- [ ] Firewall rules are configured
- [ ] Load balancer is configured (if applicable)
- [ ] CDN is configured (if applicable)

## Post-Deployment

### Functionality Testing

- [ ] Homepage loads correctly
- [ ] User can login via OAuth
- [ ] Dashboard displays correctly
- [ ] All sectors load data
- [ ] Charts render properly
- [ ] Refresh button works
- [ ] Companies page shows all companies
- [ ] Documents page displays documents
- [ ] Navigation works between pages
- [ ] Logout works correctly

### Data Verification

- [ ] All 25 companies are visible
- [ ] Metrics data is displaying
- [ ] Synthesis text is generated
- [ ] Investing lens is visible
- [ ] Refresh status shows correct data
- [ ] Document counts are accurate

### Performance Verification

- [ ] Page load times are acceptable (< 3s)
- [ ] API response times are good (< 500ms)
- [ ] Database queries are efficient
- [ ] No memory leaks in application
- [ ] CPU usage is normal

### Security Verification

- [ ] HTTPS is working
- [ ] Security headers are set
- [ ] API keys are not exposed
- [ ] Database credentials are secure
- [ ] User sessions are secure
- [ ] CORS is properly configured

### Monitoring Setup

- [ ] Application monitoring is active
- [ ] Database monitoring is active
- [ ] Error tracking is configured
- [ ] Performance monitoring is active
- [ ] Alerts are configured
- [ ] Logs are being collected

## Rollback Plan

### If Deployment Fails

1. [ ] Stop the application
2. [ ] Restore previous database backup
3. [ ] Revert to previous application version
4. [ ] Verify application starts
5. [ ] Run tests on restored version
6. [ ] Notify stakeholders

### Rollback Procedure

```bash
# Stop current application
pm2 stop sector-monitor

# Restore database backup
mysql -u sector_monitor -p sector_monitor < backup_previous.sql

# Revert code to previous version
git checkout previous-version
pnpm install
pnpm build

# Start application
pnpm start
```

## Post-Rollback

- [ ] Verify application is running
- [ ] Test all functionality
- [ ] Check data integrity
- [ ] Review logs for errors
- [ ] Notify stakeholders
- [ ] Schedule remediation meeting

## Ongoing Maintenance

### Daily Tasks

- [ ] Check application logs for errors
- [ ] Monitor performance metrics
- [ ] Verify data refresh completed
- [ ] Check backup completion

### Weekly Tasks

- [ ] Review error logs
- [ ] Check database performance
- [ ] Verify all metrics are updating
- [ ] Review user feedback

### Monthly Tasks

- [ ] Update dependencies
- [ ] Review security logs
- [ ] Optimize database
- [ ] Analyze usage patterns
- [ ] Plan for scaling

## Disaster Recovery

### Backup Strategy

- [ ] Daily database backups
- [ ] Weekly full backups
- [ ] Monthly archive backups
- [ ] Test restore procedure monthly

### Recovery Time Objectives

- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 24 hours

### Disaster Recovery Procedure

1. [ ] Assess damage
2. [ ] Restore from latest backup
3. [ ] Verify data integrity
4. [ ] Bring application online
5. [ ] Notify stakeholders
6. [ ] Document incident

## Sign-Off

- [ ] Development Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______

## Notes

Use this section for any additional notes or issues encountered during deployment:

_________________________________________________________________________

_________________________________________________________________________

_________________________________________________________________________
