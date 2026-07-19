import React from 'react';
import { Network, Users, ArrowDown, Award, Briefcase, Shield } from 'lucide-react';
import { Company, Employee } from '../types';

interface OrgChartProps {
  company: Company;
  employees: Employee[];
}

export default function OrgChartModule({ company, employees }: OrgChartProps) {
  // Mock hierarchy to showcase a clean SaaS structure
  const executive = {
    name: 'Marie Sissoko',
    role: 'Chief Executive Officer',
    dept: 'Executive Office',
    avatar: 'MS',
    color: 'bg-violet-600 text-white border-violet-100',
    subordinates: [
      {
        name: 'Amadou Bello',
        role: 'Director of HR',
        dept: 'Human Resources',
        avatar: 'AB',
        color: 'bg-[#7c3aed] text-white border-violet-100',
        subordinates: employees.filter(e => e.department === 'Human Resources' || e.department === 'HR')
      },
      {
        name: 'Fanta Kaba',
        role: 'Head of Accounting',
        dept: 'Finance & double-entry',
        avatar: 'FK',
        color: 'bg-indigo-600 text-white border-indigo-100',
        subordinates: employees.filter(e => e.department === 'Accounting' || e.department === 'Finance')
      },
      {
        name: 'Jean-Pierre Mvogo',
        role: 'Engineering Lead',
        dept: 'Operations & DevOps',
        avatar: 'JM',
        color: 'bg-sky-600 text-white border-sky-100',
        subordinates: employees.filter(e => e.department !== 'Human Resources' && e.department !== 'HR' && e.department !== 'Accounting' && e.department !== 'Finance')
      }
    ]
  };

  return (
    <div className="space-y-8 p-1">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Organization Chart</h3>
        <p className="text-xs text-zinc-500 font-medium">Visual hierarchical map of personnel divisions and organizational structures</p>
      </div>

      <div className="bg-white border border-zinc-150 rounded-3xl p-8 overflow-x-auto min-w-full">
        <div className="flex flex-col items-center space-y-8 min-w-[700px] py-4">
          
          {/* Level 1: CEO */}
          <div className="flex flex-col items-center">
            <div className="border border-zinc-250 p-5 rounded-2xl bg-zinc-950 text-white shadow-md text-center max-w-xs relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#7c3aed] text-white text-[9px] font-bold rounded-full tracking-wider uppercase">
                Global Headquarters
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 mx-auto flex items-center justify-center font-bold text-sm mb-2">
                {executive.avatar}
              </div>
              <h4 className="font-bold text-sm">{executive.name}</h4>
              <p className="text-[11px] opacity-80 font-medium">{executive.role}</p>
              <span className="text-[10px] opacity-60 font-mono mt-1 block">{executive.dept}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-zinc-300 relative">
            <ArrowDown className="h-3 w-3 text-zinc-400 absolute bottom-0 -left-[5px]" />
          </div>

          {/* Level 2: Directors */}
          <div className="grid grid-cols-3 gap-8 w-full relative">
            {/* horizontal line connecting level 2 */}
            <div className="absolute top-0 left-[16.6%] right-[16.6%] h-px bg-zinc-300 -translate-y-8"></div>

            {executive.subordinates.map((dir, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-4">
                {/* vertical tick from connector */}
                <div className="h-8 w-px bg-zinc-300 -mt-4"></div>

                <div className="border border-zinc-150 p-4 rounded-2xl bg-white shadow-xs text-center max-w-[200px] w-full">
                  <div className="h-8 w-8 rounded-full bg-[#7c3aed]/10 text-[#7c3aed] mx-auto flex items-center justify-center font-bold text-xs mb-2">
                    {dir.avatar}
                  </div>
                  <h5 className="font-semibold text-xs text-zinc-900">{dir.name}</h5>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{dir.role}</p>
                  <span className="text-[9px] px-2 py-0.5 bg-zinc-50 text-zinc-600 rounded-full font-mono mt-1.5 inline-block font-semibold">
                    {dir.dept}
                  </span>
                </div>

                {dir.subordinates.length > 0 && (
                  <>
                    <div className="h-6 w-px bg-zinc-300"></div>
                    
                    {/* Level 3: Staff list under Directors */}
                    <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-3 w-full max-w-[210px] space-y-1.5">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block text-center mb-1">
                        Active Staff ({dir.subordinates.length})
                      </span>
                      {dir.subordinates.map((sub, sIdx) => (
                        <div key={sIdx} className="bg-white border border-zinc-150 p-2.5 rounded-xl flex items-center gap-2.5">
                          <div className="h-6 w-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[9px] shrink-0">
                            {sub.firstName[0]}{sub.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <h6 className="text-[10px] font-semibold text-zinc-900 truncate">
                              {sub.firstName} {sub.lastName}
                            </h6>
                            <p className="text-[9px] text-zinc-500 truncate">{sub.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
