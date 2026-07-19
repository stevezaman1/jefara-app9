import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Clock, User, FileText, Calendar, 
  Briefcase, Wallet, Percent, Lock, ShieldCheck, ChevronRight
} from 'lucide-react';
import { Employee, PayrollRun, Payslip, LeaveRequest, AttendanceLog, JobPosting, JobApplication, AccountingEntry, FinancialServiceRequest, HRDocument } from '../types';

interface SidebarSearchProps {
  employees: Employee[];
  payrollRuns: PayrollRun[];
  payslips: Payslip[];
  leaveRequests: LeaveRequest[];
  attendanceLogs: AttendanceLog[];
  jobPostings: JobPosting[];
  jobApplications: JobApplication[];
  accountingEntries: AccountingEntry[];
  financialRequests: FinancialServiceRequest[];
  documents: HRDocument[];
  onNavigate: (tabId: string, subTabId: string) => void;
}

interface SearchResult {
  id: string;
  category: 'Employees' | 'Payroll' | 'Leave' | 'Attendance' | 'Recruitment' | 'Accounting' | 'Financial Services' | 'Documents';
  title: string;
  subtitle: string;
  tabId: string;
  subTabId: string;
  icon: React.ComponentType<any>;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({
  employees,
  payrollRuns,
  payslips,
  leaveRequests,
  attendanceLogs,
  jobPostings,
  jobApplications,
  accountingEntries,
  financialRequests,
  documents,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('jefara_recent_searches_sidebar');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle click outside to close results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term || term.trim() === '') return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter(t => t !== cleanTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('jefara_recent_searches_sidebar', JSON.stringify(updated));
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem('jefara_recent_searches_sidebar');
  };

  const removeRecentSearchItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(t => t !== term);
    setRecentSearches(updated);
    localStorage.setItem('jefara_recent_searches_sidebar', JSON.stringify(updated));
  };

