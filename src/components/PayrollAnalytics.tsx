import React from 'react';
import { Company, PayrollRun, Payslip } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, Wallet, CreditCard, Landmark, Percent } from 'lucide-react';

interface PayrollAnalyticsProps {
  company: Company;
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
}

export default function PayrollAnalytics({ company, payrollRuns, payslips }: PayrollAnalyticsProps) {
  // Format currency
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: company.currency, 
      minimumFractionDigits: 0 
    }).format(val);
  };

  // Compile data for charts
  // Sort runs chronologically for historical tracking (we can map months to numeric order if needed, but basic sorting works)
  const sortedRuns = [...payrollRuns].sort((a, b) => {
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    if (a.year !== b.year) return a.year - b.year;
    return months.indexOf(a.month) - months.indexOf(b.month);
  });

  const chartData = sortedRuns.map(run => {
    // Calculate total taxes (deductions)
    return {
      period: `${run.month.substring(0, 3)}. ${run.year}`,
      'Salaire de Base': run.totalBasic || 0,
      'Primes': run.totalBonuses || 0,
      'Retenues': run.totalDeductions || 0,
      'Net Payé': run.totalNet || 0,
      'Coût Total': (run.totalBasic || 0) + (run.totalBonuses || 0)
    };
  });

  // Calculate high level cumulative metrics
  const totalNetDisbursed = payrollRuns.reduce((acc, r) => acc + (r.totalNet || 0), 0);
  const totalBasePaid = payrollRuns.reduce((acc, r) => acc + (r.totalBasic || 0), 0);
  const totalTaxesWithheld = payrollRuns.reduce((acc, r) => acc + (r.totalDeductions || 0), 0);
  const totalActiveCycles = payrollRuns.length;

  const averageNetSalary = totalActiveCycles > 0 
    ? totalNetDisbursed / totalActiveCycles 
    : 0;

  return (
    <div className="space-y-6">
      {/* Visual Analytics Title */}
      <div>
        <h3 className="text-lg font-display font-bold text-zinc-900 tracking-tight">Analyses de la Paie & Tableaux de Bord</h3>
        <p className="text-xs text-zinc-500 mt-1">Suivi graphique des charges, cotisations et masses salariales de l'entreprise.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Masse de Net Versée</span>
            <span className="text-lg font-bold text-zinc-900 block font-mono">{formatAmount(totalNetDisbursed)}</span>
            <span className="text-[9px] text-zinc-400 font-mono block">Cumulé sur {totalActiveCycles} cycles</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Salaire Moyen Net</span>
            <span className="text-lg font-bold text-zinc-900 block font-mono">{formatAmount(averageNetSalary)}</span>
            <span className="text-[9px] text-violet-600 font-bold block">Par cycle validé</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Prélèvements Fiscaux</span>
            <span className="text-lg font-bold text-zinc-900 block font-mono">{formatAmount(totalTaxesWithheld)}</span>
            <span className="text-[9px] text-red-600 font-bold block">CNPS & IRPP collectés</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Taux de Net / Brut</span>
            <span className="text-lg font-bold text-zinc-900 block font-mono">
              {totalBasePaid > 0 ? `${((totalNetDisbursed / (totalBasePaid + totalTaxesWithheld)) * 100).toFixed(1)} %` : '100%'}
            </span>
            <span className="text-[9px] text-zinc-400 font-mono block">Efficience salariale nette</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Containers */}
      {payrollRuns.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-100 rounded-3xl p-6">
          <TrendingUp className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-medium">Données analytiques insuffisantes</p>
          <p className="text-[10px] text-zinc-400 mt-1 max-w-xs mx-auto">Veuillez d'abord exécuter et valider des cycles de paie pour peupler les indicateurs de tendance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Salaries & Deduction Trends */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Structure des Coûts par Cycle</h4>
                <p className="text-[10px] text-zinc-400">Comparaison de la part de base, des primes et des prélèvements</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="period" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatAmount(value), '']}
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Salaire de Base" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Primes" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Retenues" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Net vs total Cost */}
          <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-xs space-y-4">
            <div>
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-display">Évolution du Net Distribué vs Charge</h4>
              <p className="text-[10px] text-zinc-400">Progression temporelle de la masse financière</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="period" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatAmount(value), '']}
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" dataKey="Coût Total" stroke="#2563eb" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Net Payé" stroke="#0d9488" fillOpacity={1} fill="url(#colorNet)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historical Summary Table */}
      <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-zinc-50">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Résumé Tabulaire des Exercices de Paie</h4>
        </div>
        {payrollRuns.length === 0 ? (
          <p className="text-xs text-zinc-400 italic p-6 text-center">Aucun cycle enregistré</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4">Effectif</th>
                <th className="py-3 px-4">Masse Salariale brute</th>
                <th className="py-3 px-4">Charges Fiscales retenues</th>
                <th className="py-3 px-4 text-right">Net Global Payé</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
              {sortedRuns.map((run) => (
                <tr key={run.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">{run.month} {run.year}</td>
                  <td className="py-3.5 px-4 text-zinc-500 font-mono">100% (Actifs)</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">{formatAmount((run.totalBasic || 0) + (run.totalBonuses || 0))}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-red-500">-{formatAmount(run.totalDeductions || 0)}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-zinc-950 font-mono">{formatAmount(run.totalNet)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      run.status === 'Paid' ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                      'bg-yellow-50 text-yellow-700 border border-yellow-100'
                    }`}>
                      {run.status === 'Paid' ? 'CLOSED' : 'DRAFT/OPEN'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
