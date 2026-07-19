import React, { useState } from 'react';
import { Award, ShieldAlert, DollarSign, ListCollapse, Search } from 'lucide-react';
import { Company } from '../types';

interface PositionsProps {
  company: Company;
}

export default function PositionsModule({ company }: PositionsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const positions = [
    { title: 'Global Infrastructure Architect', grade: 'Grade A', baseSalary: '1 200 000 FCFA', dept: 'Engineering', requirements: '10+ years exp, Docker, cloud architecture.' },
    { title: 'Principal Accountant', grade: 'Grade B', baseSalary: '850 000 FCFA', dept: 'Finance', requirements: 'OHADA double-entry systems certified, CPA/ACC.' },
    { title: 'Senior Talent Acquisition', grade: 'Grade C', baseSalary: '600 000 FCFA', dept: 'Human Resources', requirements: 'Bilingual (FR/EN), CEMAC regional labor code expert.' },
    { title: 'Junior Software Engineer', grade: 'Grade D', baseSalary: '450 000 FCFA', dept: 'Engineering', requirements: 'React, TypeScript, state machine programming.' },
    { title: 'Compliance Auditor', grade: 'Grade B', baseSalary: '750 000 FCFA', dept: 'Legal & Risk', requirements: 'Regulatory filing frameworks, compliance checks.' },
  ];

  const filteredPositions = positions.filter(pos => 
    pos.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pos.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-black text-slate-900 text-lg">Positions & Grading Registry</h3>
          <p className="text-xs text-zinc-500 font-medium">Standardize corporate seniority tiers, professional grades, and baseline OHADA wage structures</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-150 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#7c3aed] transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-150 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 pl-6">Job Title</th>
                <th className="p-4">Seniority Grade</th>
                <th className="p-4">Baseline Wage Bracket</th>
                <th className="p-4">Division / Dept</th>
                <th className="p-4 pr-6">Qualification Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {filteredPositions.map((pos, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-zinc-900">{pos.title}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-violet-50 text-[#7c3aed] border border-violet-100 rounded-md font-bold text-[10px]">
                      {pos.grade}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-zinc-900">{pos.baseSalary}</td>
                  <td className="p-4 font-medium text-zinc-500">{pos.dept}</td>
                  <td className="p-4 pr-6 text-zinc-500 italic max-w-xs truncate">{pos.requirements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