  // Instant Search Engine compiling matches across all record sets
  const getSearchResults = (): SearchResult[] => {
    const searchStr = query.toLowerCase().trim();
    if (searchStr.length < 1) return [];

    const results: SearchResult[] = [];

    // 1. Search Employees
    employees.forEach(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`;
      if (
        fullName.toLowerCase().includes(searchStr) ||
        emp.email.toLowerCase().includes(searchStr) ||
        emp.role.toLowerCase().includes(searchStr) ||
        emp.department.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `emp-${emp.id}`,
          category: 'Employees',
          title: fullName,
          subtitle: `${emp.role} • ${emp.department}`,
          tabId: 'employees',
          subTabId: 'employees-directory',
          icon: User
        });
      }
    });

    // 2. Search Payroll (Payslips & Payroll Runs)
    payslips.forEach(ps => {
      if (
        ps.employeeName.toLowerCase().includes(searchStr) ||
        ps.month.toLowerCase().includes(searchStr) ||
        ps.year.toString().includes(searchStr)
      ) {
        results.push({
          id: `ps-${ps.id}`,
          category: 'Payroll',
          title: `Payslip: ${ps.employeeName}`,
          subtitle: `${ps.month} ${ps.year} • ${ps.netSalary.toLocaleString()} XAF`,
          tabId: 'payroll',
          subTabId: 'payroll-payslips',
          icon: FileText
        });
      }
    });

    payrollRuns.forEach(run => {
      if (
        run.month.toLowerCase().includes(searchStr) ||
        run.year.toString().includes(searchStr) ||
        run.status.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `run-${run.id}`,
          category: 'Payroll',
          title: `Payroll Run: ${run.month} ${run.year}`,
          subtitle: `Status: ${run.status} • Total Net: ${run.totalNet.toLocaleString()} XAF`,
          tabId: 'payroll',
          subTabId: 'payroll-runs',
          icon: FileText
        });
      }
    });

    // 3. Search Leave Requests
    leaveRequests.forEach(lr => {
      if (
        lr.employeeName.toLowerCase().includes(searchStr) ||
        lr.leaveType.toLowerCase().includes(searchStr) ||
        lr.reason.toLowerCase().includes(searchStr) ||
        lr.status.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `leave-${lr.id}`,
          category: 'Leave',
          title: `Leave: ${lr.employeeName}`,
          subtitle: `${lr.leaveType} (${lr.startDate} to ${lr.endDate}) • ${lr.status}`,
          tabId: 'leave',
          subTabId: 'leave-requests',
          icon: Calendar
        });
      }
    });

    // 4. Search Attendance Logs
    attendanceLogs.forEach(att => {
      if (
        att.employeeName.toLowerCase().includes(searchStr) ||
        att.date.includes(searchStr) ||
        att.status.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `att-${att.id}`,
          category: 'Attendance',
          title: `Attendance: ${att.employeeName}`,
          subtitle: `${att.date} • Status: ${att.status} • Clock-in: ${att.clockIn}`,
          tabId: 'attendance',
          subTabId: 'attendance-logs',
          icon: Clock
        });
      }
    });

    // 5. Search Recruitment (Jobs & Applications)
    jobPostings.forEach(job => {
      if (
        job.title.toLowerCase().includes(searchStr) ||
        job.department.toLowerCase().includes(searchStr) ||
        job.location.toLowerCase().includes(searchStr) ||
        job.description.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `job-${job.id}`,
          category: 'Recruitment',
          title: `Job: ${job.title}`,
          subtitle: `${job.department} • ${job.location}`,
          tabId: 'recruitment',
          subTabId: 'recruitment-jobs',
          icon: Briefcase
        });
      }
    });

    jobApplications.forEach(app => {
      if (
        app.candidateName.toLowerCase().includes(searchStr) ||
        app.jobTitle.toLowerCase().includes(searchStr) ||
        app.candidateEmail.toLowerCase().includes(searchStr) ||
        app.status.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `app-${app.id}`,
          category: 'Recruitment',
          title: `Applicant: ${app.candidateName}`,
          subtitle: `For ${app.jobTitle} • ${app.status}`,
          tabId: 'recruitment',
          subTabId: 'recruitment-candidates',
          icon: Briefcase
        });
      }
    });

    // 6. Search Accounting entries
    accountingEntries.forEach(entry => {
      if (
        entry.description.toLowerCase().includes(searchStr) ||
        (entry.category && entry.category.toLowerCase().includes(searchStr)) ||
        (entry.department && entry.department.toLowerCase().includes(searchStr)) ||
        entry.type.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `entry-${entry.id}`,
          category: 'Accounting',
          title: entry.description,
          subtitle: `${entry.type} • ${entry.amount.toLocaleString()} XAF • ${entry.date}`,
          tabId: 'accounting',
          subTabId: 'accounting-journal',
          icon: Wallet
        });
      }
    });

    // 7. Search Financial Services (Advances / Loans)
    financialRequests.forEach(req => {
      if (
        req.employeeName.toLowerCase().includes(searchStr) ||
        req.type.toLowerCase().includes(searchStr) ||
        (req.purpose && req.purpose.toLowerCase().includes(searchStr)) ||
        req.status.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `freq-${req.id}`,
          category: 'Financial Services',
          title: `${req.type}: ${req.employeeName}`,
          subtitle: `${req.amount.toLocaleString()} XAF • ${req.status} • Term: ${req.repaymentTermMonths || 1}m`,
          tabId: 'financialServices',
          subTabId: req.type === 'Salary Advance' ? 'financial-advances' : 'financial-loans',
          icon: Percent
        });
      }
    });

    // 8. Search Documents
    documents.forEach(docItem => {
      if (
        docItem.name.toLowerCase().includes(searchStr) ||
        (docItem.employeeName && docItem.employeeName.toLowerCase().includes(searchStr)) ||
        docItem.category.toLowerCase().includes(searchStr)
      ) {
        results.push({
          id: `doc-${docItem.id}`,
          category: 'Documents',
          title: docItem.name,
          subtitle: `${docItem.category} • Signed: ${docItem.signed ? 'Yes' : 'No'} ${docItem.employeeName ? `• ${docItem.employeeName}` : ''}`,
          tabId: 'documents',
          subTabId: 'documents-vault',
          icon: Lock
        });
      }
    });

    return results.slice(0, 15); // limit to top 15 results
  };

  const matches = getSearchResults();

  const handleResultClick = (res: SearchResult) => {
    saveRecentSearch(res.title);
    onNavigate(res.tabId, res.subTabId);
    setQuery('');
    setIsFocused(false);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  return (
    <div id="sidebar_search_container" ref={containerRef} className="relative w-full z-30 select-none">
      {/* Search Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-[var(--theme-primary)] text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden transition-all duration-150 font-medium"
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute right-3 p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Results Dropdown Floating Overlay */}
      {isFocused && (
        <div className="absolute top-11 left-0 right-0 max-h-96 overflow-y-auto bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 p-2 scrollbar-thin flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Recent Searches Header & Items */}
          {query.trim().length === 0 && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-2.5 py-1 text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                <span>Recent Searches</span>
                {recentSearches.length > 0 && (
                  <button 
                    onClick={clearRecentSearches}
                    className="hover:text-red-600 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {recentSearches.length === 0 ? (
                <div className="text-[11px] text-zinc-400 px-3 py-3 text-center italic">
                  No recent searches
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 mt-1">
                  {recentSearches.map((term, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleRecentClick(term)}
                      className="flex items-center justify-between px-2.5 py-1.5 hover:bg-zinc-50 rounded-xl cursor-pointer text-xs text-zinc-600 hover:text-zinc-900 group transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{term}</span>
                      </div>
                      <button 
                        onClick={(e) => removeRecentSearchItem(e, term)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-200 rounded-md text-zinc-400 hover:text-zinc-600 transition-all cursor-pointer"
                        title="Delete search history element"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Navigation suggestions */}
              <div className="mt-2.5 border-t border-zinc-100 pt-2 flex flex-col">
                <div className="px-2.5 py-1 text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                  Quick Modules
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1 p-1">
                  {[
                    { label: 'Directory', tabId: 'employees', subTabId: 'employees-directory' },
                    { label: 'Payroll Run', tabId: 'payroll', subTabId: 'payroll-runs' },
                    { label: 'Accounting', tabId: 'accounting', subTabId: 'accounting-journal' },
                    { label: 'Job Board', tabId: 'recruitment', subTabId: 'recruitment-jobs' }
                  ].map((mod, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onNavigate(mod.tabId, mod.subTabId);
                        setIsFocused(false);
                      }}
                      className="px-2.5 py-1.5 bg-zinc-50 hover:bg-zinc-100 rounded-lg text-left text-[11px] text-zinc-700 font-semibold truncate cursor-pointer transition-colors"
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Matches Found */}
          {query.trim().length > 0 && (
            <div className="flex flex-col">
              <div className="px-2.5 py-1 text-[9px] uppercase tracking-widest text-zinc-400 font-bold flex items-center justify-between">
                <span>Matching Records</span>
                <span className="text-[10px] text-zinc-500 font-normal normal-case font-mono">{matches.length} matches</span>
              </div>
              
              {matches.length === 0 ? (
                <div className="text-[11px] text-zinc-400 px-3 py-6 text-center italic">
                  No records match "{query}"
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 mt-1">
                  {matches.map((res) => {
                    const Icon = res.icon;
                    return (
                      <button
                        key={res.id}
                        onClick={() => handleResultClick(res)}
                        className="w-full flex items-center justify-between p-2 hover:bg-[var(--theme-primary-light)] rounded-xl text-left cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="h-7 w-7 rounded-lg bg-zinc-50 text-zinc-500 group-hover:bg-white group-hover:text-[var(--theme-primary)] flex items-center justify-center shrink-0 transition-colors">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="truncate text-left leading-tight">
                            <div className="text-xs font-bold text-zinc-800 group-hover:text-[var(--theme-primary)] truncate">
                              {res.title}
                            </div>
                            <div className="text-[10px] text-zinc-400 group-hover:text-zinc-500 truncate mt-0.5">
                              {res.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1 text-zinc-300 group-hover:text-[var(--theme-primary)] transition-colors">
                          <span className="text-[9px] font-bold text-zinc-400/80 group-hover:text-[var(--theme-primary)] opacity-0 group-hover:opacity-100 transition-opacity">Go</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
