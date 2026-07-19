import React, { useState, useEffect } from 'react';
import { Timer, Play, Square, History, ShieldCheck, Check } from 'lucide-react';

export default function TimeTrackingModule() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [history, setHistory] = useState([
    { date: 'Yesterday, 17 Jul', duration: '8h 15m', status: 'Compliant' },
    { date: 'Thursday, 16 Jul', duration: '7h 45m', status: 'Compliant' },
    { date: 'Wednesday, 15 Jul', duration: '9h 00m', status: 'Overtime Authorized' },
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isClockedIn) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isClockedIn]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return [hrs, mins, secs].map(v => v < 10 ? '0' + v : v).join(':');
  };

  const handleClockToggle = () => {
    if (isClockedIn) {
      // Clock out
      const calculatedDuration = formatTime(seconds);
      setHistory(prev => [{ date: 'Today, 18 Jul', duration: calculatedDuration, status: 'Compliant' }, ...prev]);
    }
    setIsClockedIn(!isClockedIn);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-black text-slate-900 text-lg">Interactive Time Terminal</h3>
        <p className="text-xs text-zinc-500 font-medium">Log active work sessions, record project hours, and audit timesheet compliance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Clock Machine */}
        <div className="lg:col-span-5 bg-white border border-zinc-150 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7c3aed] bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
              {isClockedIn ? 'Active Work Session' : 'Offline / Clocked Out'}
            </span>
            <h4 className="font-mono text-4xl font-extrabold text-zinc-900 tracking-tight pt-3">
              {isClockedIn ? formatTime(seconds) : '00:00:00'}
            </h4>
            <p className="text-[11px] text-zinc-400 font-medium">Cameroon Local Time</p>
          </div>

          <button
            onClick={handleClockToggle}
            className={`w-full max-w-xs py-4 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
              isClockedIn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-zinc-950 hover:bg-zinc-900 text-white'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square className="h-4 w-4 fill-white" />
                <span>Clock Out (End Session)</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Clock In (Start Session)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60">
            <ShieldCheck className="h-4 w-4 text-[#7c3aed]" />
            <span>Cryptographically sealed GPS check-in logs active</span>
          </div>
        </div>

        {/* Historical Logs Panel */}
        <div className="lg:col-span-7 bg-white border border-zinc-150 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <History className="h-4 w-4 text-zinc-400" />
            <h4 className="font-display font-bold text-zinc-900 text-sm">Recent Shift Logs</h4>
          </div>

          <div className="space-y-3">
            {history.map((log, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-zinc-100 bg-zinc-50/50 flex items-center justify-between"
              >
                <div>
                  <h5 className="text-xs font-semibold text-zinc-800">{log.date}</h5>
                  <p className="text-[10px] font-mono text-[#7c3aed] font-bold mt-0.5">Duration: {log.duration}</p>
                </div>
                <span className="text-[9px] px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-bold border border-green-100">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
