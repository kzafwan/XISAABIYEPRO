
import React from 'react';
import { AuditResults } from '../types';

interface ResultsViewProps {
  results: AuditResults;
  onDownload: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, onDownload }) => {
  const grandTotalOwed = results.userSummaries.reduce((sum, u) => sum + u.totalOwed, 0);
  const grandTotalSent = results.userSummaries.reduce((sum, u) => sum + u.totalSent, 0);
  const netBalance = grandTotalSent - grandTotalOwed;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Owed (Earnings)</p>
          <p className="text-3xl font-black text-slate-900">${grandTotalOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Sent (Statement)</p>
          <p className="text-3xl font-black text-blue-600">${grandTotalSent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm ${netBalance < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${netBalance < 0 ? 'text-red-400' : 'text-emerald-500'}`}>Net Portfolio Balance</p>
          <p className={`text-3xl font-black ${netBalance < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {netBalance < 0 ? '-' : '+'}${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Audit Header */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white/10 rounded-xl p-1 shadow-inner backdrop-blur-sm border border-white/5">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#84cc16' }} />
                    <stop offset="100%" style={{ stopColor: '#0891b2' }} />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="20" fill="url(#headerGrad)" />
                <path d="M38 42l10 10-10 10h6l7-7 7 7h6L55 52l10-10h-6l-7 7-7-7z" fill="white" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Audit <span className="text-blue-400">Analysis</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Official Findings</p>
            </div>
          </div>
          <button 
            onClick={onDownload}
            className="group flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            DOWNLOAD PDF REPORT
          </button>
        </div>
        <div className="p-8 bg-slate-50 italic text-slate-700 font-medium leading-relaxed border-b border-slate-200">
           <span className="text-blue-600 font-black not-italic mr-2">AUDIT NOTE:</span> {results.summaryNote}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Identified User</th>
                <th className="px-6 py-4 font-black text-right">Owed (Earnings)</th>
                <th className="px-6 py-4 font-black text-right">Sent (Statement)</th>
                <th className="px-6 py-4 font-black text-right">Balance</th>
                <th className="px-6 py-4 font-black">Linked Accounts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.userSummaries.map((user) => (
                <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900">{user.userName}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-100 rounded">{user.userId}</span>
                      {user.phoneNumber && <span className="text-[10px] text-blue-500 font-bold">{user.phoneNumber}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-600 font-medium">${user.totalOwed.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-900 font-black">${user.totalSent.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`inline-block min-w-[80px] px-3 py-1.5 rounded-lg font-black text-xs text-center border shadow-sm ${user.balance < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {user.balance < 0 ? '-' : '+'}${Math.abs(user.balance).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.accountBreakdown.map((acc, i) => (
                        <span key={i} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-mono">
                          {acc.accountNumber}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-red-100 bg-red-50/50">
            <h3 className="font-black text-red-800 text-xs uppercase tracking-widest">Critical Defaulters</h3>
          </div>
          <div className="p-6">
            {results.missingPayments.length > 0 ? (
              <ul className="space-y-2">
                {results.missingPayments.map((entry, idx) => (
                  <li key={idx} className="text-sm font-bold text-slate-700 p-3 bg-red-50/30 rounded-lg border border-red-100 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4">No defaulters found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-amber-100 bg-amber-50/50">
            <h3 className="font-black text-amber-800 text-xs uppercase tracking-widest">Unmatched Credits</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30">
                <tr className="text-[9px] uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-3">Reference</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.unknownAccounts.map((acc, idx) => (
                  <tr key={idx} className="text-xs hover:bg-amber-50/20">
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-900 font-bold">{acc.accountNumber}</div>
                      <div className="text-[10px] text-slate-400">{acc.transactionRef}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-amber-600">${acc.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.unknownAccounts.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-8">Zero unmatched credits detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
