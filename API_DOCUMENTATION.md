# Sector Intelligence Monitor - API Documentation

## Overview

The Sector Intelligence Monitor exposes all functionality through tRPC procedures. tRPC provides end-to-end type safety with automatic TypeScript inference on both client and server.

All endpoints are accessible at `/api/trpc/[procedure]` and require authentication via Manus OAuth session cookies.

## Authentication

All API calls require a valid Manus OAuth session. The session is automatically established after user login and maintained via secure HTTP-only cookies.

### Session Management

- **Login**: Redirect to `getLoginUrl()` from `@/const`
- **Logout**: Call `trpc.auth.logout.useMutation()`
- **Current User**: Query `trpc.auth.me.useQuery()`

## API Procedures

### Authentication

#### `auth.me`

Get current authenticated user information.

**Type**: Query

**Returns**:
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

**Example**:
```typescript
const { data: user } = trpc.auth.me.useQuery();
```

#### `auth.logout`

Logout the current user and clear session.

**Type**: Mutation

**Returns**:
```typescript
{ success: boolean }
```

**Example**:
```typescript
const logout = trpc.auth.logout.useMutation();
await logout.mutateAsync();
```

### Companies

#### `companies.list`

Get all companies across all sectors.

**Type**: Query

**Returns**:
```typescript
Array<{
  id: number;
  name: string;
  sector: 'fintech' | 'defence' | 'biotech';
  ticker: string;
  exchange: string;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example**:
```typescript
const { data: companies } = trpc.companies.list.useQuery();
```

#### `companies.bySector`

Get companies for a specific sector.

**Type**: Query

**Input**: `'fintech' | 'defence' | 'biotech'`

**Returns**: Same as `companies.list`

**Example**:
```typescript
const { data: fintechCompanies } = trpc.companies.bySector.useQuery('fintech');
```

### Metrics

#### `metrics.bySector`

Get all metrics for companies in a sector.

**Type**: Query

**Input**: `'fintech' | 'defence' | 'biotech'`

**Returns**:
```typescript
Array<{
  id: number;
  companyId: number;
  period: string; // e.g., "Q3FY24"
  metricName: string;
  metricValue: number;
  unit: string;
  direction?: 'up' | 'down' | 'neutral';
  sourceDocumentId?: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example**:
```typescript
const { data: metrics } = trpc.metrics.bySector.useQuery('fintech');
```

### Synthesis

#### `synthesis.bySector`

Get the latest synthesis (narrative and investing lens) for a sector.

**Type**: Query

**Input**: `'fintech' | 'defence' | 'biotech'`

**Returns**:
```typescript
{
  id: number;
  sector: string;
  period: string;
  synthesisText: string;
  investingLensText: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example**:
```typescript
const { data: synthesis } = trpc.synthesis.bySector.useQuery('fintech');
```

### Refresh

#### `refresh.trigger`

Trigger a refresh operation for one or all sectors.

**Type**: Mutation

**Input**: `'fintech' | 'defence' | 'biotech' | undefined` (undefined = all sectors)

**Returns**:
```typescript
// Single sector
{
  sector: string;
  documentsChecked: number;
  newDocumentsFound: number;
  errors: string[];
  status: 'completed' | 'failed';
}

// All sectors (array)
Array<{
  sector: string;
  documentsChecked: number;
  newDocumentsFound: number;
  errors: string[];
  status: 'completed' | 'failed';
}>
```

**Example**:
```typescript
// Refresh single sector
const refresh = trpc.refresh.trigger.useMutation();
const result = await refresh.mutateAsync('fintech');

// Refresh all sectors
const resultAll = await refresh.mutateAsync(undefined);
```

#### `refresh.status`

Get the status of the latest refresh operation.

**Type**: Query

**Input**: `'fintech' | 'defence' | 'biotech' | undefined` (undefined = all sectors)

**Returns**:
```typescript
{
  lastRefresh: Date | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  documentsChecked: number | null;
  newDocumentsFound: number | null;
  errors: string[];
}
```

**Example**:
```typescript
const { data: status } = trpc.refresh.status.useQuery('fintech');
```

### System

#### `system.notifyOwner`

Send a notification to the platform owner.

**Type**: Mutation (Protected - Admin only)

**Input**:
```typescript
{
  title: string;
  content: string;
}
```

**Returns**:
```typescript
{ success: boolean }
```

**Example**:
```typescript
const notify = trpc.system.notifyOwner.useMutation();
await notify.mutateAsync({
  title: 'Refresh Complete',
  content: 'Fintech sector refresh completed successfully',
});
```

## Error Handling

All tRPC procedures return typed errors. Handle errors in React components:

```typescript
const { data, error, isLoading } = trpc.companies.list.useQuery();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{data?.length} companies</div>;
```

For mutations:

```typescript
const refresh = trpc.refresh.trigger.useMutation();

try {
  const result = await refresh.mutateAsync('fintech');
  console.log('Refresh completed:', result);
} catch (error) {
  console.error('Refresh failed:', error);
}
```

## Rate Limiting

The API respects the following rate limits:

- **LLM API**: ~100 requests/minute
- **Brave Search**: ~100 requests/day
- **SEC EDGAR**: ~10 requests/second

If rate limits are exceeded, the API returns an error with a `retry-after` header.

## Data Types

### Sector

```typescript
type Sector = 'fintech' | 'defence' | 'biotech';
```

### Company

```typescript
interface Company {
  id: number;
  name: string;
  sector: Sector;
  ticker: string;
  exchange: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Metric

```typescript
interface Metric {
  id: number;
  companyId: number;
  period: string;
  metricName: string;
  metricValue: number;
  unit: string;
  direction?: 'up' | 'down' | 'neutral';
  sourceDocumentId?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Synthesis

```typescript
interface Synthesis {
  id: number;
  sector: string;
  period: string;
  synthesisText: string;
  investingLensText: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### RefreshResult

```typescript
interface RefreshResult {
  sector: string;
  documentsChecked: number;
  newDocumentsFound: number;
  errors: string[];
  status: 'completed' | 'failed';
}
```

## Usage Examples

### React Component Example

```typescript
import { trpc } from '@/lib/trpc';

export function Dashboard() {
  const [sector, setSector] = useState('fintech');
  
  // Fetch companies
  const { data: companies } = trpc.companies.bySector.useQuery(sector);
  
  // Fetch metrics
  const { data: metrics } = trpc.metrics.bySector.useQuery(sector);
  
  // Fetch synthesis
  const { data: synthesis } = trpc.synthesis.bySector.useQuery(sector);
  
  // Trigger refresh
  const refresh = trpc.refresh.trigger.useMutation();
  
  const handleRefresh = async () => {
    try {
      const result = await refresh.mutateAsync(sector);
      console.log('Refresh completed:', result);
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };
  
  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleRefresh}>Refresh</button>
      {/* Render data */}
    </div>
  );
}
```

### Optimistic Updates

```typescript
const refresh = trpc.refresh.trigger.useMutation({
  onMutate: async (sector) => {
    // Cancel outgoing queries
    await trpc.useUtils().refresh.status.cancel();
    
    // Optimistically update status
    trpc.useUtils().refresh.status.setData(
      { input: sector },
      { status: 'in_progress' }
    );
  },
  onError: (error, sector) => {
    // Revert on error
    trpc.useUtils().refresh.status.invalidate();
  },
  onSuccess: (data, sector) => {
    // Invalidate and refetch
    trpc.useUtils().refresh.status.invalidate();
  },
});
```

## Webhooks & Notifications

The platform sends notifications for:

1. **Refresh Completion** - When refresh finishes
2. **New Documents** - When documents are ingested
3. **Critical Failures** - When errors occur

Notifications are sent via the Manus notification system and appear in the owner's dashboard.

## Pagination

Currently, all queries return complete datasets. For large result sets, implement pagination by:

1. Adding `limit` and `offset` parameters to procedures
2. Returning `{ items: [], total: number }`
3. Implementing cursor-based pagination in the UI

## Caching

The frontend uses React Query for automatic caching:

- Queries are cached by default
- Stale data is refetched on window focus
- Manual invalidation available via `trpc.useUtils()`

## Versioning

The API follows semantic versioning. Breaking changes will increment the major version.

Current version: 1.0.0

## Support

For API issues or questions:
1. Check this documentation
2. Review error messages and logs
3. Contact support through Manus
