import React, { useState } from 'react';
import { Mail, Inbox, AlertCircle, Sparkles, Send, Trash2, Search, Check, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function InboxModule() {
  const [activeFolder, setActiveFolder] = useState<'all' | 'direct' | 'announcements' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string>('msg_1');

  const folders = [
    { id: 'all', label: 'All Messages', icon: Inbox, count: 3 },
    { id: 'direct', label: 'Direct Messages', icon: Mail, count: 1 },
    { id: 'announcements', label: 'Announcements', icon: Sparkles, count: 2 },
    { id: 'archived', label: 'Archived', icon: Trash2, count: 0 },
  ] as const;

  const [messages, setMessages] = useState([
    {
      id: 'msg_1',
      sender: 'Cameroon Tax Office (Minsanté)',
      senderAvatar: 'MT',
      senderTitle: 'Regulatory Compliance Officer',
      subject: 'Updated IRPP Calculations & Health Insurance Contribution Margins',
      preview: 'The national health development contribution rates have been updated for Q3 2026. Please ensure salary calculations...',
      date: 'Today, 14:32',
      type: 'announcements',
      read: false,
      priority: 'high',
      content: `Dear Jefara Tenant Administrator,

Please note that the Ministry of Public Health (Minsanté) alongside the Cameroon Tax Office (Direction Générale des Impôts) has introduced a slight update regarding the Health Insurance Contribution brackets for the private sector in Cameroon.

Starting from the next payroll run:
- The contribution limit is raised to 125,000 FCFA for gross wages.
- Employers must re-verify that tax-exempt bonuses do not exceed 10% of base pay.

Jefara's built-in Cameroon Tax Engine has auto-updated its rule registry. No manual scripting is required on your part. Please double-check your Q3 payroll logs in the Simulator before running final transfers.

Regards,
Minsanté Compliance Integration Team
Douala, Cameroon`
    },
    {
      id: 'msg_2',
      sender: 'Amadou Bello',
      senderAvatar: 'AB',
      senderTitle: 'HR Director',
      subject: 'Review request for Q3 Employee Performance Scores',
      preview: 'I have finalized the review drafts for our engineering and sales teams. Let me know if you approve the basic salary increments...',
      date: 'Yesterday, 10:15',
      type: 'direct',
      read: true,
      priority: 'normal',
      content: `Hello,

I have completed the performance reviews and updated the skill records for the Engineering and Operations squads. Under the Jefara premium guidelines, we have 4 high-tier promotions eligible for a grade increment.

Please check the "Performance Scorecard" module when you get a chance and approve the draft letters so we can link them to the next monthly payroll run.

Thanks,
Amadou`
    },
    {
      id: 'msg_3',
      sender: 'Jefara System Admin',
      senderAvatar: 'JS',
      senderTitle: 'Platform Security Daemon',
      subject: 'Security Alert: New Admin Session Authenticated',
      preview: 'A new administrative session was successfully authenticated from IP 192.168.1.105 (Yaoundé, Cameroon) using...',
      date: '16 Jul, 08:24',
      type: 'announcements',
      read: true,
      priority: 'high',
      content: `SYSTEM AUDIT LOG REPORT - SECURITY INTEGRITY CHECK
---------------------------------------------------
Event: SEC_AUTH_ADMIN_PASS
Workspace: Cameroon Jefara #4
User: Admin (ulimoinc@gmail.com)
Location: Yaoundé, Cameroon
IP: 192.168.1.105
Fingerprint: Chrome 142.0.x / macOS Intel

This is an automated security advisory. If this session was authorized by your network security engineer, no action is required. Otherwise, please immediately activate multi-factor lockout in the System Security preferences.`
    }
  ]);

  const filteredMessages = messages.filter(msg => {
    const matchesFolder = activeFolder === 'all' || msg.type === activeFolder;
    const matchesSearch = msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          msg.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const activeMsg = messages.find(m => m.id === selectedMessageId) || messages[0];

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      {/* Inbox Navigation */}
      <div className="xl:col-span-3 bg-white border border-zinc-150 rounded-3xl p-4 flex flex-col space-y-4">
        <div className="px-2">
          <h3 className="font-display font-black text-slate-900 text-lg">Communications</h3>
          <p className="text-[11px] text-zinc-500 font-medium">Internal mail & notifications</p>
        </div>

        {/* Folders List */}
        <div className="space-y-1">
          {folders.map(folder => {
            const Icon = folder.icon;
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'text-[#7c3aed] bg-violet-50/50' 
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#7c3aed]' : 'text-zinc-400'}`} />
                  <span>{folder.label}</span>
                </div>
                {folder.count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#7c3aed] text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Message List Column */}
      <div className="xl:col-span-4 bg-white border border-zinc-150 rounded-3xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search correspondence..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-150 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-[#7c3aed] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              onClick={() => {
                setSelectedMessageId(msg.id);
                handleMarkAsRead(msg.id);
              }}
              className={`p-4 rounded-2xl cursor-pointer transition-all border text-left ${
                selectedMessageId === msg.id
                  ? 'bg-violet-50/40 border-violet-150 shadow-[0_4px_12px_rgba(124,58,237,0.02)]'
                  : 'bg-white border-transparent hover:bg-zinc-50'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`text-xs font-semibold ${msg.read ? 'text-zinc-700' : 'text-zinc-900 font-bold'}`}>
                  {msg.sender}
                </span>
                <span className="text-[10px] text-zinc-400 shrink-0">{msg.date}</span>
              </div>
              <h4 className={`text-xs mt-1 truncate ${msg.read ? 'text-zinc-600' : 'text-zinc-900 font-bold'}`}>
                {msg.subject}
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                {msg.preview}
              </p>
              <div className="flex gap-2 mt-2">
                {msg.priority === 'high' && (
                  <span className="text-[9px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full font-bold border border-red-100">
                    Priority Alert
                  </span>
                )}
                {!msg.read && (
                  <span className="text-[9px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full font-bold border border-violet-100">
                    Unread
                  </span>
                )}
              </div>
            </div>
          ))}
          {filteredMessages.length === 0 && (
            <div className="text-center py-12 text-zinc-400 text-xs">No correspondence found.</div>
          )}
        </div>
      </div>

      {/* Message Detailed View */}
      <div className="xl:col-span-5 bg-white border border-zinc-150 rounded-3xl p-6 flex flex-col h-full overflow-hidden">
        {activeMsg ? (
          <div className="flex flex-col h-full space-y-6">
            <div className="border-b border-zinc-100 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-sm">
                    {activeMsg.senderAvatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm">{activeMsg.sender}</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">{activeMsg.senderTitle}</p>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">{activeMsg.date}</span>
              </div>

              <div>
                <h2 className="font-display font-bold text-zinc-900 text-base leading-snug">
                  {activeMsg.subject}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed font-sans">
              {activeMsg.content}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-3">
              <button className="px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-xl transition-all border border-zinc-200">
                Reply
              </button>
              <button className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-semibold rounded-xl transition-all shadow-sm">
                Mark Handled
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 text-xs">
            <Mail className="h-8 w-8 text-zinc-300 mb-2" />
            <span>Select a correspondence to view details.</span>
          </div>
        )}
      </div>
    </div>
  );
}
