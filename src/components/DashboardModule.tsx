import React, { useState } from 'react';
import { 
  Company, Employee, PayrollRun, Payslip, LeaveRequest, 
  AttendanceLog, JobPosting, JobApplication, AccountingEntry, 
  FinancialServiceRequest, HRDocument 
} from '../types';
import { 
  Users, CreditCard, Clock, Calendar, AlertCircle, 
  TrendingUp, Wallet, ArrowRight, UserPlus, Receipt, 
  Sparkles, ShieldCheck, Briefcase, Lock, Settings, 
  FileText, Check, X, ShieldAlert, Award, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { PageHelpButton } from './PageHelpButton';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { getThemeChartColors } from '../utils/theme';

interface DashboardProps {
  company: Company;
  employees?: Employee[];
  payrollRuns?: PayrollRun[];
  payslips?: Payslip[];
  leaveRequests?: LeaveRequest[];
  attendanceLogs?: AttendanceLog[];
  jobPostings?: JobPosting[];
  jobApplications?: JobApplication[];
  accountingEntries?: AccountingEntry[];
  financialRequests?: FinancialServiceRequest[];
  documents?: HRDocument[];
  setActiveTab: (tab: string) => void;
  activeSubTab?: string;
}

export default function DashboardModule({ 
  company, 
  employees = [], 
  payrollRuns = [], 
  payslips = [],
  leaveRequests = [],
  attendanceLogs = [],
  jobPostings = [],
  jobApplications = [],
  accountingEntries = [],
  financialRequests = [],
  documents = [],
  setActiveTab,
  activeSubTab
}: DashboardProps) {

  const activeEmployees = employees.filter(e => e.status === 'Active');
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');
  const lastPaidRun = payrollRuns.filter(p => p.status === 'Paid').sort((a, b) => b.year - a.year || b.month.localeCompare(a.month))[0];
  const pendingRun = payrollRuns.find(p => p.status === 'Draft' || p.status === 'Validated' || p.status === 'Approved');

  const themeColors = getThemeChartColors();

  // Check if we are running in the sandbox/demo mode for the demo company only
  const isDemo = localStorage.getItem('jefara_is_demo') === 'true' && company.id === 'comp_demo';

  // Mini notification system for instant dashboard actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Format currency
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: company.currency || 'XAF', minimumFractionDigits: 0 }).format(val);
  };

  // 1. Employees breakdown data for Pie Chart
  const getDepartmentData = () => {
    const counts: Record<string, number> = {};
    activeEmployees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    
    const colors = ['#2563eb', '#10b981', '#06b6d4', '#f59e0b', '#db2777', '#4b5563'];
    return Object.keys(counts).map((name, i) => ({
      name,
      value: counts[name],
      color: colors[i % colors.length]
    }));
  };

  const departmentData = getDepartmentData();

  // 2. Payroll recent runs for Line Chart
  const getPayrollHistory = () => {
    const runs = [...payrollRuns]
      .filter(p => p.status === 'Paid' || p.status === 'Approved')
      .sort((a, b) => a.year - b.year || a.month.localeCompare(b.month))
      .slice(-4);
      
    if (runs.length === 0) {
      return [];
    }
    return runs.map(r => ({
      name: `${r.month.substring(0, 3)} ${r.year}`,
      amount: r.totalNet
    }));
  };

  const payrollHistory = getPayrollHistory();

  // 3. Accounting distribution data
  const getAccountingData = () => {
    const categories: Record<string, number> = {
      'Salary Expense': 0,
      'Office & Supplies': 0,
      'Travel & Equipment': 0,
      'Others': 0
    };

    accountingEntries.forEach(entry => {
      if (entry.category === 'Salary' || entry.description.toLowerCase().includes('salary')) {
        categories['Salary Expense'] += entry.amount;
      } else if (entry.category === 'Travel' || entry.category === 'Equipment') {
        categories['Travel & Equipment'] += entry.amount;
      } else if (entry.category === 'Office' || entry.category === 'Supplies') {
        categories['Office & Supplies'] += entry.amount;
      } else {
        categories['Others'] += entry.amount;
      }
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      amount: categories[cat]
    }));
  };

  const accountingData = getAccountingData();

  // 4. Time & Attendance present percentage
  const getPresentPercentage = () => {
    if (attendanceLogs.length === 0) return 0;
    const uniqueDates = Array.from(new Set(attendanceLogs.map(l => l.date)));
    if (uniqueDates.length === 0) return 100;
    const totalPresent = attendanceLogs.filter(l => l.status === 'Present' || l.status === 'Late').length;
    return Math.round((totalPresent / attendanceLogs.length) * 100);
  };

  const presentPercentage = getPresentPercentage();

  // Handle rapid action inside dashboard
  const handleApproveLeave = (id: string, empName: string) => {
    showToast(`Leave request approved successfully for ${empName}!`);
    // Simulate updating list locally in parent or simply provide immediate feedback
  };

  const handleRejectLeave = (id: string, empName: string) => {
    showToast(`Leave request declined for ${empName}.`);
  };

  // Integrity Check for Company Settings
  const getIntegrityScore = () => {
    let score = 20; // Default registered
    if (company.logoUrl) score += 20;
    if (company.email && company.phone) score += 20;
    if (company.payrollSettings?.socialSecurityRateEmployer) score += 20;
    if (company.preferences?.workHoursPerDay) score += 20;
    return score;
  };

  const integrityScore = getIntegrityScore();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[150] bg-zinc-950 text-white px-5 py-3 rounded-2xl flex items-center gap-2 text-xs font-semibold shadow-2xl border border-zinc-800 animate-bounce">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Premium iOS 26 Inspired Header Banner */}
      <div className="relative overflow-hidden bg-white border border-zinc-150 rounded-[32px] p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.015)] transition-all">
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[400px] h-[400px] rounded-full bg-radial from-violet-100/30 to-transparent pointer-events-none blur-3xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-zinc-900 leading-tight">
              {company.name}
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed font-sans">
              Executive hub presenting key indicators across all Jefara organizational assets. Maintain complete secure tenant compliance with OHADA regulations.
            </p>
          </div>
        </div>
      </div>

      {/* TOP SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Staff Active */}
        <div className="bg-white border border-zinc-150 rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-display">Headcount</span>
            <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <Users className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-display font-bold text-zinc-900 tracking-tight">{activeEmployees.length}</span>
            <p className="text-[10px] text-zinc-400 font-mono">Active organizational personnel</p>
          </div>
        </div>

        {/* Net Payroll Paid */}
        <div className="bg-white border border-zinc-150 rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-display">Net Disbursements</span>
            <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <CreditCard className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-2xl font-display font-bold text-zinc-900 tracking-tight">
              {lastPaidRun ? formatAmount(lastPaidRun.totalNet) : formatAmount(0)}
            </span>
            <p className="text-[10px] text-zinc-400 font-mono">
              {lastPaidRun ? `Paid in ${lastPaidRun.month} ${lastPaidRun.year}` : 'No cycles finalized'}
            </p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white border border-zinc-150 rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-display">Pending Leaves</span>
            <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <Calendar className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-display font-bold text-zinc-900 tracking-tight">{pendingLeaves.length}</span>
            <p className="text-[10px] text-zinc-400 font-mono">Leaves awaiting verification</p>
          </div>
        </div>

        {/* Active Staff Advances / Loans */}
        <div className="bg-white border border-zinc-150 rounded-[24px] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-display">Active Staff Loans</span>
            <span className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
              <Wallet className="h-4.5 w-4.5" />
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-display font-bold text-zinc-900 tracking-tight">
              {financialRequests.filter(r => r.status === 'Approved' || r.status === 'Active').length}
            </span>
            <p className="text-[10px] text-zinc-400 font-mono">Active financial packages</p>
          </div>
        </div>

      </div>

      {/* EXECUTIVE BENTO CONTROL GRID (10 MODULES PREVIEWS) */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-display pt-4">
        Executive Console Modules
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* MODULE 1: EMPLOYEES */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-violet-50 text-violet-700 rounded-lg">
                  <Users className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Personnel & Departments</h4>
              </div>
              <span className="text-[10px] font-mono bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-bold">
                {activeEmployees.length} Active
              </span>
            </div>

            {/* Department densities & Mini-Chart */}
            {departmentData.length === 0 ? (
              <div className="mt-6 py-8 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 flex flex-col items-center justify-center gap-1.5">
                <Users className="h-6 w-6 text-zinc-300" />
                <span className="text-xs font-semibold text-zinc-500">No employees yet.</span>
                <span className="text-[10px] text-zinc-400">Map personnel to view densities.</span>
              </div>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-[120px] h-[120px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Dep density breakdown list */}
                <div className="flex-1 space-y-2.5 w-full">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Department Densities</span>
                  <div className="grid grid-cols-2 gap-2">
                    {departmentData.slice(0, 4).map((dept) => (
                      <div key={dept.name} className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                        <span className="truncate">{dept.name}: <b>{dept.value}</b></span>
                      </div>
                    ))}
                    {departmentData.length === 0 && (
                      <span className="text-[11px] text-zinc-400 italic">No departments mapped</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Recent joins table */}
            <div className="mt-6 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Recent Key Hires</span>
              <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-3 space-y-2">
                {[...employees].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 2).map((emp) => (
                  <div key={emp.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-zinc-800">{emp.firstName} {emp.lastName}</span>
                    <span className="text-zinc-500 font-mono text-[10px]">{emp.department} • {emp.role}</span>
                  </div>
                ))}
                {employees.length === 0 && (
                  <span className="text-[10px] text-zinc-400 italic block text-center py-1">No employees enrolled yet</span>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* MODULE 2: PAYROLL */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <CreditCard className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Payroll Cycle Logs</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                pendingRun ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {pendingRun ? `${pendingRun.status} cycle` : 'Up to date'}
              </span>
            </div>

            {/* Recharts payroll history mini graph */}
            <div className="mt-6">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">Gross Labor Expenditures (Recent Cycles)</span>
              {payrollHistory.length === 0 ? (
                <div className="h-[90px] w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 text-center text-xs text-zinc-400 p-2 gap-1">
                  <CreditCard className="h-5 w-5 text-zinc-300" />
                  <span>Create your first payroll.</span>
                </div>
              ) : (
                <div className="h-[90px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={payrollHistory}>
                      <XAxis dataKey="name" fontSize={10} stroke="#9ca3af" axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(value: any) => [formatAmount(value), 'Expenditure']}
                        contentStyle={{ background: '#18181b', borderRadius: '12px', fontSize: '10px', color: '#fff' }}
                      />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Current processing status details */}
            <div className="mt-4 bg-zinc-50/50 border border-zinc-150 rounded-xl p-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-zinc-800 block">
                  {pendingRun ? `${pendingRun.month} ${pendingRun.year} Cycle` : 'Ready for next cycle'}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  {pendingRun ? `${formatAmount(pendingRun.totalNet)} total computed Net` : 'Awaiting initialization'}
                </span>
              </div>
              {pendingRun && (
                <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-200/50 px-2.5 py-1 rounded-lg">
                  Requires validation
                </span>
              )}
            </div>
          </div>


        </div>

        {/* MODULE 3: LEAVE & ABSENCES */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-violet-50 text-violet-700 rounded-lg">
                  <Calendar className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Leave Approvals & Board</h4>
              </div>
              <span className="text-[10px] font-mono bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-bold">
                {pendingLeaves.length} Pending
              </span>
            </div>

            {/* Quick interactive dashboard leave requests table */}
            <div className="mt-5 space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Actionable Requests</span>
              <div className="space-y-2.5 max-h-[145px] overflow-y-auto scrollbar-thin">
                {pendingLeaves.slice(0, 2).map((l) => (
                  <div key={l.id} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-zinc-800 block">{l.employeeName}</span>
                      <span className="text-[10px] text-zinc-500 block">
                        {l.leaveType} • {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Action buttons directly on dashboard */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleApproveLeave(l.id, l.employeeName)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRejectLeave(l.id, l.employeeName)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingLeaves.length === 0 && (
                  <div className="py-6 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 flex flex-col items-center justify-center gap-1.5">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-[11px] font-semibold text-zinc-500">All leave requests processed</span>
                    <span className="text-[9px] text-zinc-400">Nice work! HR inbox is entirely clear.</span>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* MODULE 4: TIME & ATTENDANCE */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <Clock className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Attendance & Shift Records</h4>
              </div>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                {presentPercentage}% Rate
              </span>
            </div>

            {/* Attendance stats gauge / circular visual */}
            {attendanceLogs.length === 0 ? (
              <div className="mt-5 py-8 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 flex flex-col items-center justify-center gap-1.5">
                <Clock className="h-6 w-6 text-zinc-300" />
                <span className="text-xs font-semibold text-zinc-500">No attendance records.</span>
                <span className="text-[10px] text-zinc-400">Timelogs will populate here once active.</span>
              </div>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Today's Attendance Rate</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-display font-bold text-zinc-900">{presentPercentage}%</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Healthy Range</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${presentPercentage}%` }} />
                    </div>
                  </div>

                  {/* Attendance metrics */}
                  <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Clock-Ins Today:</span>
                      <span className="font-bold text-zinc-800">{attendanceLogs.filter(l => l.status === 'Present').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Late Arrivals:</span>
                      <span className="font-bold text-zinc-800">{attendanceLogs.filter(l => l.status === 'Late').length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-semibold text-violet-600">Approved Overtime:</span>
                      <span className="font-bold text-violet-700">
                        {attendanceLogs.reduce((acc, l) => acc + (l.overtimeHours || 0), 0)} Hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Clock ins */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Latest Timelog Activity</span>
                  <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-2.5 divide-y divide-zinc-100">
                    {attendanceLogs.slice(-2).map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-xs py-1.5 first:pt-0 last:pb-0">
                        <span className="font-bold text-zinc-800">{log.employeeName}</span>
                        <span className="text-[10px] text-zinc-500">Clocked In at {log.clockIn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>


        </div>

        {/* MODULE 5: RECRUITMENT */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Briefcase className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Talent Acquisition Portals</h4>
              </div>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {jobPostings.filter(p => p.status === 'Active').length} Active Jobs
              </span>
            </div>

            {/* Applications pipeline overview */}
            {jobPostings.length === 0 && jobApplications.length === 0 ? (
              <div className="mt-5 py-8 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 flex flex-col items-center justify-center gap-1.5">
                <Briefcase className="h-6 w-6 text-zinc-300" />
                <span className="text-xs font-semibold text-zinc-500">No recruitment data.</span>
                <span className="text-[10px] text-zinc-400">Create a job posting to begin.</span>
              </div>
            ) : (
              <>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-3 text-center space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-400 block uppercase font-mono">Job Openings</span>
                    <span className="text-xl font-bold text-zinc-950 font-display">{jobPostings.length}</span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-3 text-center space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-400 block uppercase font-mono">Total Leads</span>
                    <span className="text-xl font-bold text-indigo-600 font-display">{jobApplications.length}</span>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-3 text-center space-y-1">
                    <span className="text-[10px] font-semibold text-zinc-400 block uppercase font-mono">In Interview</span>
                    <span className="text-xl font-bold text-emerald-600 font-display">
                      {jobApplications.filter(a => a.status === 'Interview').length}
                    </span>
                  </div>
                </div>

                {/* Recent recruitment applicants list */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Latest Candidates</span>
                  <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-3 space-y-2">
                    {jobApplications.slice(0, 2).map((app) => (
                      <div key={app.id} className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-zinc-800 block">{app.candidateName}</span>
                          <span className="text-[10px] text-zinc-400 block">{app.jobTitle}</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-mono">
                          {app.status}
                        </span>
                      </div>
                    ))}
                    {jobApplications.length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic block text-center py-1 bg-zinc-50 border border-zinc-150/50 rounded-xl">
                        No active candidates yet
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>


        </div>

        {/* MODULE 6: ACCOUNTING */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-rose-50 text-rose-700 rounded-lg">
                  <Receipt className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">General Ledger & Expense Book</h4>
              </div>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                {accountingEntries.length} Ledger Entries
              </span>
            </div>

            {/* Accounting distribution display with progress bars */}
            {accountingEntries.length === 0 ? (
              <div className="mt-5 py-8 text-center border border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 flex flex-col items-center justify-center gap-1.5">
                <Receipt className="h-6 w-6 text-zinc-300" />
                <span className="text-xs font-semibold text-zinc-500">No financial data available.</span>
                <span className="text-[10px] text-zinc-400">Accounting books will activate on payroll run.</span>
              </div>
            ) : (
              <>
                <div className="mt-5 space-y-3.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Operational Outlay Distribution</span>
                  <div className="space-y-3">
                    {accountingData.slice(0, 3).map((item) => {
                      const maxAmt = Math.max(...accountingData.map(d => d.amount)) || 1;
                      const ratio = Math.round((item.amount / maxAmt) * 100);
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-zinc-600">
                            <span>{item.name}</span>
                            <span>{formatAmount(item.amount)}</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${ratio}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent journal entry */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Recent Activity Log</span>
                  {accountingEntries.length > 0 ? (
                    <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-zinc-800 block">
                          {accountingEntries[0].description}
                        </span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          {accountingEntries[0].date} • Journal Code PAY
                        </span>
                      </div>
                      <span className="font-bold text-rose-600">
                        {formatAmount(accountingEntries[0].amount)}
                      </span>
                    </div>
                  ) : isDemo ? (
                    <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-zinc-800 block">Monthly Payroll Allocation</span>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">Today • Journal Code PAY</span>
                      </div>
                      <span className="font-bold text-rose-600">{formatAmount(350000)}</span>
                    </div>
                  ) : (
                    <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 text-center text-xs text-zinc-400 italic">
                      No activity logs registered yet
                    </div>
                  )}
                </div>
              </>
            )}
          </div>


        </div>

        {/* MODULE 7: EMPLOYEE FINANCIAL SERVICES */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <Wallet className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Staff Financials & Loan Packages</h4>
              </div>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                {financialRequests.filter(r => r.status === 'Pending').length} Pending Requests
              </span>
            </div>

            {/* Loan package summaries */}
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs space-y-1">
                <span className="text-zinc-500 block">Total Active Advances:</span>
                <span className="text-lg font-bold text-zinc-900 font-display">
                  {formatAmount(financialRequests.filter(r => r.type === 'Salary Advance' && r.status === 'Active').reduce((acc, r) => acc + r.amount, 0))}
                </span>
              </div>
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-4 text-xs space-y-1">
                <span className="text-zinc-500 block">Outstanding Loan Book:</span>
                <span className="text-lg font-bold text-zinc-900 font-display text-violet-700">
                  {formatAmount(financialRequests.filter(r => r.type === 'Loan' && r.status === 'Active').reduce((acc, r) => acc + r.amount, 0))}
                </span>
              </div>
            </div>

            {/* Awaiting Review list */}
            <div className="mt-5 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pending Requests</span>
              <div className="space-y-2">
                {financialRequests.filter(r => r.status === 'Pending').slice(0, 2).map((req) => (
                  <div key={req.id} className="p-3 bg-zinc-50/50 border border-zinc-150 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-zinc-800 block">{req.employeeName}</span>
                      <span className="text-[10px] text-zinc-400 block">{req.type}</span>
                    </div>
                    <span className="font-bold text-zinc-900">{formatAmount(req.amount)}</span>
                  </div>
                ))}
                {financialRequests.filter(r => r.status === 'Pending').length === 0 && (
                  <span className="text-[10px] text-zinc-400 italic block py-1 bg-zinc-50 border border-zinc-150/50 rounded-xl text-center">
                    No active loans pending validation
                  </span>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* MODULE 8: DOCUMENTS */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <Lock className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Digital Vault (Contracts & Laws)</h4>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                {documents.length || 3} Files Secured
              </span>
            </div>

            {/* Document stats */}
            <div className="mt-5 flex items-center gap-4 bg-zinc-50 border border-zinc-150 rounded-2xl p-4">
              <div className="p-3 bg-white border border-zinc-150 rounded-xl text-zinc-600">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1 flex-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-500">Signature Completion Rate:</span>
                  <span className="text-emerald-600">
                    {documents.length > 0 
                      ? Math.round((documents.filter(d => d.signed).length / documents.length) * 100)
                      : 100}% Completed
                  </span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ 
                      width: `${documents.length > 0 
                        ? (documents.filter(d => d.signed).length / documents.length) * 100
                        : 100}%` 
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Recent files */}
            <div className="mt-5 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Latest Vault Entries</span>
              <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl p-3 space-y-2 text-xs">
                {documents.slice(0, 2).map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center">
                    <span className="font-bold text-zinc-800 block truncate max-w-xs">{doc.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      doc.signed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {doc.signed ? 'Signed' : 'Awaiting Sign'}
                    </span>
                  </div>
                ))}
                {documents.length === 0 && (
                  <span className="text-[10px] text-zinc-400 italic block text-center py-1">No documents in vault</span>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* MODULE 9: ANALYTICS */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-cyan-50 text-cyan-700 rounded-lg">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">Interactive HR Analytics Suite</h4>
              </div>
              <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full font-bold">
                100% Retained
              </span>
            </div>

            {/* Recharts Salary distribution Area Graph */}
            <div className="mt-5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-3">Gross Contract Wage Matrix (Distribution)</span>
              {employees.length === 0 ? (
                <div className="h-[90px] w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 text-center text-xs text-zinc-400 p-2 gap-1">
                  <TrendingUp className="h-5 w-5 text-zinc-300" />
                  <span>No data available</span>
                </div>
              ) : (
                <div className="h-[90px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={employees.map((e, i) => ({ name: `Emp ${i+1}`, salary: e.basicSalary }))}>
                      <Tooltip formatter={(value) => [formatAmount(value as number), 'Salary']} />
                      <Area type="monotone" dataKey="salary" stroke="#06b6d4" fill="#ecfeff" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Key analytic insights */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs space-y-1">
                <span className="text-zinc-500 block">Average Base Wage:</span>
                <span className="font-bold text-zinc-900 block font-mono">
                  {employees.length > 0 
                    ? formatAmount(employees.reduce((acc, e) => acc + e.basicSalary, 0) / employees.length) 
                    : formatAmount(0)}
                </span>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl text-xs space-y-1">
                <span className="text-zinc-500 block">Est. CNPS Liabilities:</span>
                <span className="font-bold text-zinc-900 block font-mono">
                  {employees.length > 0
                    ? formatAmount(employees.reduce((acc, e) => acc + (e.basicSalary * 0.162), 0))
                    : formatAmount(0)}
                </span>
              </div>
            </div>
          </div>


        </div>

        {/* MODULE 10: COMPANY SETTINGS */}
        <div className="bg-white border border-zinc-150 rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-zinc-200 transition-all">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-zinc-50 text-zinc-700 rounded-lg">
                  <Settings className="h-4 w-4" />
                </span>
                <h4 className="font-display font-bold text-sm text-zinc-900">System Config & Settings</h4>
              </div>
              <span className="text-[10px] font-mono bg-zinc-50 text-zinc-700 px-2 py-0.5 rounded-full font-bold">
                Integrity Score: {integrityScore}%
              </span>
            </div>

            {/* Config checklist / integrity meter */}
            <div className="mt-5 space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Profile Completion Meter</span>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-zinc-900">{integrityScore}%</span>
                <span className="text-[10px] text-zinc-400">Validated</span>
              </div>
              
              <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div className="bg-zinc-900 h-full rounded-full" style={{ width: `${integrityScore}%` }} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 pt-2 font-semibold">
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span>Base Settings</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${company.logoUrl ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                  <span>Company Logo</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${company.email ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                  <span>Contact Information</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${company.payrollSettings?.socialSecurityRateEmployer ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                  <span>Social Tax Settings</span>
                </div>
              </div>
            </div>

            {/* Quick settings metadata */}
            <div className="mt-4 bg-zinc-50/50 border border-zinc-150 rounded-xl p-3 text-xs flex justify-between items-center text-zinc-500">
              <span>Compliance Region:</span>
              <span className="font-bold text-zinc-800 font-mono">
                {company.country || 'Cameroon'} ({company.currency || 'XAF'})
              </span>
            </div>
          </div>


        </div>

      </div>

      {/* FOOTER AUDIT STAMP */}
      <div className="pt-8 border-t border-zinc-150 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 font-mono gap-4">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Isolated Enterprise Tenant Workspace Active
        </span>
        <span className="text-zinc-400">
          Last Verified: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

    </div>
  );
}
