import React, { useState } from 'react';
import { Company } from '../types';
import { HelpCircle, Sparkles, RefreshCw, Calculator, TrendingUp } from 'lucide-react';

interface TaxSimulatorProps {
  company: Company;
}

export default function PayrollTaxSimulator({ company }: TaxSimulatorProps) {
  const [basicSalaryInput, setBasicSalaryInput] = useState<string>('250000');
  const [transportAllowanceInput, setTransportAllowanceInput] = useState<string>('25000');
  const [otherAllowancesInput, setOtherAllowancesInput] = useState<string>('15000');

  // Parse inputs
  const basicSalary = parseFloat(basicSalaryInput) || 0;
  const transportAllowance = parseFloat(transportAllowanceInput) || 0;
  const otherAllowances = parseFloat(otherAllowancesInput) || 0;

  // Cameroon statutory rules for computation
  const grossSalary = basicSalary + transportAllowance + otherAllowances;
  const cappedCnpsBase = Math.min(basicSalary, 300000);

  // 1. Employee Deductions
  const cnpsEmployee = cappedCnpsBase * 0.042; // 4.2%
  const irppEstimate = basicSalary * 0.10; // Approx 10% simplified
  const creditFoncierEmployee = grossSalary * 0.01; // 1%
  const communalTaxEstimate = irppEstimate * 0.10; // Centimes additionnels (10% of IRPP)

  const totalEmployeeDeductions = cnpsEmployee + irppEstimate + creditFoncierEmployee + communalTaxEstimate;
  const netSalary = grossSalary - totalEmployeeDeductions;

  // 2. Employer Contributions
  const cnpsEmployer = cappedCnpsBase * 0.162; // 16.2%
  const creditFoncierEmployer = grossSalary * 0.015; // 1.5%
  const fneEmployer = grossSalary * 0.01; // National Employment Fund (1%)
  
  const totalEmployerCharges = cnpsEmployer + creditFoncierEmployer + fneEmployer;
  const totalCompanyCost = grossSalary + totalEmployerCharges;

  // Ratio calculations
  const efficiencyRatio = totalCompanyCost > 0 ? (netSalary / totalCompanyCost) * 100 : 0;
  const taxRatio = totalCompanyCost > 0 ? ((totalEmployeeDeductions + totalEmployerCharges) / totalCompanyCost) * 100 : 0;

  // Format currency
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: company.currency, 
      minimumFractionDigits: 0 
    }).format(val);
  };

  const handleReset = () => {
    setBasicSalaryInput('250000');
    setTransportAllowanceInput('25000');
    setOtherAllowancesInput('15000');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-lg font-display font-bold text-zinc-900 tracking-tight">Simulateur de Salaires & Charges Sociales</h3>
        <p className="text-xs text-zinc-500 mt-1">Outil d'aide à la décision pour simuler le coût d'une embauche, estimer les taxes salariales et calculer le salaire net.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-[28px] p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-50">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-violet-600" />
              <span>Paramètres de Simulation</span>
            </h4>
            <button 
              onClick={handleReset}
              className="text-[10px] text-zinc-400 font-bold hover:text-zinc-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Réinitialiser
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Basic Contractual Salary */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Salaire de Base de Référence</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={basicSalaryInput} 
                  onChange={(e) => setBasicSalaryInput(e.target.value)}
                  placeholder="Ex : 250000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 focus:outline-none font-semibold text-zinc-800"
                />
                <span className="absolute right-3 top-2.5 font-bold text-zinc-400">XAF / mois</span>
              </div>
              <p className="text-[9px] text-zinc-400 italic">Sert de base de calcul pour la pension CNPS (part salariale de 4,2%).</p>
            </div>

            {/* Transport Allowance */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Indemnité de Transport Mensuelle</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={transportAllowanceInput} 
                  onChange={(e) => setTransportAllowanceInput(e.target.value)}
                  placeholder="Ex : 25000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 focus:outline-none font-semibold text-zinc-800"
                />
                <span className="absolute right-3 top-2.5 font-bold text-zinc-400">XAF / mois</span>
              </div>
              <p className="text-[9px] text-zinc-400">Standard légal recommandé au Cameroun pour frais de déplacement.</p>
            </div>

            {/* Other Allowances */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Autres Primes & Indemnités</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={otherAllowancesInput} 
                  onChange={(e) => setOtherAllowancesInput(e.target.value)}
                  placeholder="Ex : 15000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 focus:outline-none font-semibold text-zinc-800"
                />
                <span className="absolute right-3 top-2.5 font-bold text-zinc-400">XAF / mois</span>
              </div>
              <p className="text-[9px] text-zinc-400">Primes d'assiduité, de rendement, heures supplémentaires brutes, etc.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Summary and Breakdown */}
        <div className="lg:col-span-7 bg-white border border-zinc-100 rounded-[28px] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider pb-2 border-b border-zinc-50">Récapitulatif des Calculs Légaux</h4>
            
            {/* Major Totals block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/60 rounded-2xl">
                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Salaire NET Perçu par le salarié</span>
                <span className="text-2xl font-bold font-mono text-emerald-950 block mt-1.5">{formatAmount(netSalary)}</span>
                <p className="text-[9px] text-emerald-700/80 mt-1">Représente {efficiencyRatio.toFixed(1)}% du coût total entreprise.</p>
              </div>

              <div className="p-4 bg-violet-50/50 border border-violet-100/60 rounded-2xl">
                <span className="text-[10px] text-violet-800 font-bold uppercase tracking-wider">Coût GLOBAL Mensuel Employeur</span>
                <span className="text-2xl font-bold font-mono text-violet-950 block mt-1.5">{formatAmount(totalCompanyCost)}</span>
                <p className="text-[9px] text-violet-700/80 mt-1">Salaire brut chargé des cotisations patronales.</p>
              </div>
            </div>

            {/* Detail comparative table */}
            <div className="border border-zinc-150 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Rubrique Légale</th>
                    <th className="py-2.5 px-4 text-right">Part Salarié (-)</th>
                    <th className="py-2.5 px-4 text-right">Part Employeur (+)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  <tr>
                    <td className="py-2 px-4 font-semibold text-zinc-900">Salaire Brut de Base (Simulé)</td>
                    <td className="py-2 px-4 text-right font-mono">-</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-zinc-800">{formatAmount(grossSalary)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Cotisation CNPS (4,2% salarial vs 16,2% patronal)</td>
                    <td className="py-2 px-4 text-right font-mono text-red-500">-{formatAmount(cnpsEmployee)}</td>
                    <td className="py-2 px-4 text-right font-mono text-indigo-700">+{formatAmount(cnpsEmployer)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Crédit Foncier / CFC (1% vs 1.5%)</td>
                    <td className="py-2 px-4 text-right font-mono text-red-500">-{formatAmount(creditFoncierEmployee)}</td>
                    <td className="py-2 px-4 text-right font-mono text-indigo-700">+{formatAmount(creditFoncierEmployer)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Fonds National de l'Emploi / FNE (employeur 1%)</td>
                    <td className="py-2 px-4 text-right font-mono">-</td>
                    <td className="py-2 px-4 text-right font-mono text-indigo-700">+{formatAmount(fneEmployer)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Impôt sur le Revenu / IRPP estimé</td>
                    <td className="py-2 px-4 text-right font-mono text-red-500">-{formatAmount(irppEstimate)}</td>
                    <td className="py-2 px-4 text-right font-mono">-</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-zinc-500 italic">Centimes Additionnels Communaux (10% IRPP)</td>
                    <td className="py-2 px-4 text-right font-mono text-red-400">-{formatAmount(communalTaxEstimate)}</td>
                    <td className="py-2 px-4 text-right font-mono">-</td>
                  </tr>
                  <tr className="bg-zinc-50/50 font-bold border-t border-zinc-200">
                    <td className="py-2.5 px-4">Sous-Totaux des retenues & charges</td>
                    <td className="py-2.5 px-4 text-right font-mono text-red-600">-{formatAmount(totalEmployeeDeductions)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-indigo-900">+{formatAmount(totalEmployerCharges)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Efficiency indicators */}
          <div className="pt-6 border-t border-zinc-150 mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 font-bold text-zinc-500">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Charges globales de l'État : {taxRatio.toFixed(1)}% du budget total.
            </span>
            <span className="text-zinc-400">Simulateur basé sur le code général des impôts Cameroun.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
