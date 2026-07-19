import React, { useState } from 'react';
import { UserMinus, CheckCircle, Circle, AlertCircle, RefreshCw } from 'lucide-react';

export default function OffboardingModule() {
  const [exitFiles, setExitFiles] = useState([
    {
      id: 'off_1',
      name: 'Salomon Ewane',
      role: 'Operations Analyst',
      exitDate: '2026-07-31',
      cleared: false,
      tasks: [
        { id: 'ot1', text: 'Conduct Exit Interview & feedback log', done: true },
        { id: 'ot2', text: 'Revoke corporate access tokens & email aliases', done: false },
        { id: 'ot3', text: 'Recover company equipment (Laptop, access badge)', done: false },
        { id: 'ot4', text: 'Verify double-entry final tax compliance', done: false },
        { id: 'ot5', text: 'Generate Certificat de Travail document', done: true },
      ]
    }
  ]);

  const toggleTask = (fileId: string, taskId: string) => {
    setExitFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const updatedTasks = f.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
        const cleared = updatedTasks.every(t => t.done);
        return { ...f, tasks: updatedTasks, cleared };
      }
      return f;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Offboarding Clearance Nodes</h3>
        <p className="text-xs text-zinc-500 font-medium">Verify structural exit procedures, final settlements, asset retrievals, and certificates of service</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exitFiles.map(file => (
          <div
            key={file.id}
            className="bg-white border border-zinc-150 rounded-3xl p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.01)] transition-all space-y-6"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-zinc-900 text-sm leading-snug">{file.name}</h4>
                <p className="text-[11px] text-zinc-500 font-medium">{file.role} • Exit Date: {file.exitDate}</p>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                file.cleared ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {file.cleared ? 'Cleared' : 'Pending Assets'}
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Clearance checklist</h5>
              {file.tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(file.id, task.id)}
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
