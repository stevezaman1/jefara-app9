import React, { useState } from 'react';
import { Company, Employee, PayrollRun, Payslip } from '../types';
import { Landmark, Download, CheckCircle, FileJson, Printer, Building } from 'lucide-react';

interface BankTransferProps {
  company: Company;
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
}

export default function PayrollBankTransfer({ company, employees, payrollRuns, payslips }: BankTransferProps) {
  const [selectedRunId, setSelectedRunId] = useState<string>('all');
  const [disbursing, setDisbursing] = useState(false);
  const [disburseSuccess, setDisburseSuccess] = useState(false);

  // Format currency
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: company.currency, 
      minimumFractionDigits: 0 
    }).format(val);
  };

  // Get runs
  const approvedRuns = payrollRuns.filter(r => r.status === 'Approved' || r.status === 'Paid');
  const activeRun = selectedRunId === 'all' ? null : approvedRuns.find(r => r.id === selectedRunId);

  const filteredPayslips = activeRun 
    ? payslips.filter(p => p.payrollRunId === activeRun.id)
    : payslips.filter(p => p.status === 'Paid');

  // Let's create mock bank details for employees if they don't have them
  const bankAccounts = filteredPayslips.map(slip => {
    // Retrieve employee info
    const emp = employees.find(e => e.id === slip.employeeId);
    
    // Standard Cameroun RIB structure (approx 23 chars: Code Banque, Code Guichet, Clé RIB)
    // Afriland First Bank (10005), SG Cameroun (10003), BICEC (10001)
    const mockBanks = ["Afriland First Bank Cameroun", "Société Générale Cameroun (SGC)", "BICEC Cameroun", "UBA Cameroon", "Commercial Bank-Cameroon (CBC)"];
    const bankIndex = Math.abs(slip.employeeId.charCodeAt(0) || 0) % mockBanks.length;
    
    const bankName = mockBanks[bankIndex];
    const bankCode = 10000 + bankIndex * 2 + 1;
    const branchCode = "0200" + (bankIndex + 1);
    const accNum = "0120" + Math.abs(slip.employeeId.charCodeAt(1) || 0) + "45678" + (bankIndex * 3);
    const ribKey = "5" + bankIndex;

    const ribString = `CM21 ${bankCode} ${branchCode} ${accNum} ${ribKey}`;

    return {
      id: slip.id,
      employeeName: slip.employeeName,
      bankName,
      accountNumber: ribString,
      netSalary: slip.netSalary,
      cycleName: `${slip.month} ${slip.year}`,
      status: slip.status
    };
  });

  const totalDisbursement = bankAccounts.reduce((acc, b) => acc + b.netSalary, 0);

  const handleDownloadXML = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        bankInstruction: {
          initiator: company.name,
          nationalRegistration: company.registrationNumber || "CM-REG-JEFARA-01",
          currency: "XAF",
          totalAmount: totalDisbursement,
          paymentDate: new Date().toISOString().split('T')[0],
          recipients: bankAccounts.map(b => ({
            name: b.employeeName,
            bank: b.bankName,
            rib: b.accountNumber,
            amount: b.netSalary,
            description: `Virement de Salaire Cycle ${b.cycleName}`
          }))
        }
      }, null, 2));

      const link = document.createElement("a");
      link.setAttribute("href", dataStr);
      link.setAttribute("download", `ordre_virement_bancaire_${selectedRunId}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    }
  };

  const triggerMockDisbursement = () => {
    setDisbursing(true);
    setTimeout(() => {
      setDisbursing(false);
      setDisburseSuccess(true);
      setTimeout(() => setDisburseSuccess(false), 4000);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-display font-bold text-zinc-900 tracking-tight">Ordres de Virement & Paiements Bancaires</h3>
          <p className="text-xs text-zinc-500 mt-1">Préparation des bordereaux de virement multilatéraux et fichiers de liaison bancaire (Format d'intégration Afriland, SGC, BICEC).</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <select
            value={selectedRunId}
            onChange={(e) => setSelectedRunId(e.target.value)}
            className="bg-white border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none appearance-none"
          >
            <option value="all">Tous les versements clos</option>
            {approvedRuns.map(r => (
              <option key={r.id} value={r.id}>{r.month} {r.year} ({r.status})</option>
            ))}
          </select>

          <button 
            disabled={bankAccounts.length === 0}
            onClick={handleDownloadXML}
            className="bg-zinc-950 hover:bg-zinc-900 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-xl transition-all font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileJson className="h-3.5 w-3.5" />
            <span>Fichier Interbancaire JSON</span>
          </button>
        </div>
      </div>

      {/* Summary Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Volume des Virements</span>
            <span className="text-2xl font-bold font-mono text-zinc-900 block mt-1">{formatAmount(totalDisbursement)}</span>
          </div>
          <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl">
            <Landmark className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Transactions nominatives</span>
            <span className="text-2xl font-bold font-mono text-zinc-900 block mt-1">{bankAccounts.length}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Building className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xs flex items-stretch flex-col justify-center">
          {disburseSuccess ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
              <CheckCircle className="h-4 w-4" />
              <span>Transmis avec succès !</span>
            </div>
          ) : (
            <button
              onClick={triggerMockDisbursement}
              disabled={bankAccounts.length === 0 || disbursing}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-xs transition-all shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              {disbursing ? (
                <>
                  <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signature cryptographique...</span>
                </>
              ) : (
                <span>Transmettre l'Ordre à la Banque</span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Bank table */}
      <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-zinc-50 flex justify-between items-center">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Bordereau Nominatif des Versements (Virements SEPA/BEAC)</h4>
          <span className="text-[10px] font-mono text-zinc-400">{bankAccounts.length} Comptes à créditer</span>
        </div>

        {bankAccounts.length === 0 ? (
          <div className="p-10 text-center text-zinc-400 italic">Aucun virement en attente de traitement.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <th className="py-3 px-4">Bénéficiaire</th>
                <th className="py-3 px-4">Établissement Bancaire</th>
                <th className="py-3 px-4">Clé RIB / Numéro de Compte</th>
                <th className="py-3 px-4">Cycle Associé</th>
                <th className="py-3 px-4 text-right">Montant Net (XAF)</th>
                <th className="py-3 px-4">Statut de Paie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
              {bankAccounts.map((b, idx) => (
                <tr key={b.id + '-' + idx} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-zinc-900">{b.employeeName}</td>
                  <td className="py-3.5 px-4 text-zinc-500">{b.bankName}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">{b.accountNumber}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] uppercase text-zinc-400">{b.cycleName}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-zinc-950 font-mono text-sm">{formatAmount(b.netSalary)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {b.status === 'Paid' ? 'CLOSED (REGLE)' : 'APPROUVE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
