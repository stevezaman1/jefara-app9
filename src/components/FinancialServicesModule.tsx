import React, { useState } from 'react';
import { Company, Employee, FinancialServiceRequest } from '../types';
import { 
  DollarSign, RefreshCw, Plus, Users, 
  HelpCircle, CheckCircle2, ShieldAlert, Percent, Receipt,
  TrendingUp, PiggyBank, HeartHandshake, ShieldCheck, 
  ChevronRight, Calendar, Calculator, Check, X, Info, BarChart3, AlertCircle
} from 'lucide-react';
import { db, doc, setDoc, updateDoc } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';

interface FinancialProps {
  company: Company;
  employees: Employee[];
  financialRequests: FinancialServiceRequest[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function FinancialServicesModule({ company, employees, financialRequests, onRefresh, activeSubTab }: FinancialProps) {
  const [subTab, setSubTab] = useState<'dashboard' | 'advances' | 'loans' | 'savings' | 'insurance'>('dashboard');

  React.useEffect(() => {
    if (activeSubTab === 'financial-advances') {
      setSubTab('advances');
    } else if (activeSubTab === 'financial-loans') {
      setSubTab('loans');
    } else if (activeSubTab === 'financial-savings') {
      setSubTab('savings');
    } else {
      setSubTab('dashboard');
    }
  }, [activeSubTab]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [repaymentTermMonths, setRepaymentTermMonths] = useState('3');
  const [purpose, setPurpose] = useState('');
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Compound Savings growth calculator states
  const [simInitialDeposit, setSimInitialDeposit] = useState('100000');
  const [simMonthlyContribution, setSimMonthlyContribution] = useState('25000');
  const [simAPY, setSimAPY] = useState('6.5');
  const [simYears, setSimYears] = useState('5');

  // Amortization loan calculator states
  const [calcLoanAmount, setCalcLoanAmount] = useState('1500000');
  const [calcRate, setCalcRate] = useState('4.5'); // Low interest
  const [calcMonths, setCalcMonths] = useState('12');
  const [calcType, setCalcType] = useState<'Simple' | 'Compound'>('Simple');

  const activeEmployees = employees.filter(e => e.status === 'Active');

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Submit Salary Advance / Loan Request
  const handleCreateRequest = async (type: 'Salary Advance' | 'Loan' | 'Savings' | 'Insurance') => {
    if (!selectedEmployeeId || !amount) {
      triggerToast('Le collaborateur et le montant sont requis.');
      return;
    }

    setSaving(true);
    try {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (!emp) return;

      const baseSalary = emp.basicSalary || 250000;
      const amountVal = parseFloat(amount);
      const terms = parseInt(repaymentTermMonths) || 1;

      // Validate Cameroon labor code advance cap (50% max of basic salary)
      if (type === 'Salary Advance' && amountVal > baseSalary * 0.5) {
        triggerToast(`Le montant demandé dépasse la limite légale de 50% du salaire de base (${formatAmount(baseSalary * 0.5)})`);
        setSaving(false);
        return;
      }

      const requestId = 'fin_' + Math.random().toString(36).substring(2, 11);
      const monthlyDeduction = Math.round(amountVal / terms);

      const newRequest: FinancialServiceRequest = {
        id: requestId,
        companyId: company.id,
        employeeId: selectedEmployeeId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        type,
        amount: amountVal,
        repaymentTermMonths: terms,
        monthlyDeduction,
        purpose: purpose || `${type} sollicité par le salarié`,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'financial_service_requests', requestId), newRequest);
      triggerToast('Demande financière enregistrée et soumise au comité d\'audit.');
      
      setSelectedEmployeeId('');
      setAmount('');
      setPurpose('');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Approval Process
  const handleApproval = async (requestId: string, status: 'Approved' | 'Rejected' | 'Active') => {
    try {
      const docRef = doc(db, 'companies', company.id, 'financial_service_requests', requestId);
      await updateDoc(docRef, { status });
      triggerToast(status === 'Approved' ? 'Dossier approuvé et ordonnancé.' : 'Dossier rejeté.');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message);
    }
  };

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(val);
  };

  // Computes savings growth trajectory over years
  const generateSavingsGrowthData = () => {
    const data = [];
    const p = parseFloat(simInitialDeposit) || 0;
    const m = parseFloat(simMonthlyContribution) || 0;
    const rate = (parseFloat(simAPY) || 0) / 100;
    const yrs = parseInt(simYears) || 5;

    let total = p;
    for (let yr = 0; yr <= yrs; yr++) {
      if (yr > 0) {
        // Compound interest calculated once annually for simplicity
        total = (total + (m * 12)) * (1 + rate);
      }
      data.push({
        year: `Year ${yr}`,
        balance: Math.round(total),
        contributions: Math.round(p + (m * 12 * yr))
      });
    }
    return data;
  };

  // Computes Custom Loan Amortization Schedule
  const generateAmortizationSchedule = () => {
    const principal = parseFloat(calcLoanAmount) || 0;
    const annualRate = (parseFloat(calcRate) || 0) / 100;
    const months = parseInt(calcMonths) || 12;

    const schedule = [];
    let balance = principal;

    if (calcType === 'Simple') {
      const totalInterest = principal * annualRate * (months / 12);
      const monthlyInterest = totalInterest / months;
      const monthlyPrincipal = principal / months;
      const monthlyPayment = monthlyPrincipal + monthlyInterest;

      for (let m = 1; m <= months; m++) {
        const interestPaid = monthlyInterest;
        const principalPaid = monthlyPrincipal;
        const openBal = balance;
        balance = balance - principalPaid;

        schedule.push({
          month: m,
          openBal: Math.round(openBal),
          payment: Math.round(monthlyPayment),
          principalPaid: Math.round(principalPaid),
          interestPaid: Math.round(interestPaid),
          closeBal: Math.round(Math.max(0, balance))
        });
      }
    } else {
      // Compound Amortization Formula
      const monthlyRate = annualRate / 12;
      const monthlyPayment = monthlyRate > 0 
        ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
        : principal / months;

      for (let m = 1; m <= months; m++) {
        const interestPaid = balance * monthlyRate;
        const principalPaid = monthlyPayment - interestPaid;
        const openBal = balance;
        balance = balance - principalPaid;

        schedule.push({
          month: m,
          openBal: Math.round(openBal),
          payment: Math.round(monthlyPayment),
          principalPaid: Math.round(principalPaid),
          interestPaid: Math.round(interestPaid),
          closeBal: Math.round(Math.max(0, balance))
        });
      }
    }
    return schedule.slice(0, 6); // Display first 6 months to avoid table overflow, keeping it compact & premium
  };

  const savingsData = generateSavingsGrowthData();
  const amortizationData = generateAmortizationSchedule();

  // Recharts Pie allocation
  const pieData = [
    { name: 'Salary Advances', value: financialRequests.filter(r => r.type === 'Salary Advance').reduce((sum, r) => sum + r.amount, 0) || 1200000 },
    { name: 'Company Loans', value: financialRequests.filter(r => r.type === 'Loan').reduce((sum, r) => sum + r.amount, 0) || 4500000 },
    { name: 'Staff Mutual Savings', value: 8500000 }
  ];
  const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 p-4 bg-zinc-950 text-white rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="h-4 w-4 text-violet-400" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Sub Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3.5">
        <div>
          <h2 className="font-display font-bold text-xl text-zinc-950">Services Financiers Aux Salariés</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">Avances de salaires réglementées, micro-crédits internes, caisses d'épargne d'entreprise et mutuelles partenaires.</p>
        </div>
      </div>

      {/* 1. FINANCIAL WELLNESS DASHBOARD */}
      {subTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-violet-50 text-[#7c3aed] rounded-xl flex items-center justify-center shrink-0">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Total Mutual Deposits</span>
                <span className="text-base font-bold text-zinc-950 block mt-0.5 font-display">8 500 000 {company.currency}</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Outstanding Loan Book</span>
                <span className="text-base font-bold text-zinc-950 block mt-0.5 font-display">4 500 000 {company.currency}</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Advances Disbursed</span>
                <span className="text-base font-bold text-zinc-950 block mt-0.5 font-display">1 200 000 {company.currency}</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Staff Wellness Index</span>
                <span className="text-base font-bold text-zinc-950 block mt-0.5 font-display">84 / 100 Stable</span>
              </div>
            </div>
          </div>

          {/* Savings allocations and Growth trajectories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Pie Chart: Allocation */}
            <div className="lg:col-span-4 bg-white border border-zinc-150/80 rounded-[28px] p-5 shadow-xs space-y-4">
              <div>
                <h4 className="font-display font-bold text-xs text-zinc-950 uppercase tracking-wider">Financial Allocations</h4>
                <p className="text-[10px] text-zinc-400">Structure of savings versus advance/loan exposures.</p>
              </div>

              <div className="h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatAmount(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-2">
                {pieData.map((d, index) => (
                  <div key={d.name} className="flex items-center justify-between text-[11px] font-medium text-zinc-700">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                      <span>{d.name}</span>
                    </div>
                    <span className="font-mono text-zinc-950 font-bold">{formatAmount(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compound Savings growth line chart & Simulator */}
            <div className="lg:col-span-8 bg-white border border-zinc-150/80 rounded-[28px] p-5 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3.5">
                <div>
                  <h4 className="font-display font-bold text-xs text-zinc-950 uppercase tracking-wider">Caisse d'Épargne Growth Simulation</h4>
                  <p className="text-[10px] text-zinc-400">Simulate investment compound returns on the company premium mutual fund.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 bg-zinc-50 border p-1 rounded-lg">
                    <span>Yield Rate :</span>
                    <span className="text-violet-600">6.5% APY</span>
                  </div>
                </div>
              </div>

              {/* Live Calculator controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-[10px] font-bold text-zinc-500">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Dépôt Initial ({company.currency})</label>
                  <input 
                    type="number" value={simInitialDeposit} onChange={e => setSimInitialDeposit(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-2 font-mono text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Dépôt Mensuel</label>
                  <input 
                    type="number" value={simMonthlyContribution} onChange={e => setSimMonthlyContribution(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-2 font-mono text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Taux Rendement (%)</label>
                  <input 
                    type="number" step="0.1" value={simAPY} onChange={e => setSimAPY(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-2 font-mono text-zinc-800"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider mb-1">Horizon (Années)</label>
                  <select 
                    value={simYears} onChange={e => setSimYears(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 px-2 font-mono text-zinc-800"
                  >
                    <option value="3">3 ans</option>
                    <option value="5">5 ans</option>
                    <option value="10">10 ans</option>
                  </select>
                </div>
              </div>

              {/* Line Chart */}
              <div className="h-56 text-xs font-mono pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={savingsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis dataKey="year" stroke="#a1a1aa" fontSize={10} />
                    <YAxis stroke="#a1a1aa" fontSize={10} />
                    <Tooltip formatter={(value: any) => formatAmount(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={2.5} name="Capital Cumulé + Intérêts" />
                    <Line type="monotone" dataKey="contributions" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" name="Versements Cumulés" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. SALARY ADVANCE REQUEST SYSTEM */}
      {subTab === 'advances' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Eligibility and Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <Receipt className="h-4.5 w-4.5 text-violet-600" />
                <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider">Demande d'Avance de Quinzaine</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sélectionner le Collaborateur *</label>
                  <select 
                    value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}
                    className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3 focus:outline-none"
                  >
                    <option value="">-- Choisissez le collaborateur --</option>
                    {activeEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
                    ))}
                  </select>
                </div>

                {/* Eligibility Widget */}
                {selectedEmployeeId && (() => {
                  const emp = employees.find(e => e.id === selectedEmployeeId);
                  const baseSalary = emp?.basicSalary || 200000;
                  const limit = baseSalary * 0.5;

                  return (
                    <div className="p-3 bg-violet-50/40 border border-violet-100 rounded-2xl space-y-1.5">
                      <span className="text-[10px] font-bold text-violet-800 block">Calculateur d'Éligibilité (Code du Travail)</span>
                      <div className="flex justify-between text-[11px] text-zinc-600">
                        <span>Salaire de base brut :</span>
                        <span className="font-bold font-mono text-zinc-900">{formatAmount(baseSalary)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-600">
                        <span>Plafond Avance Légal (50%) :</span>
                        <span className="font-bold font-mono text-violet-600">{formatAmount(limit)}</span>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Montant Sollicité *</label>
                  <input 
                    type="number" required value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3.5 text-xs font-mono"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Motif de la demande</label>
                  <textarea 
                    value={purpose} onChange={e => setPurpose(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-50 border rounded-xl py-2 px-3 text-xs"
                    placeholder="e.g. Frais de scolarité rentrée scolaire Cameroun"
                  />
                </div>

                <button 
                  onClick={() => handleCreateRequest('Salary Advance')}
                  disabled={saving || !selectedEmployeeId || !amount}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  {saving ? 'Analyse éligibilité...' : 'Soumettre le Dossier d\'Avance'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Advances Ledger */}
          <div className="lg:col-span-7 bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Advances Ledger</h4>
            
            {financialRequests.filter(r => r.type === 'Salary Advance').length === 0 ? (
              <div className="text-center py-16 text-zinc-400 text-xs">
                No salary advance requests registered in this payroll node.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-wider">
                      <th className="py-2 px-1">Agent</th>
                      <th className="py-2 px-1">Montant</th>
                      <th className="py-2 px-1">Deduction Unique</th>
                      <th className="py-2 px-1">Statut</th>
                      <th className="py-2 px-1 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium">
                    {financialRequests
                      .filter(r => r.type === 'Salary Advance')
                      .map(req => (
                        <tr key={req.id} className="hover:bg-zinc-50/50">
                          <td className="py-3 px-1">
                            <span className="font-bold text-zinc-950 block">{req.employeeName}</span>
                            <span className="text-[10px] text-zinc-400 font-normal italic">"{req.purpose}"</span>
                          </td>
                          <td className="py-3 px-1 font-mono text-zinc-800 font-bold">{formatAmount(req.amount)}</td>
                          <td className="py-3 px-1 font-mono text-zinc-500">{formatAmount(req.monthlyDeduction)}</td>
                          <td className="py-3 px-1">
                            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full uppercase ${
                              req.status === 'Approved' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                              req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-zinc-100 text-zinc-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 px-1 text-right">
                            {req.status === 'Pending' && (
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => handleApproval(req.id, 'Approved')} className="p-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-[9px] font-bold">Approuver</button>
                                <button onClick={() => handleApproval(req.id, 'Rejected')} className="p-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold">Rejeter</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. INTERACTIVE LOAN MANAGEMENT & AMORTIZATION */}
      {subTab === 'loans' && (
        <div className="space-y-6">
          
          {/* Calculator and Amortization Scheduler Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Input Form */}
            <div className="lg:col-span-5 bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b pb-3">
                <Calculator className="h-4.5 w-4.5 text-violet-600" />
                <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider">Company Micro-Loan Calculator</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Montant Principal *</label>
                  <input 
                    type="number" value={calcLoanAmount} onChange={e => setCalcLoanAmount(e.target.value)}
                    className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Taux d'Intérêt Annuel (%)</label>
                    <input 
                      type="number" step="0.1" value={calcRate} onChange={e => setCalcRate(e.target.value)}
                      className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Tenure (Mois)</label>
                    <input 
                      type="number" value={calcMonths} onChange={e => setCalcMonths(e.target.value)}
                      className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Type de Calcul d'Intérêts</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Simple', 'Compound'].map(t => (
                      <button 
                        key={t} type="button" onClick={() => setCalcType(t as any)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          calcType === t ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        {t} Interest
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create Request shortcut from calculator */}
                <div className="pt-3 border-t space-y-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Associer à un collaborateur</span>
                  <div className="grid grid-cols-1 gap-2.5">
                    <select 
                      value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}
                      className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3 text-xs"
                    >
                      <option value="">-- Choisir l'emprunteur --</option>
                      {activeEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                      ))}
                    </select>

                    <button 
                      onClick={() => {
                        setAmount(calcLoanAmount);
                        setRepaymentTermMonths(calcMonths);
                        handleCreateRequest('Loan');
                      }}
                      disabled={saving || !selectedEmployeeId}
                      className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Émettre et Engager le Prêt</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Custom Amortization Schedule Table */}
            <div className="lg:col-span-7 bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-display font-bold text-xs text-zinc-950 uppercase tracking-wider">Tableau d'Amortissement Amortization Schedule</h4>
                  <p className="text-[10px] text-zinc-400">Monthly schedule projection (Showing first 6 payments max).</p>
                </div>
                <span className="bg-violet-50 text-violet-700 font-bold font-mono text-[10px] px-2 py-0.5 rounded-md border border-violet-100">
                  Total Principal : {formatAmount(parseFloat(calcLoanAmount) || 0)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                      <th className="py-2">Mois</th>
                      <th className="py-2">Encours Début</th>
                      <th className="py-2">Mensualité</th>
                      <th className="py-2">Amorti Principal</th>
                      <th className="py-2">Intérêt Payé</th>
                      <th className="py-2 text-right">Encours Fin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium text-zinc-700 font-mono text-[11px]">
                    {amortizationData.map(row => (
                      <tr key={row.month} className="hover:bg-zinc-50/50">
                        <td className="py-2 text-zinc-900 font-bold">#{row.month}</td>
                        <td className="py-2 text-zinc-500">{formatAmount(row.openBal)}</td>
                        <td className="py-2 text-violet-600 font-bold">{formatAmount(row.payment)}</td>
                        <td className="py-2 text-zinc-700">{formatAmount(row.principalPaid)}</td>
                        <td className="py-2 text-amber-600">{formatAmount(row.interestPaid)}</td>
                        <td className="py-2 text-zinc-900 font-bold text-right">{formatAmount(row.closeBal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-2xl flex items-start gap-2.5 text-[11px] text-zinc-500 leading-relaxed border">
                <Info className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                <p>
                  Calcul d'intérêt d'entreprise ultra-compétitif. L'intérêt cumulé est réinjecté dans la caisse mutuelle des salariés Jefara pour financer d'autres dossiers sociaux solidaires.
                </p>
              </div>
            </div>

          </div>

          {/* Micro Loans Ledger with approvals queue */}
          <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Comité de validation de Prêts</h4>
            
            {financialRequests.filter(r => r.type === 'Loan').length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs">
                No loan requests registered in this payroll node.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                      <th className="py-2">Emprunteur</th>
                      <th className="py-2">Principal Emprunté</th>
                      <th className="py-2">Tenure de Remboursement</th>
                      <th className="py-2">Mensualité Bulletin</th>
                      <th className="py-2">Statut Décision</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium">
                    {financialRequests
                      .filter(r => r.type === 'Loan')
                      .map(req => (
                        <tr key={req.id} className="hover:bg-zinc-50/50">
                          <td className="py-3 font-bold text-zinc-950">{req.employeeName}</td>
                          <td className="py-3 font-mono text-zinc-800 font-bold">{formatAmount(req.amount)}</td>
                          <td className="py-3 text-zinc-500 font-bold">{req.repaymentTermMonths} Mois</td>
                          <td className="py-3 font-mono text-violet-600">{formatAmount(req.monthlyDeduction || 0)} / mois</td>
                          <td className="py-3">
                            <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full uppercase ${
                              req.status === 'Approved' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                              req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-zinc-100 text-zinc-800'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {req.status === 'Pending' && (
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => handleApproval(req.id, 'Approved')} className="p-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded text-[9px] font-bold">Approuver</button>
                                <button onClick={() => handleApproval(req.id, 'Rejected')} className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold">Rejeter</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. SAVINGS & INVESTMENT PORTAL */}
      {subTab === 'savings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Mutual investment options */}
          <div className="lg:col-span-7 bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
            <h3 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Company Supported Mutual Funds</h3>
            <p className="text-[11px] text-zinc-400">Voluntary employee investment funds with high yields partnered with local Cameroun financial assets.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Jefara High-Yield Sovereign Bond', rate: '6.8% APY', description: 'Invest in secure government bills backed by Cameroonian treasury notes.', min: '50 000' },
                { name: 'SAAR Real Estate Equity fund', rate: '9.2% APY', description: 'Local residential property real-estate investment with high dividends.', min: '100 000' }
              ].map(fund => (
                <div key={fund.name} className="p-4 bg-zinc-50/50 border rounded-2xl space-y-3 flex flex-col justify-between hover:border-zinc-200 transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-violet-600 uppercase">Actif Prévoyance</span>
                      <span className="font-mono text-xs font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-lg border border-violet-100">{fund.rate}</span>
                    </div>
                    <h5 className="font-display font-bold text-xs text-zinc-950 leading-tight">{fund.name}</h5>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{fund.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold pt-2 border-t text-zinc-400">
                    <span>Min initial : {fund.min} {company.currency}</span>
                    <button className="text-zinc-950 hover:text-violet-600 flex items-center gap-1"> Souscrire <ChevronRight className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick simulator deposit */}
          <div className="lg:col-span-5 bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b pb-3">
              <PiggyBank className="h-4.5 w-4.5 text-violet-600" />
              <h4 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider">Voluntary Payroll Savings Subscription</h4>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Sélectionner le Collaborateur *</label>
                <select className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3 text-xs">
                  <option value="">-- Choisissez le collaborateur --</option>
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Dépôt Mensuel Volontaire sur Bulletin ({company.currency})</label>
                <input type="number" className="w-full bg-zinc-50 border rounded-xl py-2.5 px-3.5 text-xs font-mono" placeholder="e.g. 15000" />
              </div>

              <div className="p-3 bg-zinc-50 rounded-2xl flex items-center gap-2 text-zinc-500 leading-relaxed text-[10px]">
                <ShieldCheck className="h-4.5 w-4.5 text-violet-600 shrink-0" />
                <span>Les fonds sont défiscalisés de l'IRPP sous le régime de l'Épargne Salariale Locale.</span>
              </div>

              <button 
                onClick={() => triggerToast('Abonnement Épargne Salariale activé sur le prochain bulletin.')}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all"
              >
                Activer le Plan d'Épargne Salariale
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 5. PARTNER-SPONSORED INSURANCE SCHEMES */}
      {subTab === 'insurance' && (
        <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Couverture Santé & Assurances Partenaires</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Offres de prévoyance négociées collectivement avec déduction et prise en charge employeur.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Activa Care Plus', type: 'Assurance Maladie', coverage: '80% frais médicaux, maternité, pharmacie', price: '15 000', partner: 'Activa Assurance S.A.' },
              { name: 'SAAR Prévoyance Elite', type: 'Décès & Invalidité', coverage: 'Versement capital de 5 000 000 FCFA aux ayants droit', price: '8 500', partner: 'SAAR Assurance' },
              { name: 'Allianz Work Accident Protection', type: 'Accidents de service', coverage: '100% prise en charge hospitalière d\'urgence', price: '5 000', partner: 'Allianz Cameroun' }
            ].map(ins => (
              <div key={ins.name} className="border border-zinc-150 rounded-[24px] p-5 shadow-xs flex flex-col justify-between hover:border-zinc-200 transition-all space-y-4">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold font-mono bg-violet-50 text-violet-700 px-2 py-0.5 border border-violet-100 rounded-md uppercase">
                    {ins.type}
                  </span>
                  <h4 className="font-display font-bold text-sm text-zinc-950">{ins.name}</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {ins.coverage}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-zinc-400 font-semibold">Mensualité :</span>
                    <span className="text-base font-mono font-bold text-zinc-950">
                      {ins.price} FCFA <span className="text-[10px] text-zinc-400">/ agent</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-semibold block">Partenaire : {ins.partner}</span>

                  <button 
                    onClick={() => triggerToast(`Abonnement ${ins.name} validé pour les employés souscrits.`)}
                    className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Activer la mutuelle
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
