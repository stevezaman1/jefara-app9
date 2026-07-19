import React, { useState } from 'react';
import { Bell, ShieldAlert, Users, CreditCard, Calendar, Info, Check, Trash2 } from 'lucide-react';

export default function NotificationsModule() {
  const [notifications, setNotifications] = useState([
    {
      id: 'n_1',
      title: 'Monthly Payslips Signed Cryptographically',
      body: 'All June 2026 digital payslips have been successfully dispatched. 24 active employees notified via SMS/Email.',
      type: 'success',
      category: 'Payroll',
      icon: CreditCard,
      iconColor: 'bg-green-50 text-green-600 border-green-100',
      time: '3 hours ago'
    },
    {
      id: 'n_2',
      title: 'Security Notice: Database Replication Safe',
      body: 'Automated database consistency checksum completed. Security rules are verified and Firestore records are synchronized.',
      type: 'info',
      category: 'Security',
      icon: ShieldAlert,
      iconColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      time: '1 day ago'
    },
    {
      id: 'n_3',
      title: 'Leave Balance Exceeded warning',
      body: 'Jean-Pierre Mvogo is requesting a leave extension that exceeds his remaining annual leave balance by 2.5 days.',
      type: 'warning',
      category: 'Workforce',
      icon: Calendar,
      iconColor: 'bg-amber-50 text-amber-600 border-amber-100',
      time: '2 days ago'
    },
    {
      id: 'n_4',
      title: 'New Applicant in Hiring Pipeline',
      body: 'A candidate has applied for the Senior Cloud Security Engineer opening in Douala headquarters.',
      type: 'info',
      category: 'Recruitment',
      icon: Users,
      iconColor: 'bg-pink-50 text-pink-600 border-pink-100',
      time: '3 days ago'
    }
  ]);

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-black text-slate-900 text-lg">Platform Alerts & Signals</h3>
          <p className="text-xs text-zinc-500 font-medium">Consolidated timeline of operational, security, and financial telemetry logs</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-zinc-600 font-semibold text-xs transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Dismiss All</span>
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map(n => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="bg-white border border-zinc-150 rounded-2xl p-5 flex gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all relative group"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${n.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="space-y-1 pr-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{n.category}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">• {n.time}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900">{n.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{n.body}</p>
                </div>

                <button
                  onClick={() => handleDelete(n.id)}
                  className="absolute right-4 top-4 p-1 rounded-lg text-zinc-300 hover:text-zinc-600 transition-all cursor-pointer md:opacity-0 group-hover:opacity-100"
                  title="Dismiss alert"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-zinc-100 rounded-3xl p-6 flex flex-col items-center justify-center space-y-3">
          <div className="h-12 w-12 bg-zinc-50 text-zinc-400 rounded-2xl flex items-center justify-center">
            <Bell className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-zinc-900">Peace and quiet</h4>
          <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
            All system logs are cleared, and there are currently no warnings or alerts registered in this node.
          </p>
        </div>
      )}
    </div>
  );
}
