import React, { useState } from 'react';
import { Users, User, Kanban, CheckSquare, Sparkles, MessageSquare } from 'lucide-react';
import { Company, Employee } from '../types';

interface TeamsProps {
  company: Company;
  employees: Employee[];
}

export default function TeamsModule({ company, employees }: TeamsProps) {
  const [teams, setTeams] = useState([
    {
      id: 't_1',
      name: 'Douala Engineering Nodes',
      lead: 'Jean-Pierre Mvogo',
      description: 'Main DevOps and cloud orchestration guild for our central infrastructure.',
      membersCount: 8,
      activeSprint: 'Sprint #42: Ledger Cryptography',
      priority: 'high',
    },
    {
      id: 't_2',
      name: 'Yaoundé Commercial Unit',
      lead: 'Bello Sali',
      description: 'Sales, customer acquisition, and enterprise partnerships across the CEMAC region.',
      membersCount: 5,
      activeSprint: 'Onboarding Enterprise Nodes',
      priority: 'normal',
    },
    {
      id: 't_3',
      name: 'HR & Compliance Squad',
      lead: 'Amadou Bello',
      description: 'OHADA legal regulatory checks, labor policy enforcement, and onboarding.',
      membersCount: 3,
      activeSprint: 'Tax Table Validation Q3',
      priority: 'normal',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Active Team Workspaces</h3>
        <p className="text-xs text-zinc-500 font-medium">Coordinate collaboration, active workflows, and sprint directives within specialized teams</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div
            key={team.id}
            className="bg-white border border-zinc-150 rounded-3xl p-6 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-2xl bg-violet-50 text-[#7c3aed] flex items-center justify-center border border-violet-100">
                  <Users className="h-5 w-5" />
                </div>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  team.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                }`}>
                  {team.priority === 'high' ? 'High Focus' : 'Standard'}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{team.name}</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{team.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Team Leader</span>
                  <span className="font-bold text-zinc-800 mt-1 block truncate">{team.lead}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold uppercase tracking-wider text-[9px]">Militants Count</span>
                  <span className="font-bold text-zinc-800 mt-1 block">{team.membersCount} active</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-3.5 rounded-2xl space-y-2 border border-zinc-150">
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                <Kanban className="h-3.5 w-3.5 text-[#7c3aed]" />
                <span>Active Sprint</span>
              </div>
              <p className="text-xs font-bold text-zinc-800 truncate">{team.activeSprint}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
