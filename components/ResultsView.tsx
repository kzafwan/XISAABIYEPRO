
import React from 'react';
import { AuditResults } from '../types';

interface ResultsViewProps {
  results: AuditResults;
  onDownload: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, onDownload }) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Official Audit Memo Section */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">XisaabiyePro <span className="text-blue-400">Analysis</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Quick Discrepancy List</p>
            </div>
          </div>
          <button 
            onClick={onDownload}
            className="group flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40 active:scale-95"
          >
            <svg className="w-5 h-5 group-hover:bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            EXPORT PDF
          </button>
        </div>
        
        <div className="relative p-8 bg-slate-50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Discrepancy Summary</span>
              <div className="h-px flex-grow bg-slate-200"></div>
            </div>
            
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-inner">
              <p className="text-slate-700 text-base font-mono leading-relaxed">
                {results.summaryNote}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em]">Active Earnings Reconciliation</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
            {results.userSummaries.length} Users Found
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4 font-black">User Details</th>
                <th className="px-6 py-4 font-black text-right">Owed (Debit)</th>
                <th className="px-6 py-4 font-black text-right">Sent (Credit)</th>
                <th className="px-6 py-4 font-black text-right">Balance</th>
                <th className="px-6 py-4 font-black">Source Accounts</th>
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
                    <span className={`inline-block min-w-[80px] px-3 py-1.5 rounded-lg font-black text-xs text-center border shadow-sm ${user.balance < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-200'}`}>
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
                        <span className="text-slate-300 text-[9px] uppercase font-bold">No Records</span>
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
              Defaulters (Zero Paid)
            </h3>
          </div>
          <div className="p-6">
            {results.missingPayments.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2">
                {results.missingPayments.map((entry, idx) => (
                  <li key={idx} className="text-sm font-bold text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    {entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic py-4">No unpaid users detected.</p>
            )}
          </div>
        </div>

        {/* Unmatched Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
            <h3 className="font-black text-amber-800 flex items-center gap-2 text-xs uppercase tracking-widest">
              Unmatched Funds
            </h3>
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
                  <tr key={idx} className="text-xs">
                    <td className="px-6 py-4">
                      <div className="font-mono text-slate-900">{acc.accountNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{acc.transactionRef}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-amber-600">${acc.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.unknownAccounts.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center py-8">No unmatched payments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
