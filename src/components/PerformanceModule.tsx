import React from 'react';
import { Award, Target, MessageSquare, TrendingUp } from 'lucide-react';

export default function PerformanceModule() {
  const reviews = [
    { name: 'Jean-Pierre Mvogo', role: 'DevOps Lead', kpi: '94% uptime target', okr: 'Deploy secondary backup node matrix in Cameroon', score: 'A (Outstanding)', period: 'Q2 2026' },
    { name: 'Fanta Kaba', role: 'Finance Head', kpi: 'Zero regulatory drift', okr: 'Align double-entry accounting configurations with CEMAC guidelines', score: 'A+ (Excellent)', period: 'Q2 2026' },
    { name: 'Pierre Tsala', role: 'HR Manager', kpi: 'Onboard 10 militants', okr: 'Standardize digital personnel file structures', score: 'B (Meets Expectations)', period: 'Q2 2026' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Performance Scorecards & OKRs</h3>
        <p className="text-xs text-zinc-500 font-medium">Standardize corporate objectives, evaluate key performance indicators (KPIs), and log review letters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Award className="h-5 w-5" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 bg-violet-50 text-[#7c3aed] rounded-full font-bold border border-violet-100">
                  {rev.score}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{rev.name}</h4>
                <p className="text-[10px] text-zinc-500 font-medium">{rev.role} • {rev.period}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
                <div>
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[8px] block">Active KPI Target</span>
                  <p className="text-zinc-700 font-semibold mt-0.5">{rev.kpi}</p>
                </div>
                <div>
                  <span className="text-zinc-400 font-bold uppercase tracking-widest text-[8px] block">Corporate OKR Goal</span>
                  <p className="text-zinc-700 font-semibold mt-0.5">{rev.okr}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-3 rounded-2xl flex items-center gap-2 text-[10px] text-zinc-500 font-semibold border border-zinc-200/60">
              <MessageSquare className="h-3.5 w-3.5 text-[#7c3aed]" />
              <span>Feedback loop completed & certified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
