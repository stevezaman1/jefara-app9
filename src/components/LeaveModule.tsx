import React, { useState } from 'react';
import { Company, Employee, LeaveRequest } from '../types';
import { 
  Plus, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, 
  RefreshCw, AlertCircle, FileText, Search, User, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { db, doc, setDoc, updateDoc } from '../firebase';
import { PageHelpButton } from './PageHelpButton';
import { motion, AnimatePresence } from 'motion/react';

interface LeaveProps {
  company: Company;
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function LeaveModule({ company, employees, leaveRequests, onRefresh, activeSubTab }: LeaveProps) {
  const [subTab, setSubTab] = useState<'requests' | 'new' | 'policies'>('requests');

  React.useEffect(() => {
    if (activeSubTab === 'leave-policies' || activeSubTab === 'leave-holidays') {
      setSubTab('policies');
    } else if (activeSubTab === 'leave-requests' || activeSubTab === 'leave-balances' || activeSubTab === 'leave-calendar') {
      setSubTab('requests');
    } else {
      setSubTab('requests');
    }
  }, [activeSubTab]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other'>('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Custom Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // Custom Leave Calendar display states
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // July 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(16);

  const activeEmployees = employees.filter(e => e.status === 'Active');

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !startDate || !endDate) return;

    setSaving(true);
    try {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (!emp) return;

      const requestId = 'leave_' + Math.random().toString(36).substring(2, 11);
      const newRequest: LeaveRequest = {
        id: requestId,
        companyId: company.id,
        employeeId: selectedEmployeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        leaveType,
        startDate,
        endDate,
        reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'leave_requests', requestId), newRequest);
      
      // Reset
      setSelectedEmployeeId('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setSubTab('requests');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleApproval = async (reqId: string, status: 'Approved' | 'Rejected') => {
    try {
      const docRef = doc(db, 'companies', company.id, 'leave_requests', reqId);
      await updateDoc(docRef, {
        status,
        approvedBy: "Workspace Owner"
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter requests
  const filteredRequests = leaveRequests.filter(req => {
    const matchesSearch = req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.reason && req.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' ? true : req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics of leaves
  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const totalDaysApproved = leaveRequests
    .filter(r => r.status === 'Approved')
    .reduce((sum, r) => {
      const diffTime = Math.abs(new Date(r.endDate).getTime() - new Date(r.startDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return sum + diffDays;
    }, 0);

  // Distribution chart parameters
  const leaveCategories = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other'] as const;
  const leaveCategoryCounts = leaveCategories.map(cat => {
    const count = leaveRequests.filter(r => r.leaveType === cat).length;
    return { name: cat, count };
  });
  const maxCategoryCount = Math.max(...leaveCategoryCounts.map(c => c.count), 1);

  // Calendar parameters
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const prevMonthPadding = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const calendarDays = [];
  for (let i = 0; i < prevMonthPadding; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Find overlapping leaves on calendar day
  const getAbsencesForDay = (dayNum: number) => {
    return leaveRequests.filter(req => {
      if (req.status !== 'Approved') return false;
      const start = new Date(req.startDate);
      const end = new Date(req.endDate);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const checkDate = new Date(year, month, dayNum);
      return checkDate >= start && checkDate <= end;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {subTab === 'requests' && (
        <div className="space-y-6">
          
          {/* LEAVE SUMMARY STATISTICS WITH MINICHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI Cards */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Demandes en Attente</span>
                <span className="text-2xl font-display font-extrabold text-[#7c3aed] block mt-1">{pendingCount} Dossiers</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Requérant validation RH</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Jours Consommés</span>
                <span className="text-2xl font-display font-extrabold text-zinc-900 block mt-1">{totalDaysApproved} Jours</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Validés pour l'exercice 2026</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-zinc-50 text-zinc-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            {/* Micro bar chart for categories distribution */}
            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Répartition des motifs de congé</span>
              <div className="grid grid-cols-6 gap-1 h-12 items-end pt-2">
                {leaveCategoryCounts.map((cat, idx) => {
                  const percent = (cat.count / maxCategoryCount) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group cursor-pointer relative">
                      {/* Tooltip on hover */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 bg-zinc-950 text-white rounded text-[8px] px-1 py-0.5 whitespace-nowrap transition-all z-20 font-bold font-mono">
                        {cat.name}: {cat.count}
                      </span>
                      <div 
                        className="bg-violet-500 rounded-t w-full group-hover:bg-violet-600 transition-colors"
                        style={{ height: `${percent > 0 ? percent : 10}%` }} 
                      />
                      <span className="text-[7px] text-zinc-400 mt-1 uppercase tracking-widest">{cat.name.substring(0, 2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT AREA: CUSTOM LEAVE CALENDAR (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-violet-600" />
                  <h4 className="font-display font-bold text-zinc-900 text-sm">Visualisation des Absences</h4>
                </div>
                {/* Month Toggles */}
                <div className="flex items-center gap-1 text-xs">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-1 border border-zinc-100 hover:bg-zinc-50 rounded-lg"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-bold text-zinc-800 text-center min-w-20">
                    {monthNames[currentDate.getMonth()]}
                  </span>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-1 border border-zinc-100 hover:bg-zinc-50 rounded-lg"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid week headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <div>Lu</div><div>Ma</div><div>Me</div><div>Je</div><div>Ve</div><div>Sa</div><div>Di</div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((dayNum, idx) => {
                  if (dayNum === null) {
                    return <div key={`empty-${idx}`} className="aspect-square bg-zinc-50/20 rounded-lg border border-zinc-100/10" />;
                  }

                  const activeAbsences = getAbsencesForDay(dayNum);
                  const isSelected = selectedDay === dayNum;

                  let customClass = "bg-zinc-50 hover:bg-zinc-100 text-zinc-800";
                  if (isSelected) {
                    customClass = "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/15";
                  } else if (activeAbsences.length > 0) {
                    customClass = "bg-amber-50 border-amber-200 text-amber-950 font-bold hover:bg-amber-100/70";
                  }

                  return (
                    <button
                      key={`day-${dayNum}`}
                      onClick={() => setSelectedDay(dayNum)}
                      className={`aspect-square border rounded-xl flex flex-col items-center justify-between p-1 cursor-pointer transition-all ${customClass}`}
                    >
                      <span className="text-[10px] font-semibold">{dayNum}</span>
                      {activeAbsences.length > 0 && !isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Day selection details */}
              <div className="pt-3 border-t border-zinc-50 text-xs">
                <span className="font-bold text-zinc-900 block mb-1">
                  Absences le {selectedDay ? `${selectedDay} ${monthNames[currentDate.getMonth()]}` : "Sélectionner un jour"} :
                </span>
                {selectedDay ? (
                  getAbsencesForDay(selectedDay).length === 0 ? (
                    <span className="text-zinc-400 text-[11px]">Aucun collaborateur en congé à cette date.</span>
                  ) : (
                    <div className="space-y-1.5 mt-2">
                      {getAbsencesForDay(selectedDay).map((abs, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-amber-50/50 border border-amber-100 rounded-lg text-amber-950 font-medium">
                          <span>{abs.employeeName}</span>
                          <span className="text-[9px] bg-amber-100 px-2 py-0.5 rounded-md font-bold">{abs.leaveType}</span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <span className="text-zinc-400 text-[11px]">Choisissez une cellule pour lister les départs.</span>
                )}
              </div>
            </div>

            {/* RIGHT AREA: DETAILED TABLE OF LEAVE REQUESTS (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Table search & filter actions toolbar */}
              <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                
                {/* Search query */}
                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-zinc-400" />
                  <input 
                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Chercher par nom, motif, type..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-700 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-all"
                  />
                </div>

                {/* Filter segments */}
                <div className="inline-flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-[10px] w-full sm:w-auto">
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(filterState => (
                    <button
                      key={filterState}
                      onClick={() => setStatusFilter(filterState)}
                      className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        statusFilter === filterState ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {filterState === 'All' ? 'Tous' : filterState === 'Pending' ? 'Attente' : filterState === 'Approved' ? 'Validé' : 'Refusé'}
                    </button>
                  ))}
                </div>
              </div>

              {/* TABLE CONTAINER */}
              {filteredRequests.length === 0 ? (
                <div className="text-center py-20 px-4 bg-white border border-zinc-150 rounded-[32px] flex flex-col items-center justify-center space-y-4 shadow-sm">
                  <div className="h-10 w-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-zinc-800 text-sm">No leave requests yet</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Your HR inbox is entirely clear.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <th className="py-3 px-4">Collaborateur</th>
                          <th className="py-3 px-4">Type de Congé</th>
                          <th className="py-3 px-4">Période / Dates</th>
                          <th className="py-3 px-4">Justificatif</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4 text-right">Décisions HR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-zinc-600 font-medium">
                        {filteredRequests.map((req) => {
                          const diffTime = Math.abs(new Date(req.endDate).getTime() - new Date(req.startDate).getTime());
                          const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                          return (
                            <tr key={req.id} className="hover:bg-zinc-50/40 transition-colors">
                              {/* Collaborator */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-[10px] text-zinc-800">
                                    {req.employeeName[0]}
                                  </div>
                                  <span className="font-semibold text-zinc-950 block">{req.employeeName}</span>
                                </div>
                              </td>

                              {/* Type */}
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  req.leaveType === 'Annual' ? 'bg-violet-50 text-violet-700 border border-violet-100' :
                                  req.leaveType === 'Sick' ? 'bg-red-50 text-red-700 border border-red-100' :
                                  req.leaveType === 'Maternity' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                  'bg-zinc-100 text-zinc-800'
                                }`}>
                                  {req.leaveType}
                                </span>
                              </td>

                              {/* Period / Days count */}
                              <td className="py-3.5 px-4 font-sans text-[11px]">
                                <div className="text-zinc-800 font-medium">
                                  {new Date(req.startDate).toLocaleDateString()} au {new Date(req.endDate).toLocaleDateString()}
                                </div>
                                <span className="text-[9px] text-zinc-400 block mt-0.5 font-bold uppercase tracking-wider">
                                  {totalDays} Jour{totalDays > 1 ? 's' : ''} consécutif{totalDays > 1 ? 's' : ''}
                                </span>
                              </td>

                              {/* Justification / Reason */}
                              <td className="py-3.5 px-4 max-w-40 truncate text-zinc-400 italic font-normal">
                                "{req.reason || 'Aucun motif mentionné'}"
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                  req.status === 'Approved' ? 'bg-violet-100 text-violet-800 border border-violet-200' :
                                  req.status === 'Rejected' ? 'bg-zinc-100 text-zinc-500 border border-zinc-200' :
                                  'bg-violet-50 text-violet-600 border border-violet-100'
                                }`}>
                                  {req.status === 'Pending' ? 'En Attente' : req.status === 'Approved' ? 'Validé' : 'Refusé'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                {req.status === 'Pending' ? (
                                  <div className="flex gap-1.5 justify-end">
                                    <button 
                                      onClick={() => handleApproval(req.id, 'Approved')}
                                      className="p-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors cursor-pointer"
                                      title="Approuver le congé"
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleApproval(req.id, 'Rejected')}
                                      className="p-1 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors cursor-pointer"
                                      title="Refuser"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-zinc-400 text-[10px]">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {subTab === 'new' && (
        <form onSubmit={handleCreateRequest} className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.015)] max-w-xl space-y-6">
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Soumettre une Demande d'Absence</h3>
            <p className="text-xs text-zinc-500 mt-1">Saisir les dates d'absences planifiées ou d'un congé d'urgence.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Collaborateur Concerne *</label>
              <select 
                required value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all appearance-none"
              >
                <option value="">-- Sélectionnez l'employé --</option>
                {activeEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display font-medium">Catégorie de Congé</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid', 'Other'] as const).map(type => (
                  <button 
                    key={type} type="button" onClick={() => setLeaveType(type)}
                    className={`py-2 rounded-xl font-semibold border text-center text-xs transition-all cursor-pointer ${leaveType === type ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'}`}
                  >
                    {type === 'Annual' ? 'Annuel' : type === 'Sick' ? 'Maladie' : type === 'Maternity' ? 'Maternité' : type === 'Paternity' ? 'Paternité' : type === 'Unpaid' ? 'Sans Solde' : 'Autre'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Date de Début *</label>
              <input 
                type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display font-medium">Date de Fin *</label>
              <input 
                type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Motif / Justification</label>
              <textarea 
                value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Ex : Repos annuel, certificat médical joint, impératif familial..."
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-zinc-100 text-xs">
            <button 
              type="button" onClick={() => setSubTab('requests')}
              className="px-4 py-2.5 border border-zinc-200 rounded-xl font-semibold hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-700"
            >
              Annuler
            </button>
            <button 
              type="submit" disabled={saving}
              className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? 'Création de la demande...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      )}

      {subTab === 'policies' && (
        <div className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-6">
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Politique d'Absences & Allocations Légales</h3>
            <p className="text-xs text-zinc-500 mt-1">Législation du travail en vigueur et calcul des droits d'absence (Conforme au Code du Travail Camerounais).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-600 font-medium">
            <div className="p-6 border border-zinc-100 rounded-[24px] bg-zinc-50/50 space-y-2.5">
              <h4 className="font-bold text-zinc-900 text-sm">Calcul du Congé Annuel Payé</h4>
              <p className="leading-relaxed text-[11px]">
                Conformément au Code du travail camerounais (Art. 89), le travailleur acquiert droit au congé payé à la charge de l'employeur, à raison de 1,5 jour ouvrable par mois de service effectif. Les mères de famille ont droit à 2 jours supplémentaires par enfant de moins de 6 ans.
              </p>
            </div>
            <div className="p-6 border border-zinc-100 rounded-[24px] bg-zinc-50/50 space-y-2.5">
              <h4 className="font-bold text-zinc-900 text-sm">Congés Maternité & Paternité</h4>
              <p className="leading-relaxed text-[11px]">
                Le congé de maternité est fixé à 14 semaines consécutives (commençant 4 semaines avant la date présumée de l'accouchement). Les pères bénéficient d'un droit de 10 jours de congés familiaux (prélevés sur la réserve globale de permissions exceptionnelles).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
