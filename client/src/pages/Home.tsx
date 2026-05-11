import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">SectorMonitor</div>
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-300">Welcome, {user?.name}</span>
                <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                  Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()} className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Financial Intelligence for
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Early-Stage Investing</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Monitor 25 companies across three sectors with AI-powered metrics extraction, sector synthesis, and investing lens insights.
            </p>
            {isAuthenticated ? (
              <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Open Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur-3xl opacity-20"></div>
            <div className="relative bg-slate-800 rounded-lg p-8 border border-slate-700">
              <div className="space-y-4">
                <div className="h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded w-3/4"></div>
                <div className="h-2 bg-slate-700 rounded w-full"></div>
                <div className="h-2 bg-slate-700 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-colors">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
              <CardTitle>Multi-Quarter Analysis</CardTitle>
              <CardDescription>Track 12 quarters of financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Comprehensive historical data from Q1 2022 to present across 25 companies.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-cyan-500 transition-colors">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-cyan-400 mb-4" />
              <CardTitle>AI-Powered Extraction</CardTitle>
              <CardDescription>LLM-based metrics extraction</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Automatically extract sector-specific KPIs with Pydantic validation.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 hover:border-purple-500 transition-colors">
            <CardHeader>
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <CardTitle>Investing Lens</CardTitle>
              <CardDescription>Market insights and white spaces</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Identify incumbent investments, white spaces, and benchmarks for evaluation.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Sectors Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Covered Sectors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-8 border border-blue-700">
            <h3 className="text-2xl font-bold mb-4">Indian Fintech</h3>
            <p className="text-slate-200 mb-4">9 companies including Bajaj Finance, Paytm, and CAMS</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>AUM and growth metrics</li>
              <li>NPA and credit quality</li>
              <li>Digital adoption rates</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-8 border border-red-700">
            <h3 className="text-2xl font-bold mb-4">Indian Defence</h3>
            <p className="text-slate-200 mb-4">8 companies including HAL, BEL, and Bharat Forge</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>Order book composition</li>
              <li>Revenue mix and margins</li>
              <li>R&D and innovation</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-8 border border-green-700">
            <h3 className="text-2xl font-bold mb-4">US Biotech</h3>
            <p className="text-slate-200 mb-4">8 companies including Moderna and Regeneron</p>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>Pipeline stage distribution</li>
              <li>Cash runway analysis</li>
              <li>Clinical trial readouts</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to explore sector intelligence?</h2>
        <p className="text-xl text-slate-300 mb-8">Start analyzing multi-quarter financial data with AI-powered insights.</p>
        {isAuthenticated ? (
          <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
            Open Dashboard <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        ) : (
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
            Sign In Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
          <p>Sector Intelligence Monitor - Financial Research Platform</p>
        </div>
      </footer>
    </div>
  );
}
