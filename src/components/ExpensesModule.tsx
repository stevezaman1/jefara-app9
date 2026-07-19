import React, { useState } from 'react';
import { Wallet, Plus, Check, X, Search, FileText } from 'lucide-react';
import { Company } from '../types';

interface ExpensesProps {
  company: Company;
}

export default function ExpensesModule({ company }: ExpensesProps) {
  const [claims, setClaims] = useState([
    { id: 'exp_1', name: 'Douala HQ Router Upgrade', amount: '85 000 FCFA', category: 'IT & Equipment', employee: 'Jean-Pierre Mvogo', status: 'Pending', date: '2026-07-16' },
    { id: 'exp_2', name: 'Client Lunch (Yaoundé node)', amount: '35 000 FCFA', category: 'Meals & Entertainment', employee: 'Amadou Bello', status: 'Approved', date: '2026-07-14' },
    { id: 'exp_3', name: 'Field Office Supplies', amount: '12 500 FCFA', category: 'Office Supplies', employee: 'Esther Njoh', status: 'Pending', date: '2026-07-12' },
  ]);

  const handleApprove = (id: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c));
  };

  const handleReject = (id: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-black text-slate-900 text-lg">Expense Claims & Reimbursements</h3>
          <p className="text-xs text-zinc-500 font-medium">Verify corporate business expenditures, validate receipts, and execute approved payout disbursements</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Claim Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Category</th>
                <th className="p-4">Militant</th>
                <th className="p-4">Requested Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700 font-medium">
              {claims.map(claim => (
                <tr key={claim.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-zinc-900">{claim.name}</td>
                  <td className="p-4 font-mono font-bold text-[#7c3aed]">{claim.amount}</td>
                  <td className="p-4 text-zinc-500">{claim.category}</td>
                  <td className="p-4 text-zinc-800 font-semibold">{claim.employee}</td>
                  <td className="p-4 text-zinc-500">{claim.date}</td>
                  <td className="p-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      claim.status === 'Approved' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                      claim.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right space-x-2 shrink-0">
                    {claim.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleReject(claim.id)}
                          className="p-1 rounded-lg border border-zinc-200 hover:bg-red-50 hover:text-red-600 text-zinc-400 transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleApprove(claim.id)}
                          className="p-1 rounded-lg bg-zinc-950 text-white hover:bg-zinc-900 transition-all cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
