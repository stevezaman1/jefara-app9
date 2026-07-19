import React from 'react';
import { CalendarDays, Clock, Users, ArrowRight } from 'lucide-react';
import { Company } from '../types';

interface SchedulesProps {
  company: Company;
}

export default function SchedulesModule({ company }: SchedulesProps) {
  const shifts = [
    { title: 'Morning Operational Shift', hours: '08:00 - 16:00', dept: 'Engineering', personnel: 'Jean-Pierre, Amadou, Marie' },
    { title: 'Accounting Closing Rosters', hours: '09:00 - 17:00', dept: 'Accounting & Finance', personnel: 'Fanta, Esther' },
    { title: 'Afternoon Support Nodes', hours: '12:00 - 20:00', dept: 'Operations', personnel: 'Salomon, Pierre' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Work Schedules & Shifts</h3>
        <p className="text-xs text-zinc-500 font-medium">Assign weekly shift coverage, set compliance limits, and track active work timings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift, idx) => (
          <div
            key={idx}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center border border-violet-100">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <span className="text-[10px] px-2.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-full font-bold border border-zinc-200">
                  Monday - Friday
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{shift.title}</h4>
                <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-xs mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{shift.hours} (Standard 8h)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">Assigned Personnel</span>
              <p className="text-xs font-semibold text-zinc-700 leading-normal">{shift.personnel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
