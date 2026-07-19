import React from 'react';
import { Shield, ShieldAlert, Landmark, CheckSquare, Plus } from 'lucide-react';
import { Company } from '../types';

interface BenefitsProps {
  company: Company;
}

export default function BenefitsModule({ company }: BenefitsProps) {
  const benefits = [
    { name: 'Corporate Health Care (AXA)', coverage: '80% Medical & Dental', status: 'Enrolled', cost: '35 000 FCFA/mo', description: 'Comprehensive medical protection across Cameroonian clinic node partners.' },
    { name: 'National Pension Scheme (CNPS)', coverage: 'Statutory Retirement Retainer', status: 'Mandatory', cost: 'Regulatory Contribution', description: 'National social security retirement plan mapped for OHADA compliance.' },
    { name: 'Mutual Solidarity Fund', coverage: 'Disability & Hardship Coverage', status: 'Active', cost: '10 000 FCFA/mo', description: 'Internal employee solidarity ledger for emergencies and emergency welfare loans.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Social Benefits & Coverage</h3>
        <p className="text-xs text-zinc-500 font-medium">Verify employee insurance packages, CNPS contribution tiers, and institutional welfare coverage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit, idx) => (
          <div
            key={idx}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center border border-violet-100">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-bold border border-green-100">
                  {benefit.status}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{benefit.name}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{benefit.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 text-[11px] grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Coverage Limit</span>
                <span className="font-bold text-zinc-800 mt-1 block truncate">{benefit.coverage}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Cost Per Militant</span>
                <span className="font-bold text-zinc-800 mt-1 block truncate font-mono">{benefit.cost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
