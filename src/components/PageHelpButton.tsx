import React, { useState } from 'react';
import { HelpCircle, X, ShieldCheck, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PageHelpButtonProps {
  module: string;
}

const MODULE_HELP_DATA: Record<string, { title: string; desc: string; tips: string[] }> = {
  dashboard: {
    title: "Company Overview Support",
    desc: "This central dashboard aggregates enterprise telemetry across Cameroon and regional divisions. It features real-time charts on employee allocation, base wage distribution, and instant action queue items.",
    tips: [
      "View active payroll runs or pending leave requests that need urgent approval.",
      "Check the Workspace Profile Integrity score to ensure essential tax rates are configured.",
      "The gross salary distribution displays the base wage spread of all contract staff."
    ]
  },
  employees: {
    title: "Employee Directory & Structure Help",
    desc: "Manage the core employee lifecycle, department rosters, staff categories, and historical records. From this panel, you can add new hires, execute offboarding protocols, or archive inactive profiles.",
    tips: [
      "Use the 'Employee Directory' tab to view contact files and basic salary specifications.",
      "Add a new employee using the quick registration form which initializes their digital folder.",
      "The 'Organization Chart' visualizes departmental hierarchies dynamically."
    ]
  },
  payroll: {
    title: "Payroll & CNPS Calculation Help",
    desc: "Oversee the salary calculation engine. This module computes statutory social security rates (e.g. employer CNPS liability at 16.2% and employee rate at 4.2%), base income tax (IRPP), and custom adjustments.",
    tips: [
      "Generate new payroll cycles under 'Payroll Runs'. Always execute validation before approval.",
      "Review 'Payslips' to distribute digital earnings statements to staff securely.",
      "Specify company-wide allowances and deductions that affect monthly net calculation."
    ]
  },
  leave: {
    title: "Leave & Absence Management Help",
    desc: "Administer leave requests (Annual, Sick, Maternity, Paternity, and Unpaid leaves). Set up automatic or administrative approval thresholds and monitor general absences.",
    tips: [
      "The 'Approval Queue' lists pending leave submissions with clear start/end dates.",
      "Check the 'Team Calendar' to avoid simultaneous staff absences in the same department.",
      "Configure standard annual leave policies under system-wide leaves."
    ]
  },
  attendance: {
    title: "Time, Attendance & Overtime Help",
    desc: "Monitor staff working schedules, clock-in times, clock-outs, and early departure tracking. Employees can log their attendance via office network nodes or secure remote tunnels.",
    tips: [
      "Identify late arrivals or unexplained absences under 'Attendance Logs'.",
      "The 'Clock In / Out' sub-view simulates an interactive workspace terminal.",
      "Approve overtime hours so they automatically flow into the next payroll cycle as bonuses."
    ]
  },
  recruitment: {
    title: "Talent Acquisition & Pipelines Help",
    desc: "Manage open job vacancies, interview schedules, applicant files, and the digital onboarding checklist. Track applicant progress through five standardized stages: Applied, Screening, Interview, Offered, and Hired.",
    tips: [
      "Update job postings instantly. Candidates will match specific grade codes.",
      "Track notes and email records on each applicant inside candidate folders.",
      "Hiring an applicant automatically prompts the system to initialize an Employee profile."
    ]
  },
  accounting: {
    title: "General Ledger & Expenses Help",
    desc: "Execute double-entry bookkeeping synchronization. This panel maps monthly base salaries and CNPS liabilities directly to primary employer ledger accounts.",
    tips: [
      "Review automatic salary entries logged under the standard 'Journal Entries' tab.",
      "Track staff 'Expense Claims' with attached electronic invoices.",
      "Specify distinct cost centers to evaluate performance across Cameroon subdivisions."
    ]
  },
  financialServices: {
    title: "Staff Financial Services Help",
    desc: "Administer specialized welfare and retention programs. This node supports micro-loans, interest-free salary advances, local savings plans, and automatic payroll auto-deductions.",
    tips: [
      "Salary advances are capped by default to protect employee net income.",
      "Specify repayment term lengths in months. The engine auto-deducts fractional sums on payslips.",
      "Track active repayment balances and status logs under 'Repayments'."
    ]
  },
  documents: {
    title: "Digital Vault & Contracts Help",
    desc: "Store critical legal records, labor standards, contracts, and degrees in a secure file vault. Request double-encrypted paperless signatures on contracts.",
    tips: [
      "Filter documents by category: Contracts, Certificates, Tax forms, or Payslips.",
      "Contracts awaiting electronic signature show up in orange alert states.",
      "Completed and signed files generate immutable log timestamps for auditing."
    ]
  },
  analytics: {
    title: "HR Analytics & BI Dashboard Help",
    desc: "Access business intelligence dashboards. Monitor aggregate personnel counts, average gross base wage, monthly net payroll expenses, and forecast future liabilities.",
    tips: [
      "Select custom variables to generate unique PDF-exportable executive summaries.",
      "The system computes linear models to predict future staffing costs.",
      "Evaluate cross-departmental productivity by correlating attendance and salary averages."
    ]
  },
  settings: {
    title: "System Config & Workspace Settings Help",
    desc: "Adjust enterprise-wide variables, including custom departments, grade-specific minimum and maximum base wage limits, administrative user roles, and CNPS tax rates.",
    tips: [
      "Changes to 'Grades' immediately define the salary brackets allowed during hiring.",
      "Configure standard workflow parameters to set double-signature validation policies.",
      "Modify the Workspace palette theme from violet to emerald or midnight black."
    ]
  }
};

export const PageHelpButton: React.FC<PageHelpButtonProps> = ({ module }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const helpData = MODULE_HELP_DATA[module] || MODULE_HELP_DATA.dashboard;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;

    setIsSubmitting(true);
    // Simulate sending an encrypted support ticket to Jefara support
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTicketMessage('');
    }, 1200);
  };

  return (
    <div id={`help_module_${module}`} className="relative shrink-0 select-none">
      {/* Floating or Contextual Help Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setSubmitted(false);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 font-semibold text-xs transition-all duration-150 cursor-pointer shadow-xs shrink-0"
        title={`Help context: ${helpData.title}`}
      >
        <HelpCircle className="h-4 w-4 text-[var(--theme-primary)] animate-pulse" />
        <span>Help</span>
      </button>

      {/* Slide-over Help Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[110]"
            />

            {/* Slide-over */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white z-[120] shadow-2xl flex flex-col p-6 h-full border-l border-zinc-200 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-150 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[var(--theme-primary-light)] text-[var(--theme-primary)] rounded-lg">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <h3 className="font-display font-bold text-sm text-zinc-900 truncate max-w-[200px] md:max-w-[240px]">
                    {helpData.title}
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-5 scrollbar-thin text-xs">
                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">Overview</span>
                  <p className="text-zinc-600 leading-relaxed font-medium">
                    {helpData.desc}
                  </p>
                </div>

                {/* Practical Tips */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">Operational Tips</span>
                  <div className="flex flex-col gap-2">
                    {helpData.tips.map((tip, idx) => (
                      <div key={idx} className="flex gap-2.5 p-2.5 bg-zinc-50 border border-zinc-150 rounded-xl">
                        <span className="h-4 w-4 rounded-full bg-[var(--theme-primary)] text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-zinc-600 leading-tight font-medium">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Support Form or Ticket */}
                <div className="border-t border-zinc-150 pt-5 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Encrypted Support Ticket
                  </span>

                  {submitted ? (
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl text-center space-y-2"
                    >
                      <div className="h-8 w-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                        <Check className="h-4 w-4" />
                      </div>
                      <h4 className="font-bold text-emerald-800 text-xs">Ticket Sent Successfully</h4>
                      <p className="text-[11px] text-emerald-600 leading-normal">
                        Your administrative support request has been cryptographic-routed. Operators will respond within 12 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-3">
                      <p className="text-zinc-500 leading-relaxed font-medium">
                        Need immediate expert assistance from the Jefara Cameroon Support? Describe your issue to create an automated support token.
                      </p>
                      <textarea
                        required
                        rows={3}
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Type your support request or question..."
                        className="w-full p-2.5 bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-[var(--theme-primary)] rounded-xl text-xs placeholder-zinc-400 text-zinc-800 focus:outline-hidden resize-none transition-all duration-150 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting || !ticketMessage.trim()}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--theme-primary)] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Submit Support Ticket</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-zinc-150 shrink-0 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                <span>Sec-ID: AE-813</span>
                <span>UTC Enforced</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
