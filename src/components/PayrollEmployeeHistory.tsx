import React, { useState } from 'react';
import { Company, Employee, Payslip } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { User, Search, TrendingUp, DollarSign, Award, ShieldAlert } from 'lucide-react';

interface EmployeeHistoryProps {
  company: Company;
  employees: Employee[];
  payslips: Payslip[];
}

export default function PayrollEmployeeHistory({ company, employees, payslips }: EmployeeHistoryProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Format currency
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: company.currency, 
      minimumFractionDigits: 0 
    }).format(val);
  };

  // Filter employees list by search query
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Automatically select first employee if none is selected
  const activeEmployeeId = selectedEmployeeId || (employees[0]?.id || '');
  const selectedEmp = employees.find(e => e.id === activeEmployeeId);

  // Retrieve payslips for this employee, sorted chronologically
  const employeePayslips = payslips
    .filter(p => p.employeeId === activeEmployeeId)
    .sort((a, b) => {
      const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
      if (a.year !== b.year) return a.year - b.year;
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

  // Prep chart data
  const historyChartData = employeePayslips.map(slip => {
    const bonusesSum = slip.bonuses.reduce((acc, b) => acc + b.amount, 0);
    const deductionsSum = slip.deductions.reduce((acc, d) => acc + d.amount, 0);
    return {
      period: `${slip.month.substring(0, 3)}. ${slip.year}`,
      'Base': slip.basicSalary,
      'Primes (+)': bonusesSum,
      'Retenues (-)': deductionsSum,
      'Net Payé': slip.netSalary
    };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-lg font-display font-bold text-zinc-900 tracking-tight">Historique Individuel des Rémunérations</h3>
        <p className="text-xs text-zinc-500 mt-1">Audit nominatif de l'historique des gains, primes et déductions d'un collaborateur.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Selection List */}
        <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[28px] p-5 shadow-xs space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un collaborateur..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredEmployees.length === 0 ? (
              <p className="text-xs text-zinc-400 italic text-center py-6">Aucun collaborateur trouvé</p>
            ) : (
              filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left text-xs ${
                    activeEmployeeId === emp.id 
                      ? 'bg-violet-50 text-violet-700 border border-violet-100 font-bold' 
                      : 'hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div className="truncate">
                    <span className="block text-zinc-900 font-semibold leading-tight">{emp.firstName} {emp.lastName}</span>
                    <span className="text-[10px] text-zinc-400 block font-mono">{emp.department} • {emp.role}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column: History Trends and detailed table */}
        <div className="lg:col-span-8 space-y-6">
          {selectedEmp ? (
            <>
              {/* Trend Chart */}
              <div className="bg-white border border-zinc-100 rounded-[28px] p-6 shadow-xs space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider font-display">Trajectoire des Rémunérations</h4>
                  <p className="text-[10px] text-zinc-400">Progression historique du salaire net vs primes pour {selectedEmp.firstName} {selectedEmp.lastName}</p>
                </div>

                {employeePayslips.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 italic text-xs">
                    Aucun bulletin de paie historique enregistré pour ce collaborateur.
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="period" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                        <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value: any) => [formatAmount(value), '']}
                          contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        <Line type="monotone" dataKey="Net Payé" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Base" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="Primes (+)" stroke="#10b981" strokeWidth={1.5} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Individual History Table */}
              <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-xs">
                <div className="px-5 py-4 border-b border-zinc-50 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Livre d'Audit Nominatif</h4>
                  <span className="text-[10px] font-mono text-zinc-400">{employeePayslips.length} Émissions passées</span>
                </div>

                {employeePayslips.length === 0 ? (
                  <div className="p-10 text-center text-zinc-400 italic text-xs">Aucune ligne comptable disponible.</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <th className="py-3 px-4">Période</th>
                        <th className="py-3 px-4 text-right">Salaire Base</th>
                        <th className="py-3 px-4 text-right text-emerald-600">Total Primes (+)</th>
                        <th className="py-3 px-4 text-right text-red-600">Total Retenues (-)</th>
                        <th className="py-3 px-4 text-right font-bold text-zinc-900">Salaire Net Payé</th>
                        <th className="py-3 px-4">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
                      {employeePayslips.map((slip, idx) => {
                        const bonusesSum = slip.bonuses.reduce((acc, b) => acc + b.amount, 0);
                        const deductionsSum = slip.deductions.reduce((acc, d) => acc + d.amount, 0);

                        return (
                          <tr key={slip.id + '-' + idx} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-3 px-4 font-bold text-zinc-900">{slip.month} {slip.year}</td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-400">{formatAmount(slip.basicSalary)}</td>
                            <td className="py-3 px-4 text-right font-mono text-emerald-600">+{formatAmount(bonusesSum)}</td>
                            <td className="py-3 px-4 text-right font-mono text-red-600">-{formatAmount(deductionsSum)}</td>
                            <td className="py-3 px-4 text-right font-bold font-mono text-zinc-950">{formatAmount(slip.netSalary)}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                slip.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                                'bg-yellow-50 text-yellow-700 border border-yellow-100'
                              }`}>
                                {slip.status === 'Paid' ? 'RÉGLÉ' : 'BROUILLON'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-[28px] p-16 text-center text-zinc-400">
              Veuillez sélectionner un collaborateur pour afficher son historique.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
