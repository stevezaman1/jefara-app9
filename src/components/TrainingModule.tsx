import React from 'react';
import { BookOpen, Award, CheckCircle, Clock } from 'lucide-react';

export default function TrainingModule() {
  const courses = [
    { title: 'OHADA Accounting Standards & Ledger Setup', duration: '6 hours', progress: 100, completed: true, desc: 'Master double-entry journal logs and asset compliance schemas for regional audits.' },
    { title: 'Cameroon Labor Law & IRPP Calculations', duration: '4 hours', progress: 100, completed: true, desc: 'In-depth review of social contributions, CNPS, communal taxes, and salary brackets.' },
    { title: 'Jefara Digital Workspace Security Management', duration: '8 hours', progress: 30, completed: false, desc: 'Advanced encryption standards, decentralized auth setups, and multi-factor security protocols.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Corporate Learning & Training</h3>
        <p className="text-xs text-zinc-500 font-medium">Standardize certification pipelines, employee handbooks, and regulatory audit courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <div
            key={idx}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold border ${
                  course.completed ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {course.completed ? 'Certified' : 'In Progress'}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{course.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{course.desc}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-zinc-400">PROGRESS</span>
                <span className="text-[#7c3aed]">{course.progress}%</span>
              </div>
              <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                <div className="bg-[#7c3aed] h-full transition-all duration-300" style={{ width: `${course.progress}%` }}></div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold">
                <Clock className="h-3 w-3" />
                <span>{course.duration} training</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
