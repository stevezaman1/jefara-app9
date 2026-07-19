import React, { useState } from 'react';
import { Company, AccountingEntry } from '../types';
import { 
  Plus, Receipt, ArrowUpRight, TrendingDown, 
  RefreshCw, DollarSign, Wallet, FileText, CheckCircle2,
  Calendar, Layers, ShieldCheck, CheckSquare, Search
} from 'lucide-react';
import { db, doc, setDoc, updateDoc } from '../firebase';
import { PageHelpButton } from './PageHelpButton';
import { motion, AnimatePresence } from 'motion/react';

interface AccountingProps {
  company: Company;
  accountingEntries: AccountingEntry[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function AccountingModule({ company, accountingEntries, onRefresh, activeSubTab }: AccountingProps) {
  const [subTab, setSubTab] = useState<'ledger' | 'budget' | 'expenses'>('ledger');

  React.useEffect(() => {
    if (activeSubTab === 'accounting-expenses') {
      setSubTab('expenses');
    } else if (activeSubTab === 'accounting-budget') {
      setSubTab('budget');
    } else {
      setSubTab('ledger');
    }
  }, [activeSubTab]);
  
  // Forms
  const [type, setType] = useState<'Journal' | 'ExpenseClaim' | 'BudgetAllocation'>('Journal');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Salary Expense');
  const [department, setDepartment] = useState(company.departments[0] || 'Operations');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setSaving(true);
    try {
      const entryId = 'acc_' + Math.random().toString(36).substring(2, 11);
      const newEntry: AccountingEntry = {
        id: entryId,
        companyId: company.id,
        type,
        description,
        amount: parseFloat(amount),
        category,
        department,
        status: type === 'ExpenseClaim' ? 'Pending' : 'Approved',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'accounting_entries', entryId), newEntry);
      
      // Reset
      setDescription('');
      setAmount('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleApproveExpense = async (entryId: string) => {
    try {
      const docRef = doc(db, 'companies', company.id, 'accounting_entries', entryId);
      await updateDoc(docRef, { status: 'Approved' });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(val);
  };

  // Filter entries
  const filteredEntries = accountingEntries.filter(e => {
    const isSameTab = 
      (subTab === 'ledger' && e.type === 'Journal') ||
      (subTab === 'budget' && e.type === 'BudgetAllocation') ||
      (subTab === 'expenses' && e.type === 'ExpenseClaim');
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.department.toLowerCase().includes(searchQuery.toLowerCase());
    return isSameTab && matchesSearch;
  });

  // Calculate totals
  const totalLedgerExpenses = accountingEntries.filter(e => e.type === 'Journal').reduce((sum, e) => sum + e.amount, 0);
  const totalAllocatedBudget = accountingEntries.filter(e => e.type === 'BudgetAllocation').reduce((sum, e) => sum + e.amount, 0);
  const totalPendingClaims = accountingEntries.filter(e => e.type === 'ExpenseClaim' && e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">Volume Salaires Comptabilisé</span>
            <span className="text-lg font-bold text-emerald-950 font-display mt-0.5">{formatAmount(totalLedgerExpenses)}</span>
          </div>
          <div className="h-9 w-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-violet-800 font-bold block uppercase tracking-wider">Budgets Alloués Totaux</span>
            <span className="text-lg font-bold text-violet-950 font-display mt-0.5">{formatAmount(totalAllocatedBudget)}</span>
          </div>
          <div className="h-9 w-9 bg-violet-600 text-white rounded-lg flex items-center justify-center">
            <Layers className="h-4 w-4" />
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">Notes de Frais en Suspense</span>
            <span className="text-lg font-bold text-amber-950 font-display mt-0.5">{formatAmount(totalPendingClaims)}</span>
          </div>
          <div className="h-9 w-9 bg-amber-600 text-white rounded-lg flex items-center justify-center">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Post transaction (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm h-fit space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-50 pb-3">
            <Receipt className="h-4 w-4 text-violet-600" />
            <h3 className="font-display font-bold text-zinc-900 text-sm">Écriture Comptable</h3>
          </div>

          <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Type d'Écriture</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Journal', 'ExpenseClaim', 'BudgetAllocation'] as const).map(t => (
                  <button 
                    key={t} type="button" 
                    onClick={() => { setType(t); if(t === 'BudgetAllocation') { setCategory('Budget Allocation'); } else if(t === 'ExpenseClaim') { setCategory('Staff Reimbursement'); } else { setCategory('Salary Expense'); } }}
                    className={`py-2 rounded-xl font-bold border text-[9px] text-center transition-all cursor-pointer ${type === t ? 'bg-violet-600 text-white border-violet-600 shadow-sm' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'}`}
                  >
                    {t === 'Journal' ? 'Journal' : t === 'ExpenseClaim' ? 'Note Frais' : 'Budget'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Description Libellé *</label>
              <input 
                type="text" required value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Dotation Internet Douala Q3, Acompte salaire"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Montant ({company.currency}) *</label>
                <input 
                  type="number" required value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="Montant net XAF"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Département Coût</label>
                <select 
                  value={department} onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all appearance-none"
                >
                  {company.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Code de Catégorie</label>
              <input 
                type="text" value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white transition-all font-semibold text-zinc-700"
              />
            </div>

            <button 
              type="submit" disabled={saving}
              className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Comptabilisation...' : 'Enregistrer au journal'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: HIGH QUALITY DATA TABLES FOR ACCOUNTING AUDITS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SEARCH AND CONTROL BAR */}
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
              <input 
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Chercher par libellé, imputation, code..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* DYNAMIC DATA TABLE VIEW */}
          <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-xs">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-20 px-4 flex flex-col items-center justify-center space-y-4">
                <div className="h-10 w-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-zinc-800 text-xs">No financial data available.</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Enter transactions or process payroll cycles to populate the general ledger books.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <th className="py-3 px-4">Libellé Transaction</th>
                      <th className="py-3 px-4">Imputation / Code</th>
                      <th className="py-3 px-4">Cost Center (Dept)</th>
                      <th className="py-3 px-4">Date de Saisie</th>
                      <th className="py-3 px-4 text-right">Montant ({company.currency})</th>
                      {subTab === 'expenses' && <th className="py-3 px-4 text-right">Décision</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-zinc-600 font-medium">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-zinc-50/40 transition-colors">
                        {/* Description */}
                        <td className="py-3.5 px-4 font-semibold text-zinc-950">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-600 inline-block" />
                            {entry.description}
                          </div>
                        </td>

                        {/* Category Code */}
                        <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-500">{entry.category}</td>

                        {/* Cost center */}
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">
                            {entry.department}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">{entry.date}</td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right font-bold text-zinc-950 font-mono text-[12px]">
                          {formatAmount(entry.amount)}
                        </td>

                        {/* Decision for claims */}
                        {subTab === 'expenses' && (
                          <td className="py-3.5 px-4 text-right">
                            {entry.status === 'Pending' ? (
                              <button 
                                onClick={() => handleApproveExpense(entry.id)}
                                className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-850 text-white rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                              >
                                Décaisser
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[9px] font-mono border border-emerald-100 bg-emerald-50 px-2 py-0.5 rounded-md">
                                DISBURSED
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
