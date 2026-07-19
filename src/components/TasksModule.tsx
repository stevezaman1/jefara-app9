import React, { useState } from 'react';
import { CheckSquare, Calendar, CreditCard, Clock, FileText, Check, X, AlertCircle, RefreshCw } from 'lucide-react';

export default function TasksModule() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [tasks, setTasks] = useState([
    {
      id: 'task_1',
      title: 'Approve Leave Request: Amadou Bello',
      category: 'Leave Request',
      description: 'Annual leave from 2026-08-01 to 2026-08-15 (14 days). Reason: Family wedding.',
      initiator: 'Amadou Bello',
      initiatorAvatar: 'AB',
      date: 'Requested today',
      icon: Calendar,
      iconColor: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'task_2',
      title: 'Review Expense Claim: Salary Advance #1042',
      category: 'Financial Service',
      description: 'Advance request of 150 000 FCFA for medical expenses. Auto-deductions enabled.',
      initiator: 'Marie Sissoko',
      initiatorAvatar: 'MS',
      date: 'Requested yesterday',
      icon: CreditCard,
      iconColor: 'bg-green-50 text-green-600',
    },
    {
      id: 'task_3',
      title: 'Sign Employment Agreement: Jean-Pierre Mvogo',
      category: 'Legal Document',
      description: 'Review and cryptographically sign contract for newly recruited Junior Dev node operator.',
      initiator: 'HR Onboarding Division',
      initiatorAvatar: 'HR',
      date: '2 days ago',
      icon: FileText,
      iconColor: 'bg-amber-50 text-amber-600',
    },
  ]);

  const [completedTasks, setCompletedTasks] = useState<typeof tasks>([]);

  const handleApprove = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setCompletedTasks(prev => [...prev, { ...task, date: 'Approved just now' }]);
  };

  const handleReject = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    setCompletedTasks(prev => [...prev, { ...task, date: 'Rejected just now' }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-black text-slate-900 text-lg">Task Queue & Approvals</h3>
          <p className="text-xs text-zinc-500 font-medium">Verify pending administrative workflow approvals in the current security node</p>
        </div>

        {/* Action tabs */}
        <div className="flex bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Pending Actions ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Audit Log ({completedTasks.length})
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => {
            const Icon = task.icon;
            return (
              <div
                key={task.id}
                className="bg-white border border-zinc-150 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${task.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">• {task.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-900">{task.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{task.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-5 w-5 rounded-full bg-[#7c3aed] text-white text-[9px] font-bold flex items-center justify-center">
                        {task.initiatorAvatar}
                      </div>
                      <span className="text-[11px] font-medium text-zinc-600">
                        Initiated by <strong className="text-zinc-800">{task.initiator}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleReject(task.id)}
                    className="p-2.5 rounded-xl border border-zinc-200 hover:bg-red-50 hover:text-red-600 text-zinc-500 transition-all cursor-pointer"
                    title="Reject Request"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(task.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <div className="text-center py-20 bg-white border border-zinc-100 rounded-3xl p-6 flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-zinc-900">All caught up!</h4>
              <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                No pending authorizations require your cryptographic validation in this workspace node. Excellent job!
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {completedTasks.map(task => {
            const Icon = task.icon;
            const isApproved = task.date.includes('Approved');
            return (
              <div
                key={task.id}
                className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-4 flex items-center justify-between opacity-80"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${task.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-zinc-800 line-clamp-1">{task.title}</h5>
                    <span className="text-[10px] font-mono text-zinc-400">{task.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isApproved
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                  }`}>
                    {isApproved ? 'Approved' : 'Rejected'}
                  </span>
                </div>
              </div>
            );
          })}

          {completedTasks.length === 0 && (
            <div className="text-center py-16 text-zinc-400 text-xs">
              No historical authorizations audited in this session yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
