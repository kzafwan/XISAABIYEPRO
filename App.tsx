import React, { useState, useEffect } from 'react';
import FileUploadCard from './components/FileUploadCard';
import ResultsView from './components/ResultsView';
import { performAudit } from './services/geminiService';
import { exportResultsToPDF } from './utils/pdfExporter';
import { AuditResults, FileState, FileType } from './types';

const LOADING_STEPS = [
  "Initializing forensic audit engine...",
  "Scanning User Registry for master IDs...",
  "Processing Daily Earnings for debt mapping...",
  "Ingesting Bank Statement for credit verification...",
  "Correlating transactions using cross-reference logic...",
  "Validating final balances and detecting anomalies...",
  "Compiling professional audit report..."
];

const App: React.FC = () => {
  const [registry, setRegistry] = useState<FileState>({ file: null, base64: null, status: 'empty' });
  const [earnings, setEarnings] = useState<FileState>({ file: null, base64: null, status: 'empty' });
  const [statement, setStatement] = useState<FileState>({ file: null, base64: null, status: 'empty' });
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Thought-stream effect
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (type: FileType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const base64 = await fileToBase64(file);
    const update = { file, base64, status: 'ready' as const };

    if (type === 'registry') setRegistry(update);
    else if (type === 'earnings') setEarnings(update);
    else if (type === 'statement') setStatement(update);
    
    setResults(null);
    setError(null);
  };

  const runAudit = async () => {
    if (!registry.base64 || !earnings.base64 || !statement.base64) return;
    
    setLoading(true);
    setError(null);
    try {
      const auditData = await performAudit(
        registry.base64,
        earnings.base64,
        statement.base64
      );
      setResults(auditData);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during the audit.");
    } finally {
      setLoading(false);
    }
  };

  const isReady = registry.status === 'ready' && earnings.status === 'ready' && statement.status === 'ready';

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <defs>
                  <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#84cc16' }} />
                    <stop offset="100%" style={{ stopColor: '#0891b2' }} />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="20" fill="url(#navGrad)" />
                <path d="M35 38c0-5 15-8 15-8s15 3 15 8v15c0 10-15 17-15 17s-15-7-15-17V38z" fill="white" fillOpacity="0.2" />
                <path d="M38 42l10 10-10 10h6l7-7 7 7h6L55 52l10-10h-6l-7 7-7-7z" fill="white" />
                <path d="M25 38v22l-5-5h10l-5 5" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M25 60l-5-6h10z" fill="#ef4444" />
                <path d="M75 62v-22l-5 5h10l-5-5" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" fill="none" />
                <path d="M75 40l-5 6h10z" fill="#22c55e" />
              </svg>
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Xisaabiye<span className="text-blue-600">Pro</span></span>
          </div>
          <div className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Elite Financial Forensics
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">FINANCIAL AUDIT</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
            Cross-audit your records in seconds. Upload your User Registry, Earnings, and Statement to identify every discrepancy.
          </p>
        </header>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FileUploadCard 
            type="registry"
            title="User Registry"
            description="Master list of accounts"
            fileName={registry.file?.name || null}
            onFileChange={(e) => handleFileChange('registry', e)}
          />
          <FileUploadCard 
            type="earnings"
            title="Daily Earnings"
            description="Record of amounts owed"
            fileName={earnings.file?.name || null}
            onFileChange={(e) => handleFileChange('earnings', e)}
          />
          <FileUploadCard 
            type="statement"
            title="Bank Statement"
            description="Proof of incoming funds"
            fileName={statement.file?.name || null}
            onFileChange={(e) => handleFileChange('statement', e)}
          />
        </div>

        {/* Action Button */}
        {!results && (
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={runAudit}
              disabled={!isReady || loading}
              className={`
                group relative px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl
                ${isReady && !loading 
                  ? 'bg-slate-900 text-white hover:bg-black hover:-translate-y-1 active:scale-95 shadow-slate-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
              `}
            >
              <div className="flex items-center gap-3">
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Performing Deep Audit...' : 'Execute Final Audit'}
              </div>
            </button>

            {loading && (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-blue-600 font-black text-xs uppercase tracking-widest animate-pulse mb-2">
                   {LOADING_STEPS[loadingStep]}
                </p>
                <div className="w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-blue-600 transition-all duration-[3500ms] ease-linear"
                    style={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                   ></div>
                </div>
              </div>
            )}

            {!isReady && !loading && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Waiting for 3 documents
              </p>
            )}

            {error && (
              <div className="mt-4 p-6 bg-white border-2 border-red-100 rounded-2xl max-w-lg shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900">Audit Interrupted</h3>
                    <p className="text-sm text-red-700 mt-1 font-medium">{error}</p>
                    <a 
                      href="https://ai.google.dev/gemini-api/docs/api-key" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs font-black text-red-600 uppercase border-b-2 border-red-200 hover:border-red-600"
                    >
                      Verify API Access
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <ResultsView 
            results={results} 
            onDownload={() => exportResultsToPDF(results)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;