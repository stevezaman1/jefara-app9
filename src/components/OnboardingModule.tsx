import React, { useState } from 'react';
import { UserPlus, CheckCircle, FileCheck, Circle, ShieldCheck, Play } from 'lucide-react';

export default function OnboardingModule() {
  const [candidates, setCandidates] = useState([
    {
      id: 'on_1',
      name: 'Jean-Pierre Mvogo',
      role: 'Junior DevOps Engineer',
      startDate: '2026-08-01',
      progress: 60,
      tasks: [
        { id: 't1', text: 'Sign digital contract & security release form', done: true },
        { id: 't2', text: 'Obtain CNPS identification document', done: true },
        { id: 't3', text: 'Setup decentralized Jefara sandbox login keys', done: true },
        { id: 't4', text: 'Submit bank routing information (RIB)', done: false },
        { id: 't5', text: 'Attend Cameroon HQ onboarding session', done: false },
      ]
    },
    {
      id: 'on_2',
      name: 'Esther Njoh',
      role: 'Accounting Associate',
      startDate: '2026-08-15',
      progress: 20,
      tasks: [
        { id: 'et1', text: 'Sign digital contract & security release form', done: true },
        { id: 'et2', text: 'Obtain CNPS identification document', done: false },
        { id: 'et3', text: 'Setup decentralized Jefara sandbox login keys', done: false },
        { id: 'et4', text: 'Submit bank routing information (RIB)', done: false },
        { id: 'et5', text: 'Attend Cameroon HQ onboarding session', done: false },
      ]
    }
  ]);

  const toggleTask = (candidateId: string, taskId: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === candidateId) {
        const updatedTasks = c.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
        const doneCount = updatedTasks.filter(t => t.done).length;
        const progress = Math.round((doneCount / updatedTasks.length) * 100);
        return { ...c, tasks: updatedTasks, progress };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Onboarding Checklists</h3>
        <p className="text-xs text-zinc-500 font-medium">Coordinate newcomer integration pipelines, equipment setups, and legal agreements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {candidates.map(candidate => (
          <div
            key={candidate.id}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{candidate.name}</h4>
                <p className="text-[11px] text-zinc-500 font-medium">{candidate.role} • Starts {candidate.startDate}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#7c3aed]">{candidate.progress}% Done</span>
                <div className="w-24 bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#7c3aed] h-full transition-all duration-300" style={{ width: `${candidate.progress}%` }}></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Onboarding Steps</h5>
              {candidate.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(candidate.id, task.id)}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-all cursor-pointer text-xs font-semibold text-zinc-700"
                >
                  {task.done ? (
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-zinc-300 shrink-0" />
                  )}
                  <span className={task.done ? 'line-through text-zinc-400 font-medium' : ''}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
