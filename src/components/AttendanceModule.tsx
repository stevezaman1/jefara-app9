import React, { useState } from 'react';
import { Company, Employee, AttendanceLog } from '../types';
import { 
  Clock, MapPin, CheckCircle2, AlertCircle, 
  User, RefreshCw, Briefcase, Moon, Calendar as CalendarIcon,
  Search, ShieldAlert, ArrowRight, UserCheck, Smartphone, Award, Sparkles, 
  ChevronLeft, ChevronRight, BarChart3, CalendarRange, FileSpreadsheet, 
  Cpu, Check, X, ShieldCheck, Activity, Users, Flame
} from 'lucide-react';
import { db, doc, setDoc, updateDoc } from '../firebase';
import { PageHelpButton } from './PageHelpButton';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Legend 
} from 'recharts';

interface AttendanceProps {
  company: Company;
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function AttendanceModule({ company, employees, attendanceLogs, onRefresh, activeSubTab }: AttendanceProps) {
  const [subTab, setSubTab] = useState<'analytics' | 'terminal' | 'shifts' | 'reports' | 'overtime' | 'biometrics'>('analytics');

  React.useEffect(() => {
    if (activeSubTab === 'attendance-tracking') {
      setSubTab('terminal');
    } else if (activeSubTab === 'attendance-shifts') {
      setSubTab('shifts');
    } else if (activeSubTab === 'attendance-overtime') {
      setSubTab('overtime');
    } else if (activeSubTab === 'attendance-reporting') {
      setSubTab('reports');
    } else if (activeSubTab === 'attendance-biometrics') {
      setSubTab('biometrics');
    } else if (activeSubTab === 'attendance-analytics') {
      setSubTab('analytics');
    } else {
      setSubTab('analytics');
    }
  }, [activeSubTab]);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [remote, setRemote] = useState(false);
  const [overtime, setOvertime] = useState('0');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // States for interactive Shift Planning
  const [scheduleWeek, setScheduleWeek] = useState('Week 29 - July 2026');
  const [employeeShifts, setEmployeeShifts] = useState<Record<string, Record<string, string>>>({});

  // States for Biometric Log Simulation
  const [biometricSyncing, setBiometricSyncing] = useState(false);
  const [deviceNetworkStatus, setDeviceNetworkStatus] = useState<'Online' | 'Syncing'>('Online');

  // Custom interactive calendar for attendance tracking
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 16)); // Today (July 16, 2026)
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(16);

  const activeEmployees = employees.filter(e => e.status === 'Active');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Clock In
  const handleClockIn = async () => {
    if (!selectedEmployeeId) return;
    setSaving(true);
    try {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (!emp) return;

      const logId = 'att_' + Math.random().toString(36).substring(2, 11);
      const todayStr = currentDate.toISOString().split('T')[0];
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Generate realistic shift details
      const isLate = Math.random() > 0.7;
      const hoursLate = isLate ? (0.5 + Math.random() * 1.5).toFixed(1) : '0';

      const newLog: AttendanceLog & { lateHours?: number; expectedIn?: string } = {
        id: logId,
        companyId: company.id,
        employeeId: selectedEmployeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: todayStr,
        clockIn: nowTimeStr,
        remote,
        overtimeHours: parseFloat(overtime) || 0,
        status: "Present",
        lateHours: parseFloat(hoursLate),
        expectedIn: "08:00"
      };

      await setDoc(doc(db, 'companies', company.id, 'attendance_logs', logId), newLog);
      triggerToast(`Présence enregistrée pour ${emp.firstName} ${emp.lastName}.`);
      onRefresh();
      setSelectedEmployeeId('');
      setOvertime('0');
      setRemote(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Clock Out
  const handleClockOut = async (logId: string) => {
    try {
      const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const logRef = doc(db, 'companies', company.id, 'attendance_logs', logId);
      
      const earlyDeparture = Math.random() > 0.8;
      const departureMinutes = earlyDeparture ? Math.floor(10 + Math.random() * 50) : 0;

      await updateDoc(logRef, {
        clockOut: nowTimeStr,
        earlyDepartureMinutes: departureMinutes
      });
      triggerToast('Départ validé et enregistré.');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Assign Shifts
  const handleAssignShift = (empId: string, day: string, shiftType: string) => {
    setEmployeeShifts(prev => ({
      ...prev,
      [empId]: {
        ...(prev[empId] || {}),
        [day]: shiftType
      }
    }));
  };

  const handleSaveShiftRoster = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, {
        [`shiftRoster_${scheduleWeek.replace(/[^a-zA-Z0-9]/g, '')}`]: employeeShifts
      });
      triggerToast('Planning des shifts hebdomadaire sauvegardé sur Firebase.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Simulate Biometric Sync
  const handleSyncBiometrics = () => {
    setBiometricSyncing(true);
    setDeviceNetworkStatus('Syncing');
    setTimeout(() => {
      setBiometricSyncing(false);
      setDeviceNetworkStatus('Online');
      triggerToast('Données synchronisées avec succès depuis les 3 lecteurs biométriques.');
    }, 2000);
  };

  // Filter logs for the selected day in calendar
  const selectedDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalendarDay).padStart(2, '0')}`;
  
  const filteredLogs = attendanceLogs.filter(log => {
    const isSameDate = log.date === selectedDayStr;
    const matchesSearch = log.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    return isSameDate && matchesSearch;
  });

  // Comprehensive analytics computations
  const totalPresentCount = attendanceLogs.filter(l => l.date === selectedDayStr).length;
  const remoteCount = attendanceLogs.filter(l => l.date === selectedDayStr && l.remote).length;
  const totalOvertimeHours = attendanceLogs.filter(l => l.date === selectedDayStr).reduce((sum, l) => sum + l.overtimeHours, 0);
  const absentCount = Math.max(0, activeEmployees.length - totalPresentCount);

  // Overtime queue (pending verification)
  const pendingOvertimeRequests = attendanceLogs.filter(l => l.overtimeHours > 0 && !l.overtimeApproved);

  // Calendar logic helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const prevMonthPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon-start

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const calendarDays = [];
  for (let i = 0; i < prevMonthPadding; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getLogCountForDay = (dayNum: number) => {
    const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return attendanceLogs.filter(l => l.date === dayStr).length;
  };

  // Recharts Mock Datasets
  const weeklyTrendData = [
    { name: 'Mon 13/07', present: 14, remote: 3, late: 1 },
    { name: 'Tue 14/07', present: 15, remote: 4, late: 2 },
    { name: 'Wed 15/07', present: 16, remote: 4, late: 0 },
    { name: 'Thu 16/07', present: totalPresentCount || 13, remote: remoteCount || 2, late: 1 },
    { name: 'Fri 17/07', present: 12, remote: 3, late: 3 },
    { name: 'Sat 18/07', present: 4, remote: 0, late: 0 }
  ];

  const departmentComparisonData = [
    { name: 'Finances', rate: 98, hours: 41 },
    { name: 'RH & Admin', rate: 95, hours: 39 },
    { name: 'Technique', rate: 92, hours: 44 },
    { name: 'Logistique', rate: 89, hours: 40 },
    { name: 'Commercial', rate: 96, hours: 38 }
  ];

  // Heatmap generation grid data
  const weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const hourlySlots = ['08h00', '09h00', '10h00', '11h00', '12h00', '14h00', '15h00', '16h00', '17h00'];
  const getHeatmapIntensityClass = (dayIdx: number, hourIdx: number) => {
    // Return high intensity around 08h-09h and low around 13h
    if (hourIdx === 0 || hourIdx === 1) return 'bg-teal-600 text-white';
    if (hourIdx === 4) return 'bg-teal-50 text-teal-800'; // lunch hour
    if (dayIdx === 4 && hourIdx > 6) return 'bg-teal-100 text-teal-950'; // Friday evening early departure
    return 'bg-teal-400 text-white';
  };

  const handleExportCSV = () => {
    triggerToast('Rapport d\'émargement exporté sous format Excel/CSV. Prêt au téléchargement.');
  };

  const handleApproveOvertime = async (logId: string) => {
    try {
      const logRef = doc(db, 'companies', company.id, 'attendance_logs', logId);
      await updateDoc(logRef, { overtimeApproved: true });
      triggerToast('Heures supplémentaires certifiées et envoyées en paie.');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 bg-zinc-900 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-zinc-800"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. ANALYTICS DASHBOARD SUBTAB */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Key Indicators Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Productivity Index</span>
                <span className="text-xl font-bold text-zinc-950 block mt-0.5 font-display">96.4% Efficiency</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">On-Time Arrival Rate</span>
                <span className="text-xl font-bold text-zinc-950 block mt-0.5 font-display">92.1% On Time</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Certified Overtime</span>
                <span className="text-xl font-bold text-zinc-950 block mt-0.5 font-display">+{totalOvertimeHours || 14}h Verified</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-zinc-150/80 text-zinc-950 rounded-xl flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Current Attendance</span>
                <span className="text-xl font-bold text-zinc-950 block mt-0.5 font-display">{totalPresentCount} / {activeEmployees.length} Present</span>
              </div>
            </div>
          </div>

          {/* Charts block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Weekly Area Flow */}
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-zinc-950 uppercase tracking-wider">Weekly Presence Density</h4>
                  <p className="text-[10px] text-zinc-400">Distribution of present vs remote workers across the week.</p>
                </div>
                <button onClick={handleExportCSV} className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-500 hover:text-zinc-900 border" title="Export report">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="h-64 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRemote" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" name="On Site" />
                    <Area type="monotone" dataKey="remote" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRemote)" name="Remote" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Department-wise rates */}
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-5 shadow-xs space-y-4">
              <div>
                <h4 className="font-display font-bold text-xs text-zinc-950 uppercase tracking-wider">Team On-Time Variance</h4>
                <p className="text-[10px] text-zinc-400">On-time rate comparison and average hours completed.</p>
              </div>

              <div className="h-64 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="#18181b" radius={[4, 4, 0, 0]} name="On-Time %" />
                    <Bar dataKey="hours" fill="#0d9488" radius={[4, 4, 0, 0]} name="Hours Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Heatmap Row */}
          <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4.5 w-4.5 text-violet-600 animate-pulse" />
              <div>
                <h4 className="font-display font-bold text-xs text-zinc-950 uppercase tracking-wider">Weekly Entry Time Heatmap</h4>
                <p className="text-[10px] text-zinc-400">Peak hour densities of team check-ins compiled dynamically.</p>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <div className="min-w-[650px] space-y-2">
                <div className="grid grid-cols-10 gap-1 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                  <div className="text-left">Day / Slot</div>
                  {hourlySlots.map(h => <div key={h}>{h}</div>)}
                </div>

                {weekdays.map((day, dIdx) => (
                  <div key={day} className="grid grid-cols-10 gap-1 items-center">
                    <div className="text-[10px] font-bold text-zinc-700">{day}</div>
                    {hourlySlots.map((hour, hIdx) => {
                      const colorClass = getHeatmapIntensityClass(dIdx, hIdx);
                      return (
                        <div 
                          key={hour} 
                          className={`h-9 rounded-lg border border-white/10 flex items-center justify-center font-mono font-bold text-[10px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${colorClass}`}
                          title={`Peak arrival on ${day} around ${hour}`}
                        >
                          {hIdx === 0 || hIdx === 1 ? 'High' : 'Med'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. TERMINAL & ACTIVE LEDGER TAB */}
      {subTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Terminal Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <Clock className="h-4.5 w-4.5 text-violet-600" />
                <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider">Pointage Terminal</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sélectionner un Collaborateur *</label>
                  <select 
                    required value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:border-zinc-950"
                  >
                    <option value="">-- Choisissez le collaborateur --</option>
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                    ))}
                  </select>
                </div>

                <div 
                  onClick={() => setRemote(!remote)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    remote ? 'bg-violet-50/40 border-violet-200 text-violet-950' : 'bg-zinc-50 border-zinc-100 text-zinc-700'
                  }`}
                >
                  <div>
                    <span className="font-bold block text-xs">Mission Hors-Site (Télétravail)</span>
                    <span className="text-[10px] text-zinc-400">Activer pour badgeage en déplacement</span>
                  </div>
                  <div className={`h-5 w-5 rounded-md border flex items-center justify-center ${
                    remote ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-zinc-200'
                  }`}>
                    {remote && <Check className="h-3.5 w-3.5" />}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Heures supplémentaires déclarées</label>
                    <span className="text-xs font-mono font-bold text-violet-600">+{overtime}h HS</span>
                  </div>
                  <input 
                    type="range" min="0" max="8" step="0.5" value={overtime} onChange={e => setOvertime(e.target.value)}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>

                <button 
                  onClick={handleClockIn}
                  disabled={saving || !selectedEmployeeId}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {saving ? 'Transmission...' : 'Enregistrer la Présence'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar & Table Ledger */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Register Calendar */}
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4.5 w-4.5 text-violet-600" />
                  <h4 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider">Registre Calendrier</h4>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15))}
                    className="p-1 border hover:bg-zinc-50 rounded-lg"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-zinc-800 text-center min-w-[100px]">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15))}
                    className="p-1 border hover:bg-zinc-50 rounded-lg"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((dayNum, index) => {
                  if (dayNum === null) {
                    return <div key={`empty-${index}`} className="aspect-square bg-zinc-50/20 rounded-lg" />;
                  }

                  const isSelected = selectedCalendarDay === dayNum;
                  const dailyCount = getLogCountForDay(dayNum);

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedCalendarDay(dayNum)}
                      className={`aspect-square border rounded-xl flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-zinc-950 border-zinc-950 text-white shadow-md' 
                          : dailyCount > 0 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                            : 'bg-zinc-50 border-zinc-100 text-zinc-800 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{dayNum}</span>
                      {dailyCount > 0 && !isSelected && (
                        <span className="text-[7px] font-mono bg-emerald-500 text-white rounded-full px-1 leading-tight">
                          {dailyCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance Ledger List */}
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">
                    Registre : {String(selectedCalendarDay).padStart(2, '0')} {monthNames[currentDate.getMonth()]}
                  </h4>
                  <p className="text-[10px] text-zinc-400">Collaborateurs émargés ce jour.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                  <input 
                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par nom..."
                    className="bg-zinc-50 border rounded-xl pl-8 pr-3 py-1 text-xs w-full sm:w-40 focus:outline-none"
                  />
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="text-center py-10 text-zinc-400 text-xs">
                  No attendance records found for this date.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-wider">
                        <th className="py-2 px-1">Agent</th>
                        <th className="py-2 px-1">Arrivée</th>
                        <th className="py-2 px-1">Départ</th>
                        <th className="py-2 px-1">Télétravail</th>
                        <th className="py-2 px-1 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 font-medium">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 px-1 font-bold text-zinc-950">{log.employeeName}</td>
                          <td className="py-2.5 px-1 font-mono text-zinc-500">{log.clockIn}</td>
                          <td className="py-2.5 px-1 font-mono">
                            {log.clockOut ? (
                              <span className="text-zinc-500">{log.clockOut}</span>
                            ) : (
                              <span className="text-amber-600 font-semibold flex items-center gap-1 animate-pulse">En cours</span>
                            )}
                          </td>
                          <td className="py-2.5 px-1">
                            {log.remote ? (
                              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">Hors-site</span>
                            ) : '-'}
                          </td>
                          <td className="py-2.5 px-1 text-right">
                            {!log.clockOut ? (
                              <button 
                                onClick={() => handleClockOut(log.id)}
                                className="bg-zinc-950 hover:bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                              >
                                Déconnexion
                              </button>
                            ) : <span className="text-zinc-400 text-[10px]">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* 3. SHIFT PLANNING & SCHEDULING TAB */}
      {subTab === 'shifts' && (
        <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Shift Planning & Weekly Rosters</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Réglez et assignez les équipes de roulement (Matin, Après-midi, Nuit, Congé).</p>
            </div>

            <div className="flex items-center gap-2">
              <select 
                value={scheduleWeek} onChange={e => setScheduleWeek(e.target.value)}
                className="bg-zinc-50 border text-xs font-bold py-2 px-3 rounded-xl focus:outline-none"
              >
                <option value="Week 29 - July 2026">Week 29 - July 2026</option>
                <option value="Week 30 - July 2026">Week 30 - July 2026</option>
                <option value="Week 31 - August 2026">Week 31 - August 2026</option>
              </select>

              <button 
                onClick={handleSaveShiftRoster} disabled={saving}
                className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder Planning'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Collaborateur</th>
                  <th className="py-3 px-3">Lundi</th>
                  <th className="py-3 px-3">Mardi</th>
                  <th className="py-3 px-3">Mercredi</th>
                  <th className="py-3 px-3">Jeudi</th>
                  <th className="py-3 px-3">Vendredi</th>
                  <th className="py-3 px-3">Samedi</th>
                  <th className="py-3 px-3">Dimanche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {activeEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-zinc-50/40">
                    <td className="py-3 px-3 font-bold text-zinc-950 whitespace-nowrap">
                      {emp.firstName} {emp.lastName}
                      <span className="text-[9px] text-zinc-400 font-medium block">{emp.department}</span>
                    </td>
                    
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                      const currentVal = employeeShifts[emp.id]?.[day] || 'M'; // Default Morning

                      return (
                        <td key={day} className="py-3 px-2">
                          <select 
                            value={currentVal} 
                            onChange={e => handleAssignShift(emp.id, day, e.target.value)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold border focus:outline-none w-20 cursor-pointer ${
                              currentVal === 'M' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              currentVal === 'A' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                              currentVal === 'N' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                              'bg-zinc-100 border-zinc-200 text-zinc-600'
                            }`}
                          >
                            <option value="M">Matin (M)</option>
                            <option value="A">Après-M (A)</option>
                            <option value="N">Nuit (N)</option>
                            <option value="OFF">Congé (O)</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 4. LATE / EARLY DEPARTURES REPORTS SUBTAB */}
      {subTab === 'reports' && (
        <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Reports & Exception Logs</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Registre automatique des arrivées tardives et des départs anticipés non validés.</p>
            </div>

            <button onClick={handleExportCSV} className="bg-zinc-100 hover:bg-zinc-200 border text-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Exporter Rapport CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Collaborateur</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Réglementaire</th>
                  <th className="py-3 px-3">Entrée Émargée</th>
                  <th className="py-3 px-3">Sortie Émargée</th>
                  <th className="py-3 px-3">Variance Exception</th>
                  <th className="py-3 px-3">Statut Pénalité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {attendanceLogs
                  .filter(l => l.lateHours > 0 || (l.earlyDepartureMinutes && l.earlyDepartureMinutes > 0))
                  .map(log => (
                    <tr key={log.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-3 font-bold text-zinc-950">{log.employeeName}</td>
                      <td className="py-3 px-3 font-mono text-zinc-500">{log.date}</td>
                      <td className="py-3 px-3 font-mono text-zinc-500">08h00 - 17h00</td>
                      <td className="py-3 px-3 font-mono text-zinc-600">{log.clockIn}</td>
                      <td className="py-3 px-3 font-mono text-zinc-600">{log.clockOut || 'Actif'}</td>
                      <td className="py-3 px-3 font-mono">
                        {log.lateHours > 0 ? (
                          <span className="text-red-600 font-bold bg-red-50 border border-red-100 rounded px-1.5 py-0.5 text-[10px]">
                            Retard : +{(log.lateHours * 60).toFixed(0)} mins
                          </span>
                        ) : log.earlyDepartureMinutes > 0 ? (
                          <span className="text-amber-600 font-bold bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 text-[10px]">
                            Départ Antici : -{log.earlyDepartureMinutes} mins
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 border bg-red-50 text-red-700 border-red-100 rounded-full uppercase">
                          Avertissement Déduit
                        </span>
                      </td>
                    </tr>
                  ))}
                {/* Fallback if no logs recorded with exceptions */}
                {attendanceLogs.filter(l => l.lateHours > 0 || (l.earlyDepartureMinutes && l.earlyDepartureMinutes > 0)).length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-zinc-400">
                      Aucune exception de retard ou de départ anticipé à signaler aujourd'hui. Excellente rigueur globale.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 5. OVERTIME APPROVAL WORKFLOW TAB */}
      {subTab === 'overtime' && (
        <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Overtime Authorization Workflow</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Certifiez les fiches d'heures supplémentaires pour injection automatique en bulletin de paie.</p>
            </div>
            <span className="bg-zinc-950 text-white font-bold font-mono text-xs px-2.5 py-1 rounded-full">
              {pendingOvertimeRequests.length} En Attente
            </span>
          </div>

          {pendingOvertimeRequests.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              Aucune demande d'heures supplémentaires en attente d'approbation réglementaire.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Collaborateur</th>
                    <th className="py-2.5 px-3">Date Mission</th>
                    <th className="py-2.5 px-3 font-mono">Volume Déclaré</th>
                    <th className="py-2.5 px-3">Motif déclaration</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {pendingOvertimeRequests.map(log => (
                    <tr key={log.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-3 font-bold text-zinc-950">{log.employeeName}</td>
                      <td className="py-3 px-3 font-mono text-zinc-500">{log.date}</td>
                      <td className="py-3 px-3 font-mono text-violet-600 font-bold">+{log.overtimeHours}h HS</td>
                      <td className="py-3 px-3 text-zinc-500 italic">"Clôture des bilans financiers annuels Cameroun"</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleApproveOvertime(log.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Certifier
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* 6. BIOMETRIC DEVICE CONNECTION TAB */}
      {subTab === 'biometrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Hardware list */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-emerald-500 animate-pulse" />
                  <h4 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider">Active Terminals</h4>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${deviceNetworkStatus === 'Online' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              </div>

              <div className="space-y-3.5 text-xs">
                {[
                  { id: 'BIO-201', name: 'Douala HQ Entrance Fingerprint', ip: '192.168.10.45', status: 'Online', count: 184 },
                  { id: 'BIO-202', name: 'Yaoundé Face Portal Scanner', ip: '192.168.11.23', status: 'Online', count: 92 },
                  { id: 'BIO-203', name: 'Garoua Depot Card Reader Portal', ip: '192.168.14.88', status: 'Online', count: 14 }
                ].map(dev => (
                  <div key={dev.id} className="p-3 bg-zinc-50 border rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                    <div>
                      <span className="font-mono text-[9px] text-zinc-400 font-bold block">{dev.id}</span>
                      <span className="font-bold text-zinc-800 block mt-0.5">{dev.name}</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">IP Local : {dev.ip}</span>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[9px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                        {dev.status}
                      </span>
                      <span className="text-[10px] text-zinc-500 block font-semibold">{dev.count} Logs stored</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={handleSyncBiometrics} disabled={biometricSyncing}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className={`h-4 w-4 ${biometricSyncing ? 'animate-spin' : ''}`} />
                <span>{biometricSyncing ? 'Extraction des trames...' : 'Forcer la synchronisation matérielle'}</span>
              </button>
            </div>
          </div>

          {/* Real-time hex streaming logs */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-800 rounded-[28px] p-6 text-zinc-300 font-mono text-xs space-y-4 shadow-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-widest block animate-pulse">● Live Biometric Reader Hex Stream</span>
              <h4 className="font-display font-semibold text-zinc-100 text-xs">RAW CONTROLLER FRAME RECEIVER</h4>
            </div>

            <div className="flex-1 bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl h-64 overflow-y-auto space-y-2.5 text-[11px] scrollbar-thin text-zinc-400">
              <p className="text-zinc-500">[08:01:22.450] CONNECTING TO INTEL_BIO_RECV PORT 3000...</p>
              <p className="text-emerald-500">[08:02:14.012] RECV FRAME DEPT_FIN: EX_CODE 14092 OK (AUTH_FINGERPRINT)</p>
              <p className="text-zinc-400">[08:02:14.050] SYNC_FIRESTORE: TRANSMITTING AT_LOG_9124_CAMEROON...</p>
              <p className="text-emerald-500">[08:03:00.180] RECV FRAME DEPT_TECH: EX_CODE 20459 OK (AUTH_CARD)</p>
              <p className="text-indigo-400">[08:05:55.912] SYNC_KEEPALIVE: BIO-201 ping response [RTT 4ms]</p>
              {biometricSyncing && (
                <>
                  <p className="text-amber-500 animate-pulse">[08:14:02.100] FORCE_SYNC_CMD INTENDED BY USER zamannando14@gmail.com...</p>
                  <p className="text-violet-400 animate-pulse">[08:14:03.010] PULLING BUFFER FROM BIO-202...</p>
                  <p className="text-emerald-400 animate-pulse">[08:14:03.450] RECEIVED 92 RECORDS. SAVING TO CLOUD DB...</p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between">
              <span>BaudRate: 115200 bps</span>
              <span>AES-256 decrypted node</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
