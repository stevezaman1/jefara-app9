import React, { useState } from 'react';
import { Company, Employee, PayrollRun, Payslip } from '../types';
import { 
  Plus, CreditCard, ChevronRight, CheckCircle2, 
  Clock, Award, ShieldAlert, Sparkles, Receipt, FileText, RefreshCw, Download, Printer, Search
} from 'lucide-react';
import { db, doc, setDoc, updateDoc, collection } from '../firebase';
import { PageHelpButton } from './PageHelpButton';
import { motion, AnimatePresence } from 'motion/react';

// New Modular Payroll Components
import PayrollAnalytics from './PayrollAnalytics';
import PayrollTaxCompliance from './PayrollTaxCompliance';
import PayrollBankTransfer from './PayrollBankTransfer';
import PayrollTaxSimulator from './PayrollTaxSimulator';
import PayrollEmployeeHistory from './PayrollEmployeeHistory';

interface PayrollProps {
  company: Company;
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function PayrollModule({ 
  company, 
  employees, 
  payrollRuns, 
  payslips, 
  onRefresh,
  activeSubTab
}: PayrollProps) {
  const [payrollTab, setPayrollTab] = useState<'cycles' | 'analytics' | 'compliance' | 'bank' | 'simulator' | 'history'>('cycles');
  const [subTab, setSubTab] = useState<'runs' | 'details' | 'slip'>('runs');

  React.useEffect(() => {
    if (activeSubTab === 'payroll-runs') {
      setPayrollTab('cycles');
      setSubTab('runs');
    } else if (activeSubTab === 'payroll-calc') {
      setPayrollTab('simulator');
    } else if (activeSubTab === 'payroll-bonuses' || activeSubTab === 'payroll-deductions' || activeSubTab === 'payroll-workflow') {
      setPayrollTab('compliance');
    } else if (activeSubTab === 'payroll-payslips') {
      setPayrollTab('cycles');
      setSubTab('runs');
    } else if (activeSubTab === 'payroll-history') {
      setPayrollTab('history');
    } else {
      setPayrollTab('cycles');
      setSubTab('runs');
    }
  }, [activeSubTab]);

  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  // Cycle creation
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [month, setMonth] = useState('Janvier');
  const [year, setYear] = useState(2026);
  const [creating, setCreating] = useState(false);

  // Bonus/Deduction modifiers on active draft payslips
  const [showModifierDialog, setShowModifierDialog] = useState(false);
  const [modPayslip, setModPayslip] = useState<Payslip | null>(null);
  const [modifierType, setModifierType] = useState<'bonus' | 'deduction'>('bonus');
  const [modifierName, setModifierName] = useState('');
  const [modifierAmount, setModifierAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeEmployees = employees.filter(e => e.status === 'Active');

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeEmployees.length === 0) return;

    setCreating(true);
    try {
      const runId = 'run_' + Math.random().toString(36).substring(2, 11);
      
      let totalBasic = 0;
      let totalBonuses = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      // Create individual draft payslips for active employees
      const batchPayslips: Payslip[] = activeEmployees.map(emp => {
        const base = emp.basicSalary;
        
        // Cameroon CNPS employee contribution (approx 4.2% of basic, capped at 300,000 XAF monthly)
        const cnpsContribution = Math.min(base, 300000) * (company.payrollSettings?.socialSecurityRateEmployee || 4.2) / 100;
        
        // standard IRPP tax estimate (approx 5% base on salary tiers)
        const irppEstimate = base * (company.payrollSettings?.taxRateBase || 10) / 100;

        const deductions = [
          { name: "CNPS (Social Security)", amount: Math.round(cnpsContribution) },
          { name: "IRPP (Income Tax Estimate)", amount: Math.round(irppEstimate) }
        ];

        const bonuses = [
          { name: "Transport Allowance", amount: Math.round(base * 0.05) } // Standard transport helper in Cameroon
        ];

        const bonusTotal = bonuses.reduce((acc, b) => acc + b.amount, 0);
        const dedTotal = deductions.reduce((acc, d) => acc + d.amount, 0);
        const net = base + bonusTotal - dedTotal;

        totalBasic += base;
        totalBonuses += bonusTotal;
        totalDeductions += dedTotal;
        totalNet += net;

        return {
          id: 'slip_' + Math.random().toString(36).substring(2, 11),
          companyId: company.id,
          payrollRunId: runId,
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          basicSalary: base,
          bonuses,
          deductions,
          netSalary: net,
          month,
          year,
          status: 'Draft'
        };
      });

      // Save Run
      const newRun: PayrollRun = {
        id: runId,
        companyId: company.id,
        month,
        year,
        status: 'Draft',
        totalBasic,
        totalBonuses,
        totalDeductions,
        totalNet,
        processedBy: "Workspace Owner",
        processedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'payroll_runs', runId), newRun);

      // Save all payslips under this run
      for (const slip of batchPayslips) {
        await setDoc(doc(db, 'companies', company.id, 'payslips', slip.id), slip);
      }

      setShowCreateDialog(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (run: PayrollRun, nextStatus: 'Validated' | 'Approved' | 'Paid') => {
    try {
      const runRef = doc(db, 'companies', company.id, 'payroll_runs', run.id);
      await updateDoc(runRef, { status: nextStatus });

      if (nextStatus === 'Paid') {
        // Mark all associated payslips as Paid and write ledger entries
        const associatedSlips = payslips.filter(p => p.payrollRunId === run.id);
        for (const slip of associatedSlips) {
          const slipRef = doc(db, 'companies', company.id, 'payslips', slip.id);
          await updateDoc(slipRef, { status: 'Paid' });
        }

        // Generate journal entry automatically
        const entryId = 'acc_' + Math.random().toString(36).substring(2, 11);
        await setDoc(doc(db, 'companies', company.id, 'accounting_entries', entryId), {
          id: entryId,
          companyId: company.id,
          type: 'Journal',
          description: `Disbursement of Payroll for Cycle ${run.month} ${run.year}`,
          amount: run.totalNet,
          category: "Salary Expense",
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        });
      }

      setSelectedRun(null);
      setSubTab('runs');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modPayslip || !modifierName || !modifierAmount) return;

    try {
      const amountVal = parseFloat(modifierAmount);
      const updatedBonuses = [...modPayslip.bonuses];
      const updatedDeductions = [...modPayslip.deductions];

      if (modifierType === 'bonus') {
        updatedBonuses.push({ name: modifierName, amount: amountVal });
      } else {
        updatedDeductions.push({ name: modifierName, amount: amountVal });
      }

      const bonusTotal = updatedBonuses.reduce((acc, b) => acc + b.amount, 0);
      const dedTotal = updatedDeductions.reduce((acc, d) => acc + d.amount, 0);
      const newNet = modPayslip.basicSalary + bonusTotal - dedTotal;

      const slipRef = doc(db, 'companies', company.id, 'payslips', modPayslip.id);
      await updateDoc(slipRef, {
        bonuses: updatedBonuses,
        deductions: updatedDeductions,
        netSalary: newNet
      });

      // Recalculate parent PayrollRun totals to prevent data desynchronization
      const parentRunId = modPayslip.payrollRunId;
      const otherSlips = payslips.filter(p => p.payrollRunId === parentRunId && p.id !== modPayslip.id);
      
      let totalBasic = modPayslip.basicSalary;
      let totalBonuses = bonusTotal;
      let totalDeductions = dedTotal;
      let totalNet = newNet;

      for (const p of otherSlips) {
        totalBasic += p.basicSalary;
        totalBonuses += p.bonuses.reduce((acc, b) => acc + b.amount, 0);
        totalDeductions += p.deductions.reduce((acc, d) => acc + d.amount, 0);
        totalNet += p.netSalary;
      }

      const runRef = doc(db, 'companies', company.id, 'payroll_runs', parentRunId);
      await updateDoc(runRef, {
        totalBasic,
        totalBonuses,
        totalDeductions,
        totalNet
      });

      // Update selectedRun state if viewing the run details
      if (selectedRun && selectedRun.id === parentRunId) {
        setSelectedRun(prev => prev ? {
          ...prev,
          totalBasic,
          totalBonuses,
          totalDeductions,
          totalNet
        } : null);
      }

      setShowModifierDialog(false);
      setModPayslip(null);
      setModifierName('');
      setModifierAmount('');
      onRefresh();
    } catch (err) {
      console.error("Error modifying payslip ledger values: ", err);
    }
  };

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(val);
  };

  const handleDownloadPayslipPDF = (slip: Payslip) => {
    try {
      const basic = slip.basicSalary;
      const totalB = slip.bonuses.reduce((acc, b) => acc + b.amount, 0);
      const totalD = slip.deductions.reduce((acc, d) => acc + d.amount, 0);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Activez les fenêtres contextuelles pour imprimer le bulletin.");
        return;
      }

      const formattedDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BULLETIN DE PAIE - ${slip.employeeName} - ${slip.month} ${slip.year}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page {
      size: A4;
      margin: 15mm;
    }
    @media print {
      body {
        margin: 0;
        background: white;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body class="bg-white text-zinc-900 antialiased p-4 sm:p-8 max-w-4xl mx-auto">
  
  <!-- Print Controls -->
  <div class="no-print mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex justify-between items-center text-sm">
    <span class="font-semibold text-zinc-600">Bulletin de Paie Jefara (Format Prêt pour Impression PDF)</span>
    <button onclick="window.print()" class="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5">
      Imprimer / Sauvegarder PDF
    </button>
  </div>

  <!-- Document Header -->
  <div class="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-zinc-950 pb-6">
    <div class="space-y-1">
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold tracking-tight">Jefara Human Resources Suite</span>
      </div>
      <p class="text-[10px] text-zinc-400 font-mono">SECURE TENANT LEDGER CORE</p>
    </div>
    
    <div class="text-right sm:text-right space-y-1">
      <h2 class="text-xs font-bold tracking-widest text-zinc-400 uppercase">RÉPUBLIQUE DU CAMEROUN</h2>
      <p class="text-[10px] text-zinc-500 font-medium">Paix - Travail - Patrie</p>
      <div class="h-1 w-20 bg-zinc-950 ml-auto my-1"></div>
      <p class="text-[10px] text-zinc-400 uppercase font-bold">REPUBLIC OF CAMEROON</p>
      <p class="text-[9px] text-zinc-500">Peace - Work - Fatherland</p>
    </div>
  </div>

  <!-- Main Title -->
  <div class="my-6 text-center">
    <h1 class="text-xl font-bold uppercase tracking-wider text-zinc-900">BULLETIN DE PAIE / PAYSLIP</h1>
    <p class="text-xs text-zinc-500 mt-1">Période de Paie : <span class="font-bold text-zinc-800">${slip.month.toUpperCase()} ${slip.year}</span></p>
  </div>

  <!-- Grid: Employer & Employee Info -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8 border border-zinc-200 rounded-2xl p-5 bg-zinc-50/50 text-xs leading-relaxed">
    <div class="space-y-2">
      <h3 class="font-bold text-zinc-900 border-b border-zinc-200 pb-1 uppercase text-[10px] tracking-wider text-zinc-400">1. INFORMATIONS EMPLOYEUR</h3>
      <div>
        <span class="text-zinc-500">Raison Sociale :</span>
        <span class="font-semibold text-zinc-800 ml-1">${company.name.toUpperCase()}</span>
      </div>
      <div>
        <span class="text-zinc-500">Identifiant Unique (NIU) :</span>
        <span class="font-mono font-semibold text-zinc-800 ml-1">${company.registrationNumber || 'N/A'}</span>
      </div>
      <div>
        <span class="text-zinc-500">Pays / Siège Social :</span>
        <span class="font-semibold text-zinc-800 ml-1">${company.country}</span>
      </div>
      <div>
        <span class="text-zinc-500">Devise Légale :</span>
        <span class="font-semibold text-zinc-800 ml-1">${company.currency} (XAF)</span>
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="font-bold text-zinc-900 border-b border-zinc-200 pb-1 uppercase text-[10px] tracking-wider text-zinc-400">2. INFORMATIONS SALARIÉ</h3>
      <div>
        <span class="text-zinc-500">Nom & Prénom :</span>
        <span class="font-semibold text-zinc-800 ml-1">${slip.employeeName.toUpperCase()}</span>
      </div>
      <div>
        <span class="text-zinc-500">Identifiant Unique Salarié :</span>
        <span class="font-mono font-semibold text-zinc-800 ml-1">${slip.employeeId}</span>
      </div>
      <div>
        <span class="text-zinc-500">Statut du Versement :</span>
        <span class="font-semibold px-2 py-0.5 rounded-full text-[9px] ${slip.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} ml-1">${slip.status.toUpperCase()}</span>
      </div>
      <div>
        <span class="text-zinc-500">ID Unique du Bulletin :</span>
        <span class="font-mono text-zinc-500 ml-1 text-[10px]">${slip.id}</span>
      </div>
    </div>
  </div>

  <!-- Detail of Earnings & Deductions Table -->
  <div class="my-6 border border-zinc-200 rounded-2xl overflow-hidden text-xs">
    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="bg-zinc-100 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
          <th class="py-3 px-4">Rubrique</th>
          <th class="py-3 px-4 text-right">Part Patronale</th>
          <th class="py-3 px-4 text-right">Part Salariale (-)</th>
          <th class="py-3 px-4 text-right">Gains (+)</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-zinc-150">
        <!-- Contract Salary -->
        <tr>
          <td class="py-3 px-4 font-medium text-zinc-800">Salaire de Base Contractuel</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
          <td class="py-3 px-4 text-right font-mono font-semibold text-zinc-800">${basic.toLocaleString()}</td>
        </tr>
        
        <!-- Bonuses / Allowances -->
        ${slip.bonuses.map(b => `
          <tr>
            <td class="py-3 px-4 text-zinc-700">Indemnité / Prime : ${b.name}</td>
            <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
            <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
            <td class="py-3 px-4 text-right font-mono text-green-600 font-semibold">+${b.amount.toLocaleString()}</td>
          </tr>
        `).join('')}

        <!-- Total Gross -->
        <tr class="bg-zinc-50 font-semibold border-t border-b border-zinc-200">
          <td class="py-3 px-4">SOUS-TOTAL SALAIRE BRUT</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-900">${(basic + totalB).toLocaleString()}</td>
        </tr>

        <!-- Deductions -->
        ${slip.deductions.map(d => `
          <tr>
            <td class="py-3 px-4 text-zinc-700">Retenue : ${d.name}</td>
            <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
            <td class="py-3 px-4 text-right font-mono text-red-600">-${d.amount.toLocaleString()}</td>
            <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
          </tr>
        `).join('')}

        <!-- Total Deductions -->
        <tr class="bg-zinc-50 font-semibold border-t border-b border-zinc-200">
          <td class="py-3 px-4">TOTAL RETENUES & COTISATIONS</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
          <td class="py-3 px-4 text-right font-mono text-red-600">-${totalD.toLocaleString()}</td>
          <td class="py-3 px-4 text-right font-mono text-zinc-400">0,00</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Totals Summary Block -->
  <div class="my-8 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 bg-zinc-950 text-white">
    <div class="space-y-1 text-center sm:text-left">
      <h4 class="text-xs font-bold uppercase tracking-widest text-zinc-400">SYNTHÈSE DU NET À PAYER</h4>
      <p class="text-[10px] text-zinc-500 italic">Valeur arrêtée en Francs CFA (XAF) Camerounais</p>
    </div>
    
    <div class="text-center sm:text-right">
      <span class="text-3xl font-bold tracking-tight font-mono">${slip.netSalary.toLocaleString()}</span>
      <span class="text-sm font-bold text-zinc-300 ml-1">FCFA</span>
    </div>
  </div>

  <!-- Word representation -->
  <p class="text-xs text-zinc-500 italic text-center mb-8">
    Arrêté le présent bulletin de paie à la somme nette à verser de : ${slip.netSalary.toLocaleString()} ${company.currency}
  </p>

  <!-- Legal & Signatures -->
  <div class="mt-12 pt-6 border-t border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] leading-relaxed text-zinc-500">
    <div>
      <h4 class="font-bold text-zinc-900 uppercase tracking-wider mb-2 text-[10px]">MENTIONS LÉGALES</h4>
      <p>Ce bulletin de paie est certifié conforme par le protocole Jefara Cameroon Core. Le prélèvement de la cotisation CNPS et de l'IRPP s'effectue conformément au Code du Travail de la République du Cameroun. Conservé pendant une durée légale de 10 ans dans le coffre-fort numérique crypté de l'entreprise.</p>
    </div>
    <div class="flex flex-col justify-between h-full min-h-[100px]">
      <div class="flex justify-between items-start text-center">
        <div>
          <p class="font-bold text-zinc-700">Signature de l'Employeur</p>
          <div class="h-10 my-1 flex items-center justify-center">
            <span class="text-[9px] font-mono border border-zinc-200 px-2 py-0.5 rounded bg-zinc-50 select-none text-zinc-400">JEFARA DIGITAL SEAL</span>
          </div>
        </div>
        <div>
          <p class="font-bold text-zinc-700">Signature du Salarié</p>
          <div class="h-10 my-1 flex items-center justify-center">
            <span class="text-[9px] font-mono border border-zinc-200 px-2 py-0.5 rounded bg-zinc-50 select-none text-zinc-400">BON POUR ACCORD</span>
          </div>
        </div>
      </div>
      <p class="text-[9px] text-zinc-400 text-right mt-4">Document généré le : ${formattedDate} • ID Bulletin : ${slip.id}</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err) {
      console.error("Error exporting payslip: ", err);
    }
  };

  const runPayslips = payslips.filter(p => selectedRun && p.payrollRunId === selectedRun.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {payrollTab === 'cycles' && (
        <div className="flex justify-end gap-3 w-full sm:w-auto pb-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {subTab === 'runs' && (
              <button 
                disabled={activeEmployees.length === 0}
                onClick={() => setShowCreateDialog(true)}
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Lancer un Nouveau Cycle</span>
              </button>
            )}
            {subTab !== 'runs' && (
              <button 
                onClick={() => { setSubTab('runs'); setSelectedRun(null); setSelectedPayslip(null); }}
                className="w-full sm:w-auto px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-semibold transition-colors text-zinc-700 bg-white shadow-xs cursor-pointer"
              >
                Retour aux Cycles
              </button>
            )}
          </div>
        </div>
      )}

      {payrollTab === 'cycles' && (
        <>
          {subTab === 'runs' && (
            <div className="space-y-4">
              {payrollRuns.length === 0 ? (
                <div className="text-center py-20 px-4 bg-white border border-zinc-100 rounded-[32px] flex flex-col items-center justify-center space-y-4 shadow-sm">
                  <div className="h-12 w-12 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-zinc-900">Create your first payroll.</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-normal">
                      Launch a cycle to automatically generate payslips for your active collaborators in accordance with regulations.
                    </p>
                  </div>
                  {activeEmployees.length === 0 ? (
                    <p className="text-xs font-semibold text-yellow-600 px-3.5 py-2 bg-yellow-50/80 border border-yellow-100/60 rounded-xl">
                      Veuillez d'abord onboarder au moins un collaborateur actif.
                    </p>
                  ) : (
                    <button 
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Calculer le premier cycle
                    </button>
                  )}
                </div>
              ) : (
                /* CONVERT CYCLES TO TABLE VIEW FOR RICH METRIC ANALYSIS */
                <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <th className="py-3.5 px-4">Cycle / Période</th>
                        <th className="py-3.5 px-4">Salaires de Base Brut</th>
                        <th className="py-3.5 px-4">Primes / Gains</th>
                        <th className="py-3.5 px-4">Retenues Fiscales</th>
                        <th className="py-3.5 px-4 text-right">Net Global Distribue</th>
                        <th className="py-3.5 px-4">Statut</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
                      {payrollRuns.map((run) => (
                        <tr 
                          key={run.id}
                          onClick={() => { setSelectedRun(run); setSubTab('details'); }}
                          className="hover:bg-zinc-50/50 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-4 font-bold text-zinc-900 text-sm">
                            {run.month} {run.year}
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-zinc-500">
                            {formatAmount(run.totalBasic || 0)}
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-emerald-600">
                            +{formatAmount(run.totalBonuses || 0)}
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-red-600">
                            -{formatAmount(run.totalDeductions || 0)}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-zinc-950 font-mono text-sm">
                            {formatAmount(run.totalNet)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              run.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' :
                              run.status === 'Approved' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-yellow-50 text-yellow-700 border border-yellow-100'
                            }`}>
                              {run.status === 'Paid' ? 'CLOSED' : run.status === 'Approved' ? 'APPROUVÉ' : 'BROUILLON'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end items-center gap-1">
                              <span className="text-[10px] text-zinc-400">Ouvrir</span>
                              <ChevronRight className="h-4 w-4 text-zinc-300" />
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

          {subTab === 'details' && selectedRun && (
            <div className="space-y-6">
              {/* Cycle Overview bar */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 text-white rounded-[28px] p-8 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-violet-500/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="relative z-10">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">Cycle de Paie</span>
                  <h3 className="text-2xl font-display font-bold tracking-tight mt-1">{selectedRun.month} {selectedRun.year}</h3>
                  <p className="text-xs text-zinc-400 mt-1">Status : <strong className="text-violet-300">{selectedRun.status}</strong></p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 relative z-10">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">Versement Net Total</span>
                    <span className="text-2xl font-bold font-display text-white mt-0.5 block">{formatAmount(selectedRun.totalNet)}</span>
                  </div>

                  {/* Approval controls */}
                  {selectedRun.status === 'Draft' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedRun, 'Validated')}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer text-center"
                    >
                      Valider les calculs
                    </button>
                  )}
                  {selectedRun.status === 'Validated' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedRun, 'Approved')}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer text-center"
                    >
                      Approuver & Émettre les bulletins
                    </button>
                  )}
                  {selectedRun.status === 'Approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedRun, 'Paid')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md cursor-pointer text-center"
                    >
                      Clôturer & Verser les salaires
                    </button>
                  )}
                  {selectedRun.status === 'Paid' && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold font-mono bg-emerald-950/50 border border-emerald-900/60 px-4 py-2.5 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>TRANSMIS & ENREGISTRÉ</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Individual Payslips inside this run formatted as Table */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Liste nominative des calculs ({runPayslips.length})</h4>
                
                {runPayslips.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Chargement en cours...</p>
                ) : (
                  <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <th className="py-3 px-4">Collaborateur</th>
                          <th className="py-3 px-4">Salaire Contractuel</th>
                          <th className="py-3 px-4">Total Primes (+)</th>
                          <th className="py-3 px-4">Total Retenues (-)</th>
                          <th className="py-3 px-4 text-right">Net de Paie</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
                        {runPayslips.map((slip) => (
                          <tr key={slip.id} className="hover:bg-zinc-50/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-zinc-950 text-white flex items-center justify-center font-bold text-[10px]">
                                  {slip.employeeName[0]}
                                </div>
                                <span className="font-bold text-zinc-950">{slip.employeeName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-zinc-500">{formatAmount(slip.basicSalary)}</td>
                            <td className="py-3.5 px-4 font-mono text-emerald-600">
                              +{formatAmount(slip.bonuses.reduce((acc, b) => acc + b.amount, 0))}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-red-600">
                              -{formatAmount(slip.deductions.reduce((acc, d) => acc + d.amount, 0))}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-zinc-950 font-mono text-[13px]">
                              {formatAmount(slip.netSalary)}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                {selectedRun.status === 'Draft' && (
                                  <button 
                                    onClick={() => { setModPayslip(slip); setModifierType('bonus'); setShowModifierDialog(true); }}
                                    className="px-2.5 py-1.5 border border-zinc-200 text-zinc-600 hover:text-zinc-900 rounded-lg text-[10px] font-semibold bg-white cursor-pointer"
                                  >
                                    Modifier
                                  </button>
                                )}

                                <button 
                                  onClick={() => { setSelectedPayslip(slip); setSubTab('slip'); }}
                                  className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  Fiche
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
            </div>
          )}

          {subTab === 'slip' && selectedPayslip && (
            <div className="bg-white border border-zinc-150 rounded-[32px] p-8 max-w-2xl mx-auto shadow-sm space-y-6">
              {/* Payslip Visual Card Header */}
              <div className="flex justify-between items-start pb-6 border-b border-zinc-100">
                <div>
                  <h3 className="font-display font-bold text-xl text-zinc-900 tracking-tight">Bulletin de Paie Jefara</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Normes OHADA & Législation Camerounaise</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase px-2.5 py-1 bg-violet-50 text-violet-600 rounded-md border border-violet-100">{selectedPayslip.status === 'Paid' ? 'RÉGLÉ' : 'BROUILLON'}</span>
                  <p className="text-xs font-mono text-zinc-500 mt-2">Mois : {selectedPayslip.month} {selectedPayslip.year}</p>
                </div>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-2 gap-6 text-xs pb-6 border-b border-zinc-100">
                <div>
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">Employeur</span>
                  <span className="font-bold text-zinc-900 mt-1 block">{company.name}</span>
                  <span className="text-zinc-500 block mt-0.5">Siège : {company.country}</span>
                  {company.registrationNumber && <span className="text-zinc-500 block">N° d'enregistrement : {company.registrationNumber}</span>}
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">Salarié</span>
                  <span className="font-bold text-zinc-900 mt-1 block">{selectedPayslip.employeeName}</span>
                  <span className="text-zinc-500 block mt-0.5">ID Contrat : {selectedPayslip.employeeId}</span>
                </div>
              </div>

              {/* Calculation Ledger */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Détail des rubriques de paie</h4>
                
                <div className="divide-y divide-zinc-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-zinc-600 font-medium">Salaire de Base de Référence</span>
                    <span className="font-mono text-zinc-900">{formatAmount(selectedPayslip.basicSalary)}</span>
                  </div>

                  {/* Bonuses */}
                  {selectedPayslip.bonuses.map((b, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between text-green-700">
                      <span>(+) {b.name}</span>
                      <span className="font-mono">+{formatAmount(b.amount)}</span>
                    </div>
                  ))}

                  {/* Deductions */}
                  {selectedPayslip.deductions.map((d, idx) => (
                    <div key={idx} className="py-2.5 flex justify-between text-red-600">
                      <span>(-) {d.name}</span>
                      <span className="font-mono">-{formatAmount(d.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Pay Card */}
              <div className="p-5 bg-zinc-950 text-white rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">Net à Verser au Salarié</span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Virement bancaire direct</p>
                </div>
                <span className="text-2xl font-display font-bold">{formatAmount(selectedPayslip.netSalary)}</span>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 justify-between items-center text-[10px] text-zinc-400 font-mono">
                <div>
                  <p>ID cryptographic du bulletin : {selectedPayslip.id}</p>
                  <p className="mt-0.5">Généré par Jefara HR Suite</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleDownloadPayslipPDF(selectedPayslip)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-semibold font-sans text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger le bulletin (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSubTab('runs'); setSelectedPayslip(null); }}
                    className="flex-1 sm:flex-none px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold font-sans text-xs rounded-xl transition-colors text-center cursor-pointer"
                  >
                    Retour
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {payrollTab === 'analytics' && (
        <PayrollAnalytics company={company} payrollRuns={payrollRuns} payslips={payslips} />
      )}

      {payrollTab === 'compliance' && (
        <PayrollTaxCompliance company={company} employees={employees} payrollRuns={payrollRuns} payslips={payslips} />
      )}

      {payrollTab === 'bank' && (
        <PayrollBankTransfer company={company} employees={employees} payrollRuns={payrollRuns} payslips={payslips} />
      )}

      {payrollTab === 'simulator' && (
        <PayrollTaxSimulator company={company} />
      )}

      {payrollTab === 'history' && (
        <PayrollEmployeeHistory company={company} employees={employees} payslips={payslips} />
      )}

      {/* Modifier Dialog */}
      {showModifierDialog && modPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleAddModifier} className="bg-white border border-zinc-150 rounded-3xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h3 className="font-display font-bold text-zinc-900">Ajouter une prime ou retenue</h3>
            <p className="text-xs text-zinc-500">Ajouter des indemnités kilométriques, primes de fin d'année ou acomptes sur salaire.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Nature du modificateur</label>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setModifierType('bonus')}
                    className={`flex-1 py-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${modifierType === 'bonus' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
                  >
                    Indemnité / Prime (+)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setModifierType('deduction')}
                    className={`flex-1 py-2 rounded-xl border text-center font-semibold transition-all cursor-pointer ${modifierType === 'deduction' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
                  >
                    Retenue / Acompte (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Libellé</label>
                <input 
                  type="text" required value={modifierName} onChange={e => setModifierName(e.target.value)}
                  placeholder="Ex : Prime Exceptionnelle, Avance"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Montant</label>
                <div className="relative">
                  <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-bold">{company.currency}</span>
                  <input 
                    type="number" required value={modifierAmount} onChange={e => setModifierAmount(e.target.value)}
                    placeholder="Montant net XAF"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs">
              <button 
                type="button" onClick={() => { setShowModifierDialog(false); setModPayslip(null); }}
                className="px-4 py-2 border border-zinc-200 rounded-xl font-semibold hover:bg-zinc-50 transition-colors cursor-pointer text-zinc-700"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Appliquer le modificateur
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Cycle Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateCycle} className="bg-white border border-zinc-150 rounded-3xl p-6 w-full max-w-md shadow-lg space-y-4">
            <h3 className="font-display font-bold text-zinc-900">Lancer un nouveau cycle de paie</h3>
            <p className="text-xs text-zinc-500">Cette action calcule automatiquement les charges salariales, CNPS et émet les brouillons de bulletins.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Mois cible</label>
                <select 
                  value={month} onChange={e => setMonth(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none appearance-none"
                >
                  {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Année</label>
                <input 
                  type="number" required value={year} onChange={e => setYear(parseInt(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 text-xs font-semibold">
              <button 
                type="button" onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-700 cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="submit" disabled={creating}
                className="bg-zinc-950 hover:bg-zinc-900 text-white px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                {creating ? 'Traitement en cours...' : 'Calculer le Cycle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
