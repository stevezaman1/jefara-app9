import React, { useState } from 'react';
import { Company, Employee, PayrollRun, Payslip } from '../types';
import { ShieldCheck, FileSpreadsheet, Download, HelpCircle, Building2, UserCheck } from 'lucide-react';

interface TaxComplianceProps {
  company: Company;
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
}

export default function PayrollTaxCompliance({ company, employees, payrollRuns, payslips }: TaxComplianceProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string>('all');

  // Format currency
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: company.currency, 
      minimumFractionDigits: 0 
    }).format(val);
  };

  // We can filter payslips by a specific cycle
  const cycles = payrollRuns.filter(r => r.status === 'Paid' || r.status === 'Approved' || r.status === 'Validated');
  const activeCycle = selectedCycleId === 'all' ? null : cycles.find(c => c.id === selectedCycleId);

  const filteredPayslips = activeCycle 
    ? payslips.filter(p => p.payrollRunId === activeCycle.id)
    : payslips;

  // Let's compute compliance taxes
  // CNPS Employee rate is typically 4.2% of basic (capped at 300,000 XAF)
  // CNPS Employer rate is typically 16.2% of basic (capped at 300,000 XAF)
  // IRPP is progressive, but we extracted it or estimated it
  const complianceRecords = filteredPayslips.map(slip => {
    const base = slip.basicSalary;
    const cappedBaseForCnps = Math.min(base, 300000);
    const cnpsEmployee = cappedBaseForCnps * 0.042;
    const cnpsEmployer = cappedBaseForCnps * 0.162;
    
    // Look for IRPP in deductions, default to 10% estimation if not found
    const irppDeduction = slip.deductions.find(d => d.name.includes("IRPP") || d.name.includes("Income Tax"))?.amount 
      || Math.round(base * 0.10);

    const totalEmployerCost = base + cnpsEmployer + (slip.bonuses?.reduce((acc, b) => acc + b.amount, 0) || 0);

    return {
      id: slip.id,
      employeeName: slip.employeeName,
      basicSalary: base,
      cnpsEmployee: Math.round(cnpsEmployee),
      cnpsEmployer: Math.round(cnpsEmployer),
      irpp: irppDeduction,
      cycleName: `${slip.month} ${slip.year}`,
      totalEmployerCost: Math.round(totalEmployerCost)
    };
  });

  // Calculate totals
  const totalBasic = complianceRecords.reduce((acc, r) => acc + r.basicSalary, 0);
  const totalCnpsEmployee = complianceRecords.reduce((acc, r) => acc + r.cnpsEmployee, 0);
  const totalCnpsEmployer = complianceRecords.reduce((acc, r) => acc + r.cnpsEmployer, 0);
  const totalIrpp = complianceRecords.reduce((acc, r) => acc + r.irpp, 0);
  const totalLiability = totalCnpsEmployee + totalCnpsEmployer + totalIrpp;

  // Mock download of compliance matrix
  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Collaborateur,Salaire de Base,CNPS Salariale (4.2%),CNPS Patronale (16.2%),IRPP,Masse Salariale Chargee\n";
      complianceRecords.forEach(r => {
        csvContent += `"${r.employeeName}",${r.basicSalary},${r.cnpsEmployee},${r.cnpsEmployer},${r.irpp},${r.totalEmployerCost}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `declaration_sociale_cameroun_${selectedCycleId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-bold text-zinc-900 tracking-tight">Déclarations et Cotisations Fiscales (CNPS / DGI)</h3>
          <p className="text-xs text-zinc-500 mt-1">Livre de conformité sociale récapitulant les parts salariales et patronales conformément à la loi des finances au Cameroun.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none appearance-none"
          >
            <option value="all">Tous les cycles clôturés</option>
            {cycles.map(c => (
              <option key={c.id} value={c.id}>{c.month} {c.year}</option>
            ))}
          </select>

          <button 
            onClick={handleExportCSV}
            className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exporter .CSV</span>
          </button>
        </div>
      </div>

      {/* Compliance Information box */}
      <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 text-violet-950">
        <div className="p-3 bg-white text-violet-600 rounded-xl shrink-0 shadow-sm border border-violet-100/50">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-violet-900 flex items-center gap-1">Règlementation CNPS (Plafond 2026)</h4>
          <p className="text-violet-800 leading-relaxed">
            La cotisation sociale CNPS au Cameroun est plafonnée à <strong>300 000 XAF</strong> par mois. La part salariale prélevée est de <strong>4,2%</strong> et la part patronale à la charge exclusive de l'employeur est de <strong>16,2%</strong> (incluant l'allocation familiale, la pension de vieillesse et les accidents de travail).
          </p>
        </div>
      </div>

      {/* Mini KPI Cards for liabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Cotisations CNPS Globales</span>
          <span className="text-xl font-bold text-zinc-900 font-mono mt-1 block">{formatAmount(totalCnpsEmployee + totalCnpsEmployer)}</span>
          <div className="flex justify-between text-[9px] text-zinc-400 mt-1.5 border-t border-zinc-100 pt-1.5 font-mono">
            <span>Salariale (4.2%): {formatAmount(totalCnpsEmployee)}</span>
            <span>Patronale (16.2%): {formatAmount(totalCnpsEmployer)}</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Total IRPP Collecté (Impôt)</span>
          <span className="text-xl font-bold text-zinc-900 font-mono mt-1 block">{formatAmount(totalIrpp)}</span>
          <span className="text-[9px] text-emerald-600 font-semibold mt-1.5 block">Reçu libératoire DGI</span>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Dette Sociale Totale Estimée</span>
          <span className="text-xl font-bold text-red-600 font-mono mt-1 block">{formatAmount(totalLiability)}</span>
          <span className="text-[9px] text-zinc-400 font-mono mt-1.5 block">À reverser au Trésor Public</span>
        </div>
      </div>

      {/* Main compliance ledger table */}
      <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-zinc-50 flex justify-between items-center">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Tableau Nominatif des Cotisations Fiscales</h4>
          <span className="text-[10px] font-mono text-zinc-400">{complianceRecords.length} Bulletins analysés</span>
        </div>

        {complianceRecords.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 italic">Aucun bulletin de paie disponible pour l'analyse fiscale.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <th className="py-3 px-4">Salarié</th>
                <th className="py-3 px-4">Cycle</th>
                <th className="py-3 px-4 text-right">Salaire Base</th>
                <th className="py-3 px-4 text-right text-indigo-600">CNPS Salariale (4.2%)</th>
                <th className="py-3 px-4 text-right text-indigo-800">CNPS Patronale (16.2%)</th>
                <th className="py-3 px-4 text-right text-amber-700">IRPP Retenu</th>
                <th className="py-3 px-4 text-right">Masse Salariale Chargée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
              {complianceRecords.map((rec, index) => (
                <tr key={rec.id + '-' + index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">{rec.employeeName}</td>
                  <td className="py-3.5 px-4 text-zinc-400 text-[10px] uppercase font-mono">{rec.cycleName}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-500">{formatAmount(rec.basicSalary)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-indigo-600">-{formatAmount(rec.cnpsEmployee)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-indigo-800">+{formatAmount(rec.cnpsEmployer)}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-[11px] text-amber-700">-{formatAmount(rec.irpp)}</td>
                  <td className="py-3.5 px-4 text-right font-bold font-mono text-zinc-900">{formatAmount(rec.totalEmployerCost)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-zinc-50/80 font-bold border-t-2 border-zinc-100">
                <td className="py-3.5 px-4 text-zinc-900 uppercase">TOTAUX CUMULÉS</td>
                <td className="py-3.5 px-4"></td>
                <td className="py-3.5 px-4 text-right font-mono">{formatAmount(totalBasic)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-indigo-600">-{formatAmount(totalCnpsEmployee)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-indigo-800">+{formatAmount(totalCnpsEmployer)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-amber-700">-{formatAmount(totalIrpp)}</td>
                <td className="py-3.5 px-4 text-right font-mono text-zinc-900">{formatAmount(totalBasic + totalCnpsEmployer)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
