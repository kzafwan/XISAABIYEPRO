import React from 'react';
import { AuditResults } from '../types';

interface ResultsViewProps {
  results: AuditResults;
  onDownload: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, onDownload }) => {
  // Grand Totals Calculation
  const grandTotalOwed = results.userSummaries.reduce((sum, u) => sum + u.totalOwed, 0);
  const grandTotalSent = results.userSummaries.reduce((sum, u) => sum + u.totalSent, 0);
  const netBalance = grandTotalSent - grandTotalOwed;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Owed (Earnings)</p>
          <p className="text-3xl font-black text-slate-900">${grandTotalOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50 hover:shadow-blue-100/50 transition-shadow">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Sent (Statement)</p>
          <p className="text-3xl font-black text-blue-600">${grandTotalSent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={`p-6 rounded-2xl border shadow-sm transition-all ${netBalance < 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${netBalance < 0 ? 'text-red-400' : 'text-emerald-500'}`}>Net Portfolio Balance</p>
          <p className={`text-3xl font-black ${netBalance < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {netBalance < 0 ? '-' : '+'}${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Official Audit Memo Section */}
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
                <path d="M25 38v22l-5-5h10l-5 5" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M75 62v-22l-5 5h10l-5-5" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">XisaabiyePro <span className="text-blue-400">Analysis</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Official Audit Findings</p>
            </div>
          </div>
          <button 
            onClick={onDownload}
            className="group flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40 active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            DOWNLOAD FULL REPORT
          </button>
        </div>
        
        <div className="relative p-8 bg-slate-50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Executive Summary Memo</span>
              <div className="h-px flex-grow bg-slate-200"></div>
            </div>
            
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-inner italic leading-relaxed text-slate-700 font-medium">
              <span className="text-blue-600 font-black not-italic mr-2">AUDIT NOTE:</span>
              {results.summaryNote}
            </div>
          </div>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em]">Detailed User Reconciliation</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100 shadow-xs">
            {results.userSummaries.length} Users Processed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Identified User</th>
                <th className="px-6 py-4 font-black text-right">Owed (Earnings)</th>
                <th className="px-6 py-4 font-black text-right">Sent (Statement)</th>
                <th className="px-6 py-4 font-black text-right">Closing Balance</th>
                <th className="px-6 py-4 font-black">Associated Accounts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.userSummaries.map((user) => (
                <tr key={user.userId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">{user.userName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase px-1.5 py-0.5 bg-slate-100 rounded">{user.userId}</span>
                      {user.phoneNumber && (
                        <span className="text-[10px] text-blue-600 font-black tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{user.phoneNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-slate-600 font-medium">${user.totalOwed.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right text-slate-900 font-black">${user.totalSent.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right">
                    <span className={`inline-block min-w-[80px] px-3 py-1.5 rounded-lg font-black text-xs text-center border shadow-sm transition-all ${user.balance < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      ${user.balance.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {user.accountBreakdown.length > 0 ? (
                        user.accountBreakdown.map((acc, i) => (
                          <div key={i} className="flex items-center gap-1 text-[9px] bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
                            <span className="font-mono text-slate-400">{acc.accountNumber}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="font-black text-slate-700">${acc.amountSent.toFixed(0)}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-300 text-[9px] uppercase font-bold tracking-widest">No Records Found</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Defaulters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-red-100 bg-red-50/50 flex justify-between items-center">
            <h3 className="font-black text-red-800 flex items-center gap-2 text-xs uppercase tracking-widest">
              Critical: Payment Defaulters
            </h3>
          </div>
          <div className="p-6">
            {results.missingPayments.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2">
                {results.missingPayments.map((entry, idx) => (
                  <li key={idx} className="text-sm font-bold text-slate-700 p-3 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic py-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Full compliance. All users have made payments.
              </p>
            )}
          </div>
        </div>

        {/* Unmatched Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
            <h3 className="font-black text-amber-800 flex items-center gap-2 text-xs uppercase tracking-widest">
              Review: Unmatched Funds
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/30">
                <tr className="text-[9px] uppercase text-slate-400 tracking-widest">
                  <th className="px-6 py-3">Account Reference</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.unknownAccounts.map((acc, idx) => (
                  <tr key={idx} className="text-xs group hover:bg-amber-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-900 font-black">{acc.accountNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px] font-medium">{acc.transactionRef}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-amber-600 tracking-tighter uppercase font-mono">${acc.amount.toFixed(2)}</td>
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