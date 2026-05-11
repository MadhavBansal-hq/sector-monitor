import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';

type Sector = 'fintech' | 'defence' | 'biotech';

const SECTOR_LABELS: Record<Sector, string> = {
  fintech: 'Indian Fintech',
  defence: 'Indian Defence',
  biotech: 'US Biotech',
};

export default function Companies() {
  const [selectedSector, setSelectedSector] = useState<Sector>('fintech');

  // Fetch companies for selected sector
  const { data: companies = [], isLoading: companiesLoading } = trpc.companies.bySector.useQuery(selectedSector);

  // Mock data for document counts and status
  const getCompanyStatus = (companyId: number) => {
    const statuses = ['completed', 'in_progress', 'pending', 'failed'];
    return statuses[companyId % statuses.length];
  };

  const getDocumentCount = (companyId: number) => {
    return 5 + (companyId % 15);
  };

  const getErrorCount = (companyId: number) => {
    return companyId % 3 === 0 ? 1 : 0;
  };

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    completed: {
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Completed',
    },
    in_progress: {
      color: 'bg-blue-100 text-blue-800',
      icon: <Clock className="w-4 h-4" />,
      label: 'In Progress',
    },
    pending: {
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock className="w-4 h-4" />,
      label: 'Pending',
    },
    failed: {
      color: 'bg-red-100 text-red-800',
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Failed',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Company Management</h1>
        <p className="text-lg text-slate-600">Monitor document ingestion status and metrics extraction progress</p>
      </div>

      {/* Sector Selector */}
      <div className="mb-8 flex gap-2">
        {(Object.keys(SECTOR_LABELS) as Sector[]).map((sector) => (
          <Button
            key={sector}
            onClick={() => setSelectedSector(sector)}
            variant={selectedSector === sector ? 'default' : 'outline'}
            className={selectedSector === sector ? 'bg-slate-900 text-white' : ''}
          >
            {SECTOR_LABELS[sector]}
          </Button>
        ))}
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companiesLoading ? (
          <div className="col-span-full text-center py-12 text-slate-500">Loading companies...</div>
        ) : companies && companies.length > 0 ? (
          companies.map((company: any) => {
            const status = getCompanyStatus(company.id);
            const docCount = getDocumentCount(company.id);
            const errorCount = getErrorCount(company.id);
            const config = statusConfig[status];

            return (
              <Card key={company.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription className="text-sm">{company.ticker}</CardDescription>
                    </div>
                    <Badge className={config.color}>
                      <span className="flex items-center gap-1">
                        {config.icon}
                        {config.label}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="text-xs text-slate-600 mb-1">Documents</div>
                      <div className="text-2xl font-bold text-blue-600">{docCount}</div>
                    </div>
                    <div className={`rounded-lg p-3 border ${errorCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                      <div className="text-xs text-slate-600 mb-1">Errors</div>
                      <div className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {errorCount}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="text-xs text-slate-600 mb-2">Ingestion Progress</div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${status === 'completed' ? 100 : status === 'in_progress' ? 65 : status === 'pending' ? 20 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-1" />
                      View Docs
                    </Button>
                    {errorCount > 0 && (
                      <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-slate-500">No companies found</div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{companies?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {companies?.reduce((sum: number, c: any) => sum + getDocumentCount(c.id), 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {companies?.filter((c: any) => getCompanyStatus(c.id) === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {companies?.filter((c: any) => getCompanyStatus(c.id) === 'failed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
