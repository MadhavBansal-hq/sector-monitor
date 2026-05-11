import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

type Sector = 'fintech' | 'defence' | 'biotech';

const SECTOR_LABELS: Record<Sector, string> = {
  fintech: 'Indian Fintech',
  defence: 'Indian Defence',
  biotech: 'US Biotech',
};

const SECTOR_COLORS: Record<Sector, string> = {
  fintech: '#3b82f6',
  defence: '#ef4444',
  biotech: '#10b981',
};

export default function Dashboard() {
  const [selectedSector, setSelectedSector] = useState<Sector>('fintech');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Fetch companies for selected sector
  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.bySector.useQuery(selectedSector);

  // Fetch metrics for selected sector
  const { data: metrics = [], isLoading: metricsLoading } = trpc.metrics.bySector.useQuery(selectedSector);

  // Fetch synthesis for selected sector
  const { data: synthesis } = trpc.synthesis.bySector.useQuery(selectedSector);

  // Fetch refresh status
  const { data: refreshStatus } = trpc.refresh.status.useQuery(selectedSector);

  // Trigger refresh mutation
  const refreshMutation = trpc.refresh.trigger.useMutation();

  const handleRefresh = async () => {
    await refreshMutation.mutateAsync(selectedSector);
  };

  // Prepare chart data
  const chartData = [
    { quarter: 'Q1FY24', value1: 65, value2: 59, value3: 80 },
    { quarter: 'Q2FY24', value1: 75, value2: 68, value3: 85 },
    { quarter: 'Q3FY24', value1: 82, value2: 75, value3: 90 },
    { quarter: 'Q4FY24', value1: 88, value2: 82, value3: 95 },
  ];

  const selectedCompanyData = selectedCompany
    ? companies?.find((c: any) => c.name === selectedCompany)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Sector Intelligence Monitor</h1>
        <p className="text-lg text-slate-600">Multi-quarter financial analysis and investing lens across sectors</p>
      </div>

      {/* Sector Selector */}
      <div className="mb-8 flex gap-4 items-center">
        <div className="flex gap-2">
          {(Object.keys(SECTOR_LABELS) as Sector[]).map((sector) => (
            <Button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              variant={selectedSector === sector ? 'default' : 'outline'}
              className={selectedSector === sector ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'}
            >
              {SECTOR_LABELS[sector]}
            </Button>
          ))}
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all"
        >
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Companies List */}
        <Card className="lg:col-span-1 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-lg">Companies</CardTitle>
            <CardDescription>{companies?.length || 0} companies tracked</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-96 overflow-y-auto">
              {companiesLoading ? (
                <div className="p-4 text-center text-slate-500">Loading companies...</div>
              ) : companies && companies.length > 0 ? (
                companies.map((company: any) => (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompany(company.name)}
                    className={selectedCompany === company.name ? 'w-full text-left p-4 bg-blue-50 border-l-4 border-blue-600' : 'w-full text-left p-4 hover:bg-slate-50'}
                  >
                    <div className="font-semibold text-slate-900">{company.name}</div>
                    <div className="text-sm text-slate-500">{company.ticker}</div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-500">No companies found</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metrics Overview */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-lg">Key Metrics Trend</CardTitle>
            <CardDescription>12-quarter performance overview</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="quarter" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="value1" stroke="#3b82f6" strokeWidth={2} name="Metric 1" />
                <Line type="monotone" dataKey="value2" stroke="#ef4444" strokeWidth={2} name="Metric 2" />
                <Line type="monotone" dataKey="value3" stroke="#10b981" strokeWidth={2} name="Metric 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Synthesis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sector Synthesis */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-lg">Sector Synthesis</CardTitle>
            <CardDescription>Cross-company analysis and trends</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              {synthesis?.synthesisText ? (
                <p className="text-slate-700 leading-relaxed">{synthesis.synthesisText}</p>
              ) : (
                <p className="text-slate-500 italic">Synthesis data will appear here after refresh</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Investing Lens */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-lg">Investing Lens</CardTitle>
            <CardDescription>Market opportunities and white spaces</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              {synthesis?.investingLensText ? (
                <p className="text-slate-700 leading-relaxed">{synthesis.investingLensText}</p>
              ) : (
                <p className="text-slate-500 italic">Investing lens will appear here after refresh</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Status */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="text-lg">Refresh Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="text-sm text-slate-600 mb-1">Last Refresh</div>
              <div className="text-lg font-semibold text-slate-900">
                {refreshStatus?.lastRefresh
                  ? new Date(refreshStatus.lastRefresh).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="text-sm text-slate-600 mb-1">Documents Checked</div>
              <div className="text-lg font-semibold text-slate-900">{refreshStatus?.documentsChecked || 0}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="text-sm text-slate-600 mb-1">New Documents</div>
              <div className="text-lg font-semibold text-slate-900">{refreshStatus?.newDocumentsFound || 0}</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="text-sm text-slate-600 mb-1">Status</div>
              <div className="text-lg font-semibold text-slate-900 capitalize">{refreshStatus?.status || 'Pending'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
