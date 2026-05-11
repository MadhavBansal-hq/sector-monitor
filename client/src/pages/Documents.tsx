import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, AlertCircle, CheckCircle } from 'lucide-react';

type Sector = 'fintech' | 'defence' | 'biotech';

const SECTOR_LABELS: Record<Sector, string> = {
  fintech: 'Indian Fintech',
  defence: 'Indian Defence',
  biotech: 'US Biotech',
};

// Mock documents data
const MOCK_DOCUMENTS = [
  {
    id: 1,
    company: 'Bajaj Finance',
    title: 'Q3 FY2024 Earnings Call Transcript',
    type: 'earnings_call_transcript',
    period: 'Q3FY24',
    date: '2024-01-15',
    url: 'https://example.com/bajaj-q3-2024',
    status: 'success',
    chunks: 12,
  },
  {
    id: 2,
    company: 'Bajaj Finance',
    title: 'Investor Presentation - Q3 2024',
    type: 'investor_presentation',
    period: 'Q3FY24',
    date: '2024-01-15',
    url: 'https://example.com/bajaj-presentation-q3',
    status: 'success',
    chunks: 8,
  },
  {
    id: 3,
    company: 'SBI Cards',
    title: 'Q3 FY2024 Financial Results',
    type: 'financial_results',
    period: 'Q3FY24',
    date: '2024-01-20',
    url: 'https://example.com/sbi-cards-q3',
    status: 'success',
    chunks: 15,
  },
  {
    id: 4,
    company: 'Paytm',
    title: 'Q3 FY2024 Earnings Call',
    type: 'earnings_call_transcript',
    period: 'Q3FY24',
    date: '2024-01-22',
    url: 'https://example.com/paytm-q3',
    status: 'failed',
    error: 'Failed to parse PDF',
    chunks: 0,
  },
];

const TYPE_LABELS: Record<string, string> = {
  earnings_call_transcript: 'Earnings Call',
  investor_presentation: 'Investor Presentation',
  financial_results: 'Financial Results',
  quarterly_report: 'Quarterly Report',
};

export default function Documents() {
  const [selectedSector, setSelectedSector] = useState<Sector>('fintech');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Fetch companies for selected sector
  const { data: companies = [] } = trpc.companies.bySector.useQuery(selectedSector);

  // Filter documents based on selected company
  const filteredDocuments = selectedCompany
    ? MOCK_DOCUMENTS.filter((doc) => doc.company === selectedCompany)
    : MOCK_DOCUMENTS;

  const successCount = MOCK_DOCUMENTS.filter((d) => d.status === 'success').length;
  const failedCount = MOCK_DOCUMENTS.filter((d) => d.status === 'failed').length;
  const totalChunks = MOCK_DOCUMENTS.reduce((sum, d) => sum + d.chunks, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Document Management</h1>
        <p className="text-lg text-slate-600">View ingested documents, parsing status, and source links</p>
      </div>

      {/* Sector Selector */}
      <div className="mb-8 flex gap-2">
        {(Object.keys(SECTOR_LABELS) as Sector[]).map((sector) => (
          <Button
            key={sector}
            onClick={() => {
              setSelectedSector(sector);
              setSelectedCompany(null);
            }}
            variant={selectedSector === sector ? 'default' : 'outline'}
            className={selectedSector === sector ? 'bg-slate-900 text-white' : ''}
          >
            {SECTOR_LABELS[sector]}
          </Button>
        ))}
      </div>

      {/* Company Filter */}
      <div className="mb-8">
        <div className="text-sm font-medium text-slate-700 mb-3">Filter by Company</div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedCompany(null)}
            variant={selectedCompany === null ? 'default' : 'outline'}
            size="sm"
            className={selectedCompany === null ? 'bg-slate-900 text-white' : ''}
          >
            All Companies
          </Button>
          {companies?.map((company: any) => (
            <Button
              key={company.id}
              onClick={() => setSelectedCompany(company.name)}
              variant={selectedCompany === company.name ? 'default' : 'outline'}
              size="sm"
              className={selectedCompany === company.name ? 'bg-slate-900 text-white' : ''}
            >
              {company.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{MOCK_DOCUMENTS.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Successfully Parsed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{successCount}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Chunks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalChunks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="text-lg">Documents</CardTitle>
          <CardDescription>
            {selectedCompany ? `Showing documents for ${selectedCompany}` : 'Showing all documents'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Document</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Period</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Chunks</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{doc.company}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{doc.title}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="outline">{TYPE_LABELS[doc.type]}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{doc.period}</td>
                    <td className="px-6 py-4 text-sm">
                      {doc.status === 'success' ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Success</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Failed</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {doc.chunks > 0 ? (
                        <Badge variant="secondary">{doc.chunks} chunks</Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {doc.status === 'failed' && (
                          <Button size="sm" variant="ghost" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                            Retry
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
