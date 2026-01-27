import React, { useState } from 'react';
import FileUploadCard from './components/FileUploadCard';
import ResultsView from './components/ResultsView';
import { performAudit } from './services/geminiService';
import { exportResultsToPDF } from './utils/pdfExporter';
import { AuditResults, FileState, FileType } from './types';

const App: React.FC = () => {
  const [registry, setRegistry] = useState<FileState>({ file: null, base64: null, status: 'empty' });
  const [earnings, setEarnings] = useState<FileState>({ file: null, base64: null, status: 'empty' });
  const [statement, setStatement] = useState<FileState>({ file: null, base64: null, status: 'empty' });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">Xisaabiye<span className="text-blue-600">Pro</span></span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Professional Financial Cross-Check
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">XISAABIYE REPORTING</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Cross-audit your User Registry against Daily Earnings and Bank Statements. Identify unpaid balances and unlinked source accounts instantly.
          </p>
        </header>

        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <FileUploadCard 
            type="registry"
            title="Registry PDF"
            description="Master list of approved users"
            fileName={registry.file?.name || null}
            onFileChange={(e) => handleFileChange('registry', e)}
          />
          <FileUploadCard 
            type="earnings"
            title="Earnings PDF"
            description="Historical log of amounts owed"
            fileName={earnings.file?.name || null}
            onFileChange={(e) => handleFileChange('earnings', e)}
          />
          <FileUploadCard 
            type="statement"
            title="Statement PDF"
            description="Bank record of incoming transfers"
            fileName={statement.file?.name || null}
            onFileChange={(e) => handleFileChange('statement', e)}
          />
        </div>

        {/* Action Button */}
        {!results && (
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={runAudit}
              disabled={!isReady || loading}
              className={`
                px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl
                ${isReady && !loading 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1 active:scale-95 shadow-slate-200' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
              `}
            >
              {loading ? 'Processing Audit...' : 'Execute Audit Analysis'}
            </button>
            {!isReady && (
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
                Awaiting Document Uploads
              </p>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm max-w-md text-center">
                {error}
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

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10 opacity-30"></div>
    </div>
  );
};

export default App;