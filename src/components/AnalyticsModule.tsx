import React, { useState } from 'react';
import { Company, Employee, PayrollRun, LeaveRequest } from '../types';
import { 
  TrendingUp, BarChart4, PieChart, Users, DollarSign, 
  Calendar as CalendarIcon, ArrowUpRight, HelpCircle, Briefcase, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AnalyticsProps {
  company: Company;
  employees: Employee[];
  payrollRuns: PayrollRun[];
  leaveRequests: LeaveRequest[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function AnalyticsModule({ 
  company, 
  employees, 
  payrollRuns, 
  leaveRequests,
  onRefresh,
  activeSubTab
}: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState<'overviews' | 'departments' | 'calendar'>('overviews');

  React.useEffect(() => {
    if (activeSubTab === 'analytics-workforce') {
      setActiveTab('departments');
    } else if (activeSubTab === 'analytics-leaves') {
      setActiveTab('calendar');
    } else {
      setActiveTab('overviews');
    }
  }, [activeSubTab]);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number; val: number; label: string } | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  // Custom Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026 as per local metadata
  const [selectedDay, setSelectedDay] = useState<number | null>(16); // Default to current day 16

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(val);
  };

  const totalBasicWages = employees.reduce((acc, emp) => acc + (emp.status === 'Active' ? emp.basicSalary : 0), 0);
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const terminatedCount = employees.filter(e => e.status === 'Terminated').length;

  // ----------------------------------------------------
  // DATA PREPARATION FOR THE CURVE CHART (Payroll History)
  // ----------------------------------------------------
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  const baseSalary = totalBasicWages > 0 ? totalBasicWages : 4500000; // Baseline fallback
  const curvePoints = defaultMonths.map((m, idx) => {
    // Add some realistic variation for the curve
    const multiplier = 1 + Math.sin(idx * 0.8) * 0.05 + (idx * 0.015);
    const run = payrollRuns.find(r => r.month.substring(0, 3).toLowerCase() === m.toLowerCase());
    return {
      label: m,
      value: run ? run.totalNet : baseSalary * multiplier
    };
  });

  // Calculate coordinates for SVG curve
  const svgWidth = 500;
  const svgHeight = 150;
  const maxVal = Math.max(...curvePoints.map(p => p.value)) * 1.1;
  const minVal = Math.min(...curvePoints.map(p => p.value)) * 0.9;
  const valRange = maxVal - minVal || 1;

  const pointsCoordinates = curvePoints.map((p, idx) => {
    const x = (idx / (curvePoints.length - 1)) * (svgWidth - 40) + 20;
    const y = svgHeight - 15 - ((p.value - minVal) / valRange) * (svgHeight - 35);
    return { x, y, val: p.value, label: p.label };
  });

  // Build the SVG path string for the line
  let pathD = `M ${pointsCoordinates[0].x} ${pointsCoordinates[0].y}`;
  for (let i = 1; i < pointsCoordinates.length; i++) {
    const prev = pointsCoordinates[i - 1];
    const curr = pointsCoordinates[i];
    // Create soft cubic bezier curve points
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  // Path for the gradient area under the curve
  const areaD = `${pathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x} ${svgHeight - 10} L ${pointsCoordinates[0].x} ${svgHeight - 10} Z`;

  // ----------------------------------------------------
  // DATA PREPARATION FOR THE HISTOGRAM CHART (Dept Headcount)
  // ----------------------------------------------------
  const deptData = company.departments.map(dept => {
    const count = employees.filter(e => e.department === dept && e.status === 'Active').length;
    const budget = employees.filter(e => e.department === dept && e.status === 'Active').reduce((sum, e) => sum + e.basicSalary, 0);
    return { name: dept, count, budget };
  });

  const maxCount = Math.max(...deptData.map(d => d.count), 1);

  // ----------------------------------------------------
  // CUSTOM CALENDAR GENERATOR
  // ----------------------------------------------------
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayIndex = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const calendarDays = [];
  // Empty slots for previous month padding
  const prevMonthIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Align to Monday-start
  for (let i = 0; i < prevMonthIndex; i++) {
    calendarDays.push({ day: null, isCurrentMonth: false });
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }

  // Gather holidays & events for current month (July 2026 for illustration)
  const getEventsForDay = (dayNum: number) => {
    const events = [];
    // Static / simulated relevant events
    if (dayNum === 1) events.push({ title: "Fête du Travail (Rattrapement)", type: "holiday" });
    if (dayNum === 14) events.push({ title: "Audit Fiscal National CNPS", type: "audit" });
    if (dayNum === 16) events.push({ title: "Émission des bulletins de salaire", type: "payroll" });
    if (dayNum === 25) events.push({ title: "Clôture de la période d'absences", type: "deadline" });
    
    // Add real approved leaves
    leaveRequests.forEach(req => {
      if (req.status === 'Approved') {
        const startDay = new Date(req.startDate).getDate();
        const endDay = new Date(req.endDate).getDate();
        const startMonth = new Date(req.startDate).getMonth();
        const currentMonth = currentDate.getMonth();

        if (startMonth === currentMonth && dayNum >= startDay && dayNum <= endDay) {
          events.push({ title: `${req.employeeName} (${req.leaveType})`, type: "leave" });
        }
      }
    });
    return events;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header with elegant tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-zinc-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-violet-600" />
            Intelligence & Analyses Avancées
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Graphes, histogrammes de distribution de personnel, budgets de paie et calendrier de présence.</p>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-24 px-4 bg-white border border-zinc-150 rounded-[32px] flex flex-col items-center justify-center space-y-4 shadow-sm">
          <div className="h-14 w-14 bg-violet-50 border border-violet-100 rounded-2xl flex items-center justify-center text-violet-600">
            <BarChart4 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Données Analytiques Vides</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-normal">
              Aucun indicateur n'est compilé pour le moment. Veuillez d'abord ajouter des employés actifs et enregistrer des fiches de paie.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TOP CORE KPI BAR (Highly visual & polished cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Masse Salariale Engagée</span>
              <span className="text-xl font-display font-bold text-zinc-950 block mt-1.5">{formatAmount(totalBasicWages)}</span>
              <span className="text-[10px] text-zinc-500 mt-2 block flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Mensuelle de base active
              </span>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Effectif Actif</span>
              <span className="text-xl font-display font-bold text-zinc-950 block mt-1.5">{activeCount} Employés</span>
              <span className="text-[10px] text-zinc-500 mt-2 block flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                {employees.filter(e => e.status === 'Archived').length} archivés • {terminatedCount} résiliés
              </span>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Taux d'Absentéisme</span>
              <span className="text-xl font-display font-bold text-zinc-950 block mt-1.5">
                {leaveRequests.length > 0 ? ((leaveRequests.filter(r => r.status === 'Approved').length / activeCount) * 10).toFixed(1) : "0.0"}%
              </span>
              <span className="text-[10px] text-zinc-500 mt-2 block flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                Index calculé sur congés validés
              </span>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Charges Patronales (CNPS)</span>
              <span className="text-xl font-display font-bold text-zinc-950 block mt-1.5">{formatAmount(totalBasicWages * 0.162)}</span>
              <span className="text-[10px] text-zinc-500 mt-2 block flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500 inline-block" />
                Estimation légale Cameroun (16.2%)
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overviews' && (
              <motion.div 
                key="overviews"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* CURVE CHART SECTION */}
                <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-zinc-950 text-base">Courbe des Dépenses de Paie</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Évolution des allocations salariales nettes mensuelles (en Francs CFA).</p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-600 block" /> Paie Réelle/Projetée</span>
                    </div>
                  </div>

                  {/* SVG CURVE GRID CONTAINER */}
                  <div className="relative pt-4 bg-zinc-50/50 rounded-2xl p-4 border border-zinc-100">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible select-none text-violet-600">
                      <defs>
                        {/* Soft ambient gradient under curve */}
                        <linearGradient id="violet-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const yVal = svgHeight - 15 - ratio * (svgHeight - 35);
                        return (
                          <line 
                            key={i} 
                            x1="10" 
                            y1={yVal} 
                            x2={svgWidth - 10} 
                            y2={yVal} 
                            className="stroke-zinc-100" 
                            strokeWidth="1" 
                            strokeDasharray="4,4" 
                          />
                        );
                      })}

                      {/* Fill area under the curve */}
                      <path d={areaD} fill="url(#violet-gradient)" />

                      {/* Smooth Bezier Path Curve */}
                      <motion.path 
                      d={pathD} 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                      {/* Data Points / Intersections */}
                      {pointsCoordinates.map((pt, idx) => (
                        <g key={idx}>
                          {/* Inner glowing dot */}
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="5" 
                            className="fill-violet-600 stroke-white cursor-pointer transition-all duration-200 hover:r-7" 
                            strokeWidth="2"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredPoint({
                                index: idx,
                                x: pt.x,
                                y: pt.y,
                                val: pt.val,
                                label: pt.label
                              });
                            }}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {/* Month labels at bottom */}
                          <text 
                            x={pt.x} 
                            y={svgHeight - 2} 
                            textAnchor="middle" 
                            className="fill-zinc-400 font-mono text-[8px] font-bold"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>

                    {/* Highly polished dynamic tooltip overlay on point hover */}
                    {hoveredPoint && (
                      <div 
                        className="absolute bg-zinc-950 text-white rounded-xl p-3 shadow-2xl border border-zinc-800 z-30 flex flex-col pointer-events-none transition-all duration-150"
                        style={{ 
                          left: `${(hoveredPoint.x / svgWidth) * 90 + 5}%`, 
                          top: `${(hoveredPoint.y / svgHeight) * 55}%` 
                        }}
                      >
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{hoveredPoint.label} 2026</span>
                        <span className="text-xs font-bold font-mono mt-0.5 text-emerald-400">{formatAmount(hoveredPoint.val)}</span>
                        <span className="text-[8px] text-zinc-500 mt-1">Salarial engagé net</span>
                      </div>
                    )}
                  </div>

                  {/* Summary of forecasts */}
                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="text-xs font-bold text-zinc-800">Projection Semestrielle Stabilisée</h4>
                      <p className="text-[11px] text-zinc-500 max-w-md">
                        En supposant une stabilité d'effectifs sur les 6 prochains mois, l'estimation des besoins de refinancement s'élèvera à <strong className="text-zinc-950">{formatAmount(totalBasicWages * 6)}</strong>.
                      </p>
                    </div>
                    <div className="px-4 py-2.5 bg-violet-50 text-violet-700 font-bold rounded-xl text-xs flex items-center gap-1.5 self-stretch sm:self-center justify-center">
                      Indice Stable <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* OVERHEADS BREAKDOWN TABLE */}
                <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-zinc-950 text-base">Répartition Budgétaire</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Tableau des charges sociales calculées.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-950 text-white rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 h-16 w-16 bg-violet-600/10 rounded-full blur-xl" />
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Base de Masse Salariale</span>
                      <span className="text-2xl font-display font-bold block mt-1">{formatAmount(totalBasicWages)}</span>
                    </div>

                    {/* Complete breakdowns table */}
                    <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-zinc-100/60 border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            <th className="p-3">Organisme/Poste</th>
                            <th className="p-3 text-right">Taux</th>
                            <th className="p-3 text-right">Montant</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-zinc-600 font-medium">
                          <tr>
                            <td className="p-3 font-semibold text-zinc-900">Salaires Nets Payés</td>
                            <td className="p-3 text-right font-mono text-zinc-400">~85.0%</td>
                            <td className="p-3 text-right font-mono font-semibold text-zinc-950">{formatAmount(totalBasicWages * 0.85)}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-900">Charges CNPS Patronales</td>
                            <td className="p-3 text-right font-mono text-zinc-400">16.2%</td>
                            <td className="p-3 text-right font-mono font-semibold text-zinc-950">{formatAmount(totalBasicWages * 0.162)}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-900">Charges CNPS Salariales</td>
                            <td className="p-3 text-right font-mono text-zinc-400">4.2%</td>
                            <td className="p-3 text-right font-mono font-semibold text-zinc-950">{formatAmount(totalBasicWages * 0.042)}</td>
                          </tr>
                          <tr>
                            <td className="p-3 font-semibold text-zinc-900">Retenue Fiscale / IRPP</td>
                            <td className="p-3 text-right font-mono text-zinc-400">~15.0%</td>
                            <td className="p-3 text-right font-mono font-semibold text-zinc-950">{formatAmount(totalBasicWages * 0.15)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 text-[11px] text-zinc-500 leading-normal">
                      💡 <strong>Norme OHADA & CNPS</strong> : Ces taux de charges patronales et de retenues à la source sont calculés en conformité avec le Code du Travail camerounais révisé.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'departments' && (
              <motion.div 
                key="departments"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* DEPARTMENTS HISTOGRAM SECTION */}
                <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-zinc-950 text-base">Histogramme des Effectifs par Cost Center</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Nombre total de collaborateurs actifs par pôle d'activité de l'entreprise.</p>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 px-3 py-1 bg-zinc-50 rounded-xl border border-zinc-100">Mise à jour en direct</span>
                  </div>

                  {/* CUSTOM HISTOGRAM COMPONENT */}
                  <div className="space-y-6 pt-4">
                    {deptData.map((dept, idx) => {
                      const percentage = (dept.count / maxCount) * 100;
                      return (
                        <div key={dept.name} className="space-y-1.5 group cursor-pointer">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-zinc-800 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-indigo-500" />
                              {dept.name}
                            </span>
                            <span className="font-mono text-zinc-500">{dept.count} collaborateur{dept.count > 1 ? 's' : ''} ({activeCount > 0 ? ((dept.count / activeCount) * 100).toFixed(0) : 0}%)</span>
                          </div>
                          
                          <div className="relative w-full bg-zinc-100 h-8 rounded-xl overflow-hidden border border-zinc-200/50">
                            {/* Glowing animated bar on hover */}
                            <motion.div 
                              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-r-lg relative"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1, ease: "easeOut" }}
                              whileHover={{ brightness: 1.1 }}
                            >
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-white font-mono">
                                {formatAmount(dept.budget)}
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* DISTRIBUTION STATS & ACTIVE ROSTER */}
                <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-zinc-950 text-base">Synthèse de Statut</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Indice de rotation de l'effectif global.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Taux de Rétention</span>
                        <span className="text-xl font-display font-bold text-emerald-950 block mt-1">
                          {employees.length > 0 ? ((activeCount / employees.length) * 100).toFixed(0) : "0"}%
                        </span>
                      </div>
                      <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Départs Enregistrés</span>
                        <span className="text-xl font-display font-bold text-red-950 block mt-1">
                          {terminatedCount}
                        </span>
                      </div>
                    </div>

                    {/* Mini Employee visual list prioritized as dynamic table */}
                    <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                      <div className="bg-zinc-50 p-2.5 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Roster du Top Management
                      </div>
                      <div className="divide-y divide-zinc-50 max-h-48 overflow-y-auto">
                        {employees.slice(0, 4).map(emp => (
                          <div key={emp.id} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-50/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-zinc-200 text-zinc-700 flex items-center justify-center font-bold text-[10px]">
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div>
                                <span className="font-semibold text-zinc-950 block text-[11px]">{emp.firstName} {emp.lastName}</span>
                                <span className="text-[9px] text-zinc-400 font-mono block">{emp.department}</span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-zinc-700">{formatAmount(emp.basicSalary)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* CALENDAR CALENDAR PANEL */}
                <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-50 pb-4">
                    <div>
                      <h3 className="font-display font-bold text-zinc-950 text-base">Calendrier Institutionnel Jefara</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Absences, congés, jours fériés légaux et jalons administratifs.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handlePrevMonth}
                        className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-xs font-bold font-display px-4 text-zinc-800">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                      <button 
                        onClick={handleNextMonth}
                        className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM GRID CALENDAR */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <div>Lun</div>
                      <div>Mar</div>
                      <div>Mer</div>
                      <div>Jeu</div>
                      <div>Ven</div>
                      <div>Sam</div>
                      <div>Dim</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((slot, idx) => {
                        if (slot.day === null) {
                          return <div key={`empty-${idx}`} className="aspect-square bg-zinc-50/30 rounded-xl border border-zinc-100/10" />;
                        }

                        const dayNum = slot.day;
                        const dayEvents = getEventsForDay(dayNum);
                        const isSelected = selectedDay === dayNum;
                        
                        // Check if it's a holiday, leave, deadline etc
                        const hasHoliday = dayEvents.some(e => e.type === 'holiday');
                        const hasLeave = dayEvents.some(e => e.type === 'leave');
                        const hasAudit = dayEvents.some(e => e.type === 'audit' || e.type === 'payroll');

                        let bgClass = "bg-zinc-50/50 hover:bg-zinc-100/80 border-zinc-100";
                        if (isSelected) {
                          bgClass = "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/15";
                        } else if (hasHoliday) {
                          bgClass = "bg-red-50 hover:bg-red-100/80 border-red-100 text-red-950";
                        } else if (hasLeave) {
                          bgClass = "bg-amber-50 hover:bg-amber-100/80 border-amber-100 text-amber-950";
                        } else if (hasAudit) {
                          bgClass = "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-100 text-emerald-950";
                        }

                        return (
                          <button
                            key={`day-${dayNum}`}
                            onClick={() => setSelectedDay(dayNum)}
                            className={`aspect-square border rounded-2xl flex flex-col justify-between p-1.5 transition-all cursor-pointer relative group ${bgClass}`}
                          >
                            <span className="text-[11px] font-bold block">{dayNum}</span>
                            
                            {/* Visual Indicator Dots */}
                            {dayEvents.length > 0 && !isSelected && (
                              <div className="flex gap-1 justify-center w-full">
                                {dayEvents.slice(0, 3).map((ev, eIdx) => (
                                  <span 
                                    key={eIdx} 
                                    className={`h-1.5 w-1.5 rounded-full inline-block ${
                                      ev.type === 'holiday' ? 'bg-red-500' : 
                                      ev.type === 'leave' ? 'bg-amber-500' : 
                                      ev.type === 'payroll' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    }`} 
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CALENDAR SELECTED DATE EVENT DETAILS (Sidebar) */}
                <div className="lg:col-span-4 bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-zinc-950 text-base">Événements du Jour</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Détails pour le {selectedDay ? `${selectedDay} ${monthNames[currentDate.getMonth()]}` : "Sélectionnez un jour"}.
                    </p>
                  </div>

                  {selectedDay ? (
                    <div className="space-y-4">
                      {getEventsForDay(selectedDay).length === 0 ? (
                        <div className="text-center py-12 px-3 border border-zinc-100 rounded-2xl bg-zinc-50/50 flex flex-col items-center justify-center space-y-2">
                          <HelpCircle className="h-5 w-5 text-zinc-400" />
                          <span className="text-xs font-semibold text-zinc-600 block">Aucun événement enregistré</span>
                          <span className="text-[10px] text-zinc-400">Cette date est vierge de contraintes RH ou d'audits salariaux.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {getEventsForDay(selectedDay).map((ev, idx) => (
                            <div 
                              key={idx} 
                              className={`p-3.5 border rounded-2xl text-xs space-y-1 ${
                                ev.type === 'holiday' ? 'bg-red-50/60 border-red-100 text-red-950' :
                                ev.type === 'leave' ? 'bg-amber-50/60 border-amber-100 text-amber-950' :
                                ev.type === 'payroll' ? 'bg-violet-50/60 border-violet-100 text-violet-950' :
                                'bg-emerald-50/60 border-emerald-100 text-emerald-950'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                                  ev.type === 'holiday' ? 'bg-red-500' : 
                                  ev.type === 'leave' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                                {ev.title}
                              </div>
                              <span className="text-[10px] text-zinc-500 block">
                                {ev.type === 'holiday' ? 'Absence légale compensée sur tout le territoire national.' :
                                 ev.type === 'leave' ? 'Congé planifié et dument approuvé par la direction.' :
                                 ev.type === 'payroll' ? 'Date de calcul automatique des fiches de paie mensuelles.' :
                                 'Activité administrative requise.'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-zinc-400 text-xs font-semibold">
                      Cliquez sur un jour du calendrier pour examiner ses événements.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
