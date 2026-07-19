import React, { useState } from 'react';
import { Layers, Users, TrendingUp, Landmark, ShieldCheck, Plus, Search } from 'lucide-react';
import { Company, Employee } from '../types';

interface DepartmentsProps {
  company: Company;
  employees: Employee[];
}

export default function DepartmentsModule({ company, employees }: DepartmentsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Group stats by department
  const depts = company.departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept && e.status === 'Active');
    const totalPayroll = deptEmployees.reduce((acc, e) => acc + e.basicSalary, 0);
    
    // Assign heads of departments for a premium touch
    let manager = 'Amadou Bello';
    if (dept === 'Accounting' || dept === 'Finance') manager = 'Fanta Kaba';
    if (dept === 'Operations' || dept === 'Engineering') manager = 'Jean-Pierre Mvogo';

    return {
      name: dept,
      head: manager,
      staffCount: deptEmployees.length,
      monthlyBurden: totalPayroll,
      color: dept === 'Operations' ? 'text-sky-600 bg-sky-50 border-sky-100' :
             dept === 'Accounting' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' :
             dept === 'Human Resources' ? 'text-[#7c3aed] bg-violet-50 border-violet-100' :
             'text-zinc-600 bg-zinc-50 border-zinc-150',
    };
  });

  const filteredDepts = depts.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-black text-slate-900 text-lg">Department Directory</h3>
          <p className="text-xs text-zinc-500 font-medium">Manage and audit active corporate subdivisions, budgets, and leadership heads</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-150 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#7c3aed] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept, idx) => (
          <div
            key={idx}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-base">{dept.name}</h4>
                <p className="text-[11px] text-zinc-500 font-medium">Head: <strong className="text-zinc-700">{dept.head}</strong></p>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${dept.color}`}>
                Active Unit
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Total Staff</span>
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm">
                  <Users className="h-4 w-4 text-zinc-400" />
                  <span>{dept.staffCount} {dept.staffCount > 1 ? 'militants' : 'militant'}</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Payroll Burden</span>
                <div className="flex items-center gap-1.5 text-zinc-900 font-mono font-bold text-sm">
                  <Landmark className="h-4 w-4 text-zinc-400" />
                  <span>
                    {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(dept.monthlyBurden)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50/60 p-3 rounded-2xl flex items-center gap-2.5 text-[10px] text-zinc-500 font-semibold border border-zinc-150/40">
              <ShieldCheck className="h-4 w-4 text-[#7c3aed]" />
              <span>Auto-linked to Cameroon payroll regulatory ledger</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
