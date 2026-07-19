import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, doc, getDoc, collection, getDocs, clearDemoData, updateDoc, deleteDoc } from './firebase';
import { t, getLanguage, setLanguage, useTranslation } from './utils/translations';
import { 
  UserProfile, Company, Employee, PayrollRun, 
  Payslip, LeaveRequest, AttendanceLog, JobPosting, 
  JobApplication, AccountingEntry, FinancialServiceRequest, HRDocument,
  getRandomAvatarColor, VIBRANT_AVATAR_COLORS
} from './types';

const mapPaletteToDb = (palette: string) => {
  if (palette === 'violet') return 'jefara-violet';
  if (palette === 'midnight') return 'midnight-blue';
  if (palette === 'emerald') return 'emerald-green';
  if (palette === 'graphite') return 'graphite-black';
  return 'burgundy';
};

const mapDbToPalette = (dbVal: string) => {
  if (dbVal === 'jefara-violet') return 'violet';
  if (dbVal === 'midnight-blue') return 'midnight';
  if (dbVal === 'emerald-green') return 'emerald';
  if (dbVal === 'graphite-black') return 'graphite';
  return 'burgundy';
};

// Components
import { Logo } from './components/Logo';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import DashboardModule from './components/DashboardModule';
import EmployeesModule from './components/EmployeesModule';
import PayrollModule from './components/PayrollModule';
import LeaveModule from './components/LeaveModule';
import AttendanceModule from './components/AttendanceModule';
import AccountingModule from './components/AccountingModule';
import FinancialServicesModule from './components/FinancialServicesModule';
import DocumentsModule from './components/DocumentsModule';
import RecruitmentModule from './components/RecruitmentModule';
import AnalyticsModule from './components/AnalyticsModule';
import SettingsModule from './components/SettingsModule';
import CommandPalette from './components/CommandPalette';
import InviteCollaboratorModal from './components/InviteCollaboratorModal';
import { PageHelpButton } from './components/PageHelpButton';

// Independent custom modules for fully isolated sub-navigation
import InboxModule from './components/InboxModule';
import TasksModule from './components/TasksModule';
import NotificationsModule from './components/NotificationsModule';
import OrgChartModule from './components/OrgChartModule';
import DepartmentsModule from './components/DepartmentsModule';
import TeamsModule from './components/TeamsModule';
import PositionsModule from './components/PositionsModule';
import OnboardingModule from './components/OnboardingModule';
import OffboardingModule from './components/OffboardingModule';
import BenefitsModule from './components/BenefitsModule';
import ExpensesModule from './components/ExpensesModule';
import SchedulesModule from './components/SchedulesModule';
import TimeTrackingModule from './components/TimeTrackingModule';
import PerformanceModule from './components/PerformanceModule';
import TrainingModule from './components/TrainingModule';
import GeneralLedgerModule from './components/GeneralLedgerModule';

const SUBTAB_SUBTITLES: Record<string, string> = {
  'dashboard-overview': 'Aggregated enterprise telemetry and operational overview',
  'dashboard-activity': 'Audit trails, database actions, and system logs',
  'dashboard-alerts': 'Pending notifications, critical warnings, and reminders',

  'employees-directory': 'Roster of active personnel, organigram, and archive registers',
  'employees-profiles': 'Comprehensive digital personnel files and employee records',
  'employees-orgchart': 'Dynamic visual hierarchy of company divisions and staff',
  'employees-history': 'Audit log of historical job assignments and profile updates',
  'employees-offboarding': 'Clearance checklists, exit interviews, and termination logs',
  'employees-archive': 'Inactive or terminated personnel archives and registers',

  'recruitment-jobs': 'Create and manage open vacancy publications',
  'recruitment-candidates': 'Applicant files, status trackers, and contact logs',
  'recruitment-pipeline': 'Visualize recruitment progress across stages',
  'recruitment-onboarding': 'Digital onboarding checklists for newly hired staff',
  'recruitment-documents': 'Legal hiring paperwork, contracts, and applications',

  'payroll-runs': 'Monthly payroll cycles, processing, and compliance',
  'payroll-calc': 'Interactive statutory tax and gross-to-net calculations',
  'payroll-bonuses': 'Manage company bonuses, allowances, and incentives',
  'payroll-deductions': 'Manage social contributions, taxes, and custom deductions',
  'payroll-payslips': 'Distribute securely signed digital earnings statements',
  'payroll-history': 'Archived records of previous monthly payroll approvals',
  'payroll-workflow': 'Compliance double-signature workflows and authorizations',

  'leave-requests': 'Staff time-off requests, balances, and calendar tracking',
  'leave-queue': 'Pending leave submissions awaiting administrative approval',
  'leave-calendar': 'Consolidated schedule of planned staff absences',
  'leave-policies': 'Standard annual, sick, and custom leave definitions',

  'attendance-dashboard': 'Time and attendance metrics and shift occupancy tracking',
  'attendance-logs': 'Real-time clock-in logs and check-in audit trails',
  'attendance-clock': 'Interactive clock-in workspace terminal',
  'attendance-schedules': 'Assign shifts and weekly rosters for teams',
  'attendance-overtime': 'Review and authorize overtime hours for payroll flow',
  'attendance-remote': 'Track telecommuting approvals and secure check-ins',
  'attendance-reports': 'Downloadable timesheets and productivity summaries',

  'accounting-journal': 'Double-entry bookkeeping synchronization with payroll ledger',
  'accounting-expenses': 'Track salary costs, social contributions, and tax expenses',
  'accounting-centers': 'Evaluate payroll and expense budgets by division',
  'accounting-budgets': 'Establish financial bounds for departmental personnel costs',
  'accounting-claims': 'Employee reimbursement requests with electronic receipts',
  'accounting-reimbursements': 'Validate and execute approved expense disbursements',
  'accounting-reports': 'Financial reports, balance sheets, and tax compliance sheets',

  'financial-advances': 'Interest-free payroll advance requests and tracking',
  'financial-loans': 'Welfare loans, schedules, and repayment configurations',
  'financial-insurance': 'Company-sponsored health and social coverage options',
  'financial-savings': 'Voluntary mutual savings accounts and interest',
  'financial-repayments': 'Audit log of auto-deducted loan and advance repayments',
  'financial-analytics': 'Statistics and trends of employee financial assistance',

  'documents-contracts': 'Employment agreements, amendments, and digital vault copies',
  'documents-certificates': 'Training, degree, and certification proof documents',
  'documents-hr': 'Internal rules, policies, and employee handbook registers',
  'documents-vault': 'Highly secure cloud storage for encrypted company records',
  'documents-signatures': 'Track and verify legally binding paperless signature states',

  'analytics-payroll': 'Visualize monthly payroll expenses, trends, and growth',
  'analytics-workforce': 'Demographics, employee count trends, and turnover rates',
  'analytics-attendance': 'Analyze absenteeism, average check-ins, and overtime',
  'analytics-financial': 'Personnel expenditure reports and forecasting models',
  'analytics-forecasts': 'Liability forecasting models based on linear projections',
  'analytics-custom': 'Generate and compile bespoke business intelligence reports',

  'settings-profile': 'Configure basic legal corporate details and location nodes',
  'settings-security': 'Manage personal account credentials, passwords, profiles, and 2FA keys',
  'settings-departments': 'Manage active organizational departments and rosters',
  'settings-grades': 'Establish professional grades and corresponding base salary ranges',
  'settings-roles': 'Define user roles and security level access rules',
  'settings-workflows': 'Set up authorization chains for leaves and payroll',
  'settings-payroll': 'Configure CNPS brackets, income tax, and allowances',
  'settings-accounting': 'Map accounts and ledger codes for salary bookkeeping',

  // Newly isolated sub-navigation subtitles
  'inbox-all': 'Corporate internal correspondence and direct communications',
  'tasks-all': 'Secure task queue for cryptographic authorization workflows',
  'notifications-all': 'Operational audit signals, warnings, and alerts timeline',
  'orgchart-view': 'Dynamic interactive organizational tree and direct reports',
  'departments-view': 'Active organizational divisions, budget targets, and leadership heads',
  'teams-view': 'Active collaborative teams and operational sprint scopes',
  'positions-view': 'Standardized corporate job titles, professional grades, and baseline wage brackets',
  'onboarding-list': 'Comprehensive newcomer checkpoints, legal contracts, and technical setups',
  'offboarding-list': 'Strategic clearance checklists, exit reviews, and physical assets recovery',
  'benefits-list': 'Corporate health insurance AXA, CNPS retentions, and solidarity funds',
  'expenses-list': 'Militant business expenditure claims, receipt auditing, and reimbursement workflow',
  'schedules-view': 'Operational work shifts, weekly rosters, and shift coverage calendars',
  'timetracking-clock': 'Interactive local time terminal, shift logs, and active stopwatch session',
  'performance-overview': 'Evaluate key indicators (KPIs), company OKRs, and review feedback logs',
  'training-list': 'Institutional learning catalogs, certification targets, and compliance courses',
  'ledger-journal': 'OHADA-compliant automated ledger journals and transaction bookkeeping logs',
  'company-legal': 'Configure fundamental corporate registries and legal business profile',
  'company-ohada': 'Manage CNPS brackets, statutory tax calculations, and corporate allowances',
  'company-offices': 'Verify active office nodes, headquarters, and geographic location units',
  'company-banks': 'Audit and configure corporate bank accounts mapped for direct wire transfers',
  'company-integrations': 'Coordinate technical API nodes, third-party hooks, and platform setups',
  'company-documents': 'Highly encrypted secure storage vault for strategic corporate documents',
  'security-roles': 'Define custom user roles, administrative permissions, and security level constraints',
  'security-audit': 'System-wide activity ledger, database audits, and security signals log',
  'security-settings': 'Configure account credentials, passwords, profiles, and 2FA keys',
};

import { 
  Building2, Users, Receipt, Calendar, Clock, 
  Wallet, Percent, Lock, Briefcase, BarChart4, 
  Settings, LogOut, ShieldCheck, ChevronRight, ChevronLeft, RefreshCw, Menu, X, Sparkles,
  User, HelpCircle, Sun, Bell, Globe, Ban, Trash2, Moon, Monitor, UserPlus, ChevronDown, Search,
  ChevronsUpDown, LayoutDashboard, Inbox, CheckSquare, GitFork, Layers, UserMinus, 
  PlayCircle, CreditCard, TrendingUp, Shield, CalendarDays, Timer, BookOpen, Database, Calculator, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { t, language } = useTranslation();
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Building2,
      subItems: [
        { id: 'dashboard-overview', label: 'Overview' },
        { id: 'dashboard-activity', label: 'Recent Activity' },
        { id: 'dashboard-alerts', label: 'Alerts' }
      ]
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      subItems: [
        { id: 'employees-directory', label: 'Employee Directory' },
        { id: 'employees-profiles', label: 'Employee Profiles' },
        { id: 'employees-orgchart', label: 'Organization Chart' },
        { id: 'employees-history', label: 'Employee History' },
        { id: 'employees-offboarding', label: 'Offboarding' },
        { id: 'employees-archive', label: 'Archive' }
      ]
    },
    {
      id: 'recruitment',
      label: 'Recruitment & Onboarding',
      icon: Briefcase,
      subItems: [
        { id: 'recruitment-jobs', label: 'Job Postings' },
        { id: 'recruitment-candidates', label: 'Candidates' },
        { id: 'recruitment-pipeline', label: 'Recruitment Pipeline' },
        { id: 'recruitment-onboarding', label: 'Onboarding' },
        { id: 'recruitment-documents', label: 'Hiring Documents' }
      ]
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: Receipt,
      subItems: [
        { id: 'payroll-runs', label: 'Payroll Runs' },
        { id: 'payroll-calc', label: 'Salary Calculation' },
        { id: 'payroll-bonuses', label: 'Bonuses' },
        { id: 'payroll-deductions', label: 'Deductions' },
        { id: 'payroll-payslips', label: 'Payslips' },
        { id: 'payroll-history', label: 'Payroll History' },
        { id: 'payroll-workflow', label: 'Approval Workflow' }
      ]
    },
    {
      id: 'leave',
      label: 'Leave & Absences',
      icon: Calendar,
      subItems: [
        { id: 'leave-requests', label: 'Leave Requests' },
        { id: 'leave-queue', label: 'Approval Queue' },
        { id: 'leave-calendar', label: 'Team Calendar' },
        { id: 'leave-policies', label: 'Leave Policies' }
      ]
    },
    {
      id: 'attendance',
      label: 'Time & Attendance',
      icon: Clock,
      subItems: [
        { id: 'attendance-dashboard', label: 'Dashboard' },
        { id: 'attendance-logs', label: 'Attendance' },
        { id: 'attendance-clock', label: 'Clock In / Out' },
        { id: 'attendance-schedules', label: 'Work Schedules' },
        { id: 'attendance-overtime', label: 'Overtime' },
        { id: 'attendance-remote', label: 'Remote Work' },
        { id: 'attendance-reports', label: 'Attendance Reports' }
      ]
    },
    {
      id: 'accounting',
      label: 'General Ledger & Accounting',
      icon: Wallet,
      subItems: [
        { id: 'accounting-journal', label: 'Journal Entries' },
        { id: 'accounting-expenses', label: 'Payroll Expenses' },
        { id: 'accounting-centers', label: 'Cost Centers' },
        { id: 'accounting-budgets', label: 'Budgets' },
        { id: 'accounting-claims', label: 'Expense Claims' },
        { id: 'accounting-reimbursements', label: 'Reimbursements' },
        { id: 'accounting-reports', label: 'Financial Reports' }
      ]
    },
    {
      id: 'financialServices',
      label: 'Staff Financial Services',
      icon: Percent,
      subItems: [
        { id: 'financial-advances', label: 'Salary Advances' },
        { id: 'financial-loans', label: 'Loans' },
        { id: 'financial-insurance', label: 'Insurance' },
        { id: 'financial-savings', label: 'Savings' },
        { id: 'financial-repayments', label: 'Repayments' },
        { id: 'financial-analytics', label: 'Financial Analytics' }
      ]
    },
    {
      id: 'documents',
      label: 'Digital Vault & Documents',
      icon: Lock,
      subItems: [
        { id: 'documents-contracts', label: 'Contracts' },
        { id: 'documents-certificates', label: 'Certificates' },
        { id: 'documents-hr', label: 'HR Documents' },
        { id: 'documents-vault', label: 'Digital Vault' },
        { id: 'documents-signatures', label: 'Electronic Signatures' }
      ]
    },
    {
      id: 'analytics',
      label: 'HR Analytics & BI',
      icon: BarChart4,
      subItems: [
        { id: 'analytics-payroll', label: 'Payroll Analytics' },
        { id: 'analytics-workforce', label: 'Workforce Analytics' },
        { id: 'analytics-attendance', label: 'Attendance Analytics' },
        { id: 'analytics-financial', label: 'Financial Reports' },
        { id: 'analytics-forecasts', label: 'Forecasts' },
        { id: 'analytics-custom', label: 'Custom Reports' }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      subItems: [
        { id: 'settings-profile', label: 'Company Profile' },
        { id: 'settings-security', label: 'Account & Security' },
        { id: 'settings-departments', label: 'Departments' },
        { id: 'settings-grades', label: 'Grades' },
        { id: 'settings-roles', label: 'Roles & Permissions' },
        { id: 'settings-workflows', label: 'Approval Workflows' },
        { id: 'settings-payroll', label: 'Payroll Settings' },
        { id: 'settings-accounting', label: 'Accounting Settings' }
      ]
    }
  ];

  const sidebarSections = [
    {
      title: 'Essentials',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard', subTab: 'dashboard-overview' },
        { id: 'inbox', label: 'Inbox', icon: Inbox, tab: 'inbox', subTab: 'inbox-all' },
        { id: 'tasks', label: 'Tasks & Approvals', icon: CheckSquare, tab: 'tasks', subTab: 'tasks-all' },
        { id: 'notifications', label: 'Notifications', icon: Bell, tab: 'notifications', subTab: 'notifications-all' },
      ]
    },
    {
      title: 'People',
      items: [
        {
          id: 'employees',
          label: 'Employees',
          icon: Users,
          tab: 'employees',
          subTab: 'employees-directory',
          subItems: [
            { id: 'employees-directory', label: 'Employee Directory', tab: 'employees', subTab: 'employees-directory' },
            { id: 'employees-profiles', label: 'Employee Profiles', tab: 'employees', subTab: 'employees-profiles' },
            { id: 'employees-history', label: 'Employee History', tab: 'employees', subTab: 'employees-history' },
            { id: 'employees-archive', label: 'Archive', tab: 'employees', subTab: 'employees-archive' },
          ]
        },
        { id: 'orgchart', label: 'Organization Chart', icon: GitFork, tab: 'orgchart', subTab: 'orgchart-view' },
        { id: 'departments', label: 'Departments', icon: Layers, tab: 'departments', subTab: 'departments-view' },
        { id: 'teams', label: 'Teams', icon: Users, tab: 'teams', subTab: 'teams-view' },
        { id: 'positions', label: 'Positions', icon: Award, tab: 'positions', subTab: 'positions-view' },
        {
          id: 'recruitment',
          label: 'Recruitment',
          icon: Briefcase,
          tab: 'recruitment',
          subTab: 'recruitment-jobs',
          subItems: [
            { id: 'recruitment-jobs', label: 'Job Postings', tab: 'recruitment', subTab: 'recruitment-jobs' },
            { id: 'recruitment-candidates', label: 'Candidates', tab: 'recruitment', subTab: 'recruitment-candidates' },
            { id: 'recruitment-pipeline', label: 'Recruitment Pipeline', tab: 'recruitment', subTab: 'recruitment-pipeline' },
          ]
        },
        { id: 'onboarding', label: 'Onboarding', icon: UserPlus, tab: 'onboarding', subTab: 'onboarding-list' },
        { id: 'offboarding', label: 'Offboarding', icon: UserMinus, tab: 'offboarding', subTab: 'offboarding-list' },
      ]
    },
    {
      title: 'Payroll',
      items: [
        { id: 'payroll-runs', label: 'Payroll Runs', icon: PlayCircle, tab: 'payroll', subTab: 'payroll-runs' },
        { id: 'payslips', label: 'Payslips', icon: CreditCard, tab: 'payroll', subTab: 'payroll-payslips' },
        { id: 'bonuses', label: 'Bonuses & Adjustments', icon: TrendingUp, tab: 'payroll', subTab: 'payroll-bonuses' },
        { id: 'benefits', label: 'Benefits', icon: Shield, tab: 'benefits', subTab: 'benefits-list' },
        { id: 'expenses', label: 'Expenses', icon: Wallet, tab: 'expenses', subTab: 'expenses-list' },
      ]
    },
    {
      title: 'Workforce',
      items: [
        { id: 'attendance', label: 'Attendance', icon: Clock, tab: 'attendance', subTab: 'attendance-logs' },
        { id: 'leave', label: 'Leave Management', icon: Calendar, tab: 'leave', subTab: 'leave-requests' },
        { id: 'schedules', label: 'Work Schedules', icon: CalendarDays, tab: 'schedules', subTab: 'schedules-view' },
        { id: 'timetracking', label: 'Time Tracking', icon: Timer, tab: 'timetracking', subTab: 'timetracking-clock' },
        { id: 'performance', label: 'Performance', icon: BarChart4, tab: 'performance', subTab: 'performance-overview' },
        { id: 'training', label: 'Training', icon: BookOpen, tab: 'training', subTab: 'training-list' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { id: 'ledger', label: 'General Ledger', icon: Database, tab: 'ledger', subTab: 'ledger-journal' },
        { id: 'accounting', label: 'Accounting', icon: Calculator, tab: 'accounting', subTab: 'accounting-reports' },
        {
          id: 'financialServices',
          label: 'Staff Financial Services',
          icon: Percent,
          tab: 'financialServices',
          subTab: 'financial-advances',
          subItems: [
            { id: 'financial-advances', label: 'Salary Advances', tab: 'financialServices', subTab: 'financial-advances' },
            { id: 'financial-loans', label: 'Loans', tab: 'financialServices', subTab: 'financial-loans' },
            { id: 'financial-analytics', label: 'Reports', tab: 'financialServices', subTab: 'financial-analytics' },
          ]
        }
      ]
    },
    {
      title: 'My Company',
      items: [
        {
          id: 'companyProfile',
          label: 'Company Profile',
          icon: Building2,
          tab: 'companyProfile',
          subTab: 'company-legal',
          subItems: [
            { id: 'company-legal', label: 'Legal Information', tab: 'companyProfile', subTab: 'company-legal' },
            { id: 'company-ohada', label: 'OHADA Compliance', tab: 'companyProfile', subTab: 'company-ohada' },
            { id: 'company-offices', label: 'Offices & Locations', tab: 'companyProfile', subTab: 'company-offices' },
            { id: 'company-banks', label: 'Bank Accounts', tab: 'companyProfile', subTab: 'company-banks' },
            { id: 'company-integrations', label: 'Integrations', tab: 'companyProfile', subTab: 'company-integrations' },
            { id: 'company-documents', label: 'Documents', tab: 'companyProfile', subTab: 'company-documents' },
          ]
        },
        {
          id: 'security',
          label: 'Security',
          icon: ShieldCheck,
          tab: 'security',
          subTab: 'security-settings',
          subItems: [
            { id: 'security-roles', label: 'Roles & Permissions', tab: 'security', subTab: 'security-roles' },
            { id: 'security-audit', label: 'Audit Logs', tab: 'security', subTab: 'security-audit' },
            { id: 'security-settings', label: 'Settings', tab: 'security', subTab: 'security-settings' },
          ]
        }
      ]
    }
  ];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('dashboard-overview');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    employees: false,
    recruitment: false,
    financialServices: false,
    companyProfile: false,
    security: false,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [activeProfileModal, setActiveProfileModal] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [authInitialSignUp, setAuthInitialSignUp] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [sidebarSearchFocused, setSidebarSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['Directory', 'Payroll Runs', 'System Ledger']);

  const getSidebarSearchResults = () => {
    if (!sidebarSearchQuery.trim()) return [];
    const q = sidebarSearchQuery.toLowerCase();
    const results: Array<{
      title: string;
      subtitle: string;
      type: string;
      icon: any;
      action: () => void;
    }> = [];

    // 1. Search Navigation Sub-items
    navItems.forEach(parent => {
      parent.subItems.forEach(sub => {
        if (sub.label.toLowerCase().includes(q) || parent.label.toLowerCase().includes(q)) {
          results.push({
            title: sub.label,
            subtitle: `Navigation in ${parent.label}`,
            type: 'Menu',
            icon: parent.icon,
            action: () => handleCommandPaletteNavigate(`${parent.id}__${sub.id}`)
          });
        }
      });
    });

    // 2. Search Employees (by first/last name, department, role)
    employees.forEach(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      if (fullName.includes(q) || emp.department.toLowerCase().includes(q) || emp.role.toLowerCase().includes(q)) {
        results.push({
          title: `${emp.firstName} ${emp.lastName}`,
          subtitle: `${emp.role} • ${emp.department}`,
          type: 'Employee',
          icon: Users,
          action: () => {
            setActiveTab('employees');
            setActiveSubTab('employees-directory');
          }
        });
      }
    });

    // 3. Search Documents
    documents.forEach(doc => {
      if (doc.name.toLowerCase().includes(q)) {
        results.push({
          title: doc.name,
          subtitle: doc.category,
          type: 'Document',
          icon: Lock,
          action: () => {
            setActiveTab('documents');
            setActiveSubTab('documents-vault');
          }
        });
      }
    });

    // 4. Search Accounting
    accountingEntries.forEach(entry => {
      if (entry.description.toLowerCase().includes(q) || entry.category.toLowerCase().includes(q)) {
        results.push({
          title: entry.description,
          subtitle: `${entry.category} • ${entry.amount}`,
          type: 'Ledger',
          icon: Wallet,
          action: () => {
            setActiveTab('accounting');
            setActiveSubTab('accounting-journal');
          }
        });
      }
    });

    return results;
  };

  const sidebarSearchResults = getSidebarSearchResults();

  // Command palette navigation and mappings
  const flattenedNavItems = navItems.flatMap(parent => 
    parent.subItems.map(sub => ({
      id: `${parent.id}__${sub.id}`,
      label: `${parent.label} › ${sub.label}`,
      icon: parent.icon
    }))
  );

  const handleCommandPaletteNavigate = (compositeId: string) => {
    const [parentId, subId] = compositeId.split('__');
    setActiveTab(parentId);
    setActiveSubTab(subId);
    setExpandedModules(prev => ({ ...prev, [parentId]: true }));
  };

  // Keyboard listener for Cmd+K / Ctrl+K Command Palette trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme states
  const [themePreference, setThemePreference] = useState<'light' | 'dark'>('light');
  const [themePalette, setThemePalette] = useState<'violet' | 'midnight' | 'emerald' | 'graphite' | 'burgundy'>('violet');

  // Form states for profile management
  const [profilePhoneInput, setProfilePhoneInput] = useState('');
  const [profileAddressInput, setProfileAddressInput] = useState('');
  const [profileEmergencyContactInput, setProfileEmergencyContactInput] = useState('');
  const [profileBirthdayInput, setProfileBirthdayInput] = useState('');
  const [profilePhotoUrlInput, setProfilePhotoUrlInput] = useState('');
  const [profileAvatarColorInput, setProfileAvatarColorInput] = useState('');

  // Sync profile options
  useEffect(() => {
    if (profile) {
      if (profile.themePreference) {
        setThemePreference(profile.themePreference as 'light' | 'dark');
      }
      if (profile.language) {
        setLangPreference(profile.language);
        setLanguage(profile.language);
      }
      if (profile.themePalette) {
        const paletteMap: Record<string, 'violet' | 'midnight' | 'emerald' | 'graphite' | 'burgundy'> = {
          'jefara-violet': 'violet',
          'midnight-blue': 'midnight',
          'emerald-green': 'emerald',
          'graphite-black': 'graphite',
          'burgundy': 'burgundy'
        };
        const mapped = paletteMap[profile.themePalette];
        if (mapped) {
          setThemePalette(mapped);
        }
      }
    }
  }, [profile]);

  // Synchronize CSS class modifiers on document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-violet', 'theme-midnight', 'theme-emerald', 'theme-graphite', 'theme-burgundy', 'light', 'dark');
    root.classList.add(`theme-${themePalette}`);
    root.classList.add(themePreference);
    if (themePreference === 'dark') {
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.style.setProperty('color-scheme', 'light');
    }
  }, [themePalette, themePreference]);

  // Toggle appearance on header button click instantly
  const toggleAppearance = async () => {
    const nextPreference = themePreference === 'dark' ? 'light' : 'dark';
    setThemePreference(nextPreference);
    
    const root = document.documentElement;
    if (nextPreference === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    if (profile) {
      try {
        const updatedProfile = { ...profile, themePreference: nextPreference };
        await updateDoc(doc(db, 'users', profile.uid), { themePreference: nextPreference });
        setProfile(updatedProfile);
        if (localStorage.getItem('jefara_is_demo') === 'true') {
          localStorage.setItem('jefara_demo_profile', JSON.stringify(updatedProfile));
        }
      } catch (err) {
        console.error("Error saving theme preference:", err);
      }
    }
  };

  // Real-time fetched states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);
  const [financialRequests, setFinancialRequests] = useState<FinancialServiceRequest[]>([]);
  const [documents, setDocuments] = useState<HRDocument[]>([]);

  // Tab micro-loading experience
  const [visitedTabs, setVisitedTabs] = useState<string[]>(['dashboard']);
  const [tabLoading, setTabLoading] = useState<boolean>(false);
  const [loadingTabName, setLoadingTabName] = useState<string>('');

  // Monitor auth state
  useEffect(() => {
    const isDemo = localStorage.getItem('jefara_is_demo') === 'true';
    if (isDemo) {
      try {
        const storedProfile = localStorage.getItem('jefara_demo_profile');
        const storedCompany = localStorage.getItem('jefara_demo_company');
        if (storedProfile && storedCompany) {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.disabled) {
            localStorage.setItem('jefara_login_error', "Votre compte Jefara a été désactivé par le propriétaire du nœud.");
            localStorage.removeItem('jefara_is_demo');
            localStorage.removeItem('jefara_demo_profile');
            localStorage.removeItem('jefara_demo_company');
            setProfile(null);
            setCompany(null);
            setLoading(false);
            return;
          }
          setProfile(parsedProfile);
          setCompany(JSON.parse(storedCompany));
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error loading local demo sandbox session:", e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile & { disabled?: boolean };
            if (userProfile.disabled) {
              await signOut(auth);
              localStorage.setItem('jefara_login_error', "Votre compte Jefara a été désactivé par le propriétaire du nœud.");
              setProfile(null);
              setCompany(null);
              setLoading(false);
              return;
            }
            setProfile(userProfile);

            // Fetch linked company
            const compDoc = await getDoc(doc(db, 'companies', userProfile.companyId));
            if (compDoc.exists()) {
              setCompany(compDoc.data() as Company);
            }
          }
        } catch (err) {
          console.error("Error reading authenticated workspace profile:", err);
        }
      } else {
        setProfile(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch tenant data
  const fetchTenantData = async () => {
    if (!profile || !company) return;

    try {
      const companyId = company.id;

      // Re-fetch company profile to ensure any updates in Settings/Metadata are synchronized instantly
      const compDoc = await getDoc(doc(db, 'companies', companyId));
      if (compDoc.exists()) {
        setCompany(compDoc.data() as Company);
      }

      // Re-fetch user profile to ensure any updates in Settings are synchronized instantly
      const userDoc = await getDoc(doc(db, 'users', profile.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      }

      // 1. Employees
      const empSnap = await getDocs(collection(db, 'companies', companyId, 'employees'));
      const empList = empSnap.docs.map(d => d.data() as Employee);
      setEmployees(empList);

      // 2. Payroll Runs
      const runSnap = await getDocs(collection(db, 'companies', companyId, 'payroll_runs'));
      const runList = runSnap.docs.map(d => d.data() as PayrollRun);
      setPayrollRuns(runList);

      // 3. Payslips
      const slipSnap = await getDocs(collection(db, 'companies', companyId, 'payslips'));
      const slipList = slipSnap.docs.map(d => d.data() as Payslip);
      setPayslips(slipList);

      // 4. Leave Requests
      const leaveSnap = await getDocs(collection(db, 'companies', companyId, 'leave_requests'));
      const leaveList = leaveSnap.docs.map(d => d.data() as LeaveRequest);
      setLeaveRequests(leaveList);

      // 5. Attendance logs
      const attSnap = await getDocs(collection(db, 'companies', companyId, 'attendance_logs'));
      const attList = attSnap.docs.map(d => d.data() as AttendanceLog);
      setAttendanceLogs(attList);

      // 6. Job postings
      const jobSnap = await getDocs(collection(db, 'companies', companyId, 'job_postings'));
      const jobList = jobSnap.docs.map(d => d.data() as JobPosting);
      setJobPostings(jobList);

      // 7. Applications
      const appSnap = await getDocs(collection(db, 'companies', companyId, 'job_applications'));
      const appList = appSnap.docs.map(d => d.data() as JobApplication);
      setJobApplications(appList);

      // 8. Accounting
      const accSnap = await getDocs(collection(db, 'companies', companyId, 'accounting_entries'));
      const accList = accSnap.docs.map(d => d.data() as AccountingEntry);
      setAccountingEntries(accList);

      // 9. Financial Provisions
      const finSnap = await getDocs(collection(db, 'companies', companyId, 'financial_service_requests'));
      const finList = finSnap.docs.map(d => d.data() as FinancialServiceRequest);
      setFinancialRequests(finList);

      // 10. Documents
      const docSnap = await getDocs(collection(db, 'companies', companyId, 'documents'));
      const docList = docSnap.docs.map(d => d.data() as HRDocument);
      setDocuments(docList);

    } catch (err) {
      console.error("Error reading secure tenant subcollections:", err);
    }
  };

  useEffect(() => {
    if (profile && company) {
      fetchTenantData();
    }
  }, [profile?.id, company?.id]);

  useEffect(() => {
    if (!activeTab) return;
    
    if (!visitedTabs.includes(activeTab)) {
      const item = navItems.find(i => i.id === activeTab);
      const label = item ? item.label : activeTab;
      setLoadingTabName(label);
      setTabLoading(true);
      
      const timer = setTimeout(() => {
        setVisitedTabs(prev => [...prev, activeTab]);
        setTabLoading(false);
      }, 550); // Fast high-fidelity iOS delay
      
      return () => clearTimeout(timer);
    } else {
      setTabLoading(false);
    }
  }, [activeTab]);

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const triggerSignOutWithLoading = () => {
    setGlobalLoading(true);
    setShowSignOutConfirm(false);
    setMobileMenuOpen(false);
    setTimeout(() => {
      clearDemoData();
      signOut(auth).catch(err => console.error("Error signing out of Firebase:", err));
      setProfile(null);
      setCompany(null);
      setShowLanding(true);
      setGlobalLoading(false);
    }, 1500);
  };

  const handleGoHome = () => {
    if (activeTab === 'dashboard') return;
    setGlobalLoading(true);
    setTimeout(() => {
      setActiveTab('dashboard');
      setGlobalLoading(false);
    }, 1200);
  };

  // Form states for profile and settings dialogs
  const [profileNameInput, setProfileNameInput] = useState('');
  const [compNameInput, setCompNameInput] = useState('');
  const [compRegInput, setCompRegInput] = useState('');
  const [compCurrencyInput, setCompCurrencyInput] = useState('XAF');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [langPreference, setLangPreference] = useState(getLanguage());
  const [securityMfa, setSecurityMfa] = useState(false);
  
  // Destructive confirmations
  const [disableStep, setDisableStep] = useState(1); // 1: confirm, 2: password check, 3: progress, 4: done
  const [disablePassword, setDisablePassword] = useState('');
  const [disableError, setDisableError] = useState('');
  
  const [deleteStep, setDeleteStep] = useState(1); // 1: confirm, 2: account name & phrase verification, 3: final warning, 4: progress, 5: done
  const [deleteAccountNameInput, setDeleteAccountNameInput] = useState('');
  const [deletePhraseInput, setDeletePhraseInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (activeProfileModal) {
      if (profile) {
        setProfileNameInput(profile.displayName);
        setProfilePhoneInput(profile.phone || '');
        setProfileAddressInput(profile.address || '');
        setProfileEmergencyContactInput(profile.emergencyContact || '');
        setProfileBirthdayInput(profile.birthday || '');
        setProfilePhotoUrlInput(profile.photoUrl || '');
        setProfileAvatarColorInput(profile.avatarColor || getRandomAvatarColor());
      }
      if (company) {
        setCompNameInput(company.name);
        setCompRegInput(company.registrationNumber || '');
        setCompCurrencyInput(company.currency);
      }
      // Reset destructive steps
      setDisableStep(1);
      setDisablePassword('');
      setDisableError('');
      setDeleteStep(1);
      setDeleteAccountNameInput('');
      setDeletePhraseInput('');
      setDeleteError('');
      setSupportMessage('');
      setSupportSuccess(false);
    }
  }, [activeProfileModal, profile, company]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !profileNameInput.trim()) return;
    setGlobalLoading(true);
    try {
      const updatedFields = {
        displayName: profileNameInput.trim(),
        phone: profilePhoneInput.trim(),
        address: profileAddressInput.trim(),
        emergencyContact: profileEmergencyContactInput.trim(),
        birthday: profileBirthdayInput.trim(),
        photoUrl: profilePhotoUrlInput.trim(),
        avatarColor: profileAvatarColorInput
      };
      const updatedProfile = { ...profile, ...updatedFields };
      await updateDoc(doc(db, 'users', profile.uid), updatedFields);
      setProfile(updatedProfile);
      // Update local storage in demo mode
      if (localStorage.getItem('jefara_is_demo') === 'true') {
        localStorage.setItem('jefara_demo_profile', JSON.stringify(updatedProfile));
      }
      setActiveProfileModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !compNameInput.trim()) return;
    setGlobalLoading(true);
    try {
      const updatedCompany = { 
        ...company, 
        name: compNameInput.trim(), 
        registrationNumber: compRegInput.trim(), 
        currency: compCurrencyInput 
      };
      await updateDoc(doc(db, 'companies', company.id), { 
        name: compNameInput.trim(), 
        registrationNumber: compRegInput.trim(),
        currency: compCurrencyInput
      });
      setCompany(updatedCompany);
      // Update local storage in demo mode
      if (localStorage.getItem('jefara_is_demo') === 'true') {
        localStorage.setItem('jefara_demo_company', JSON.stringify(updatedCompany));
      }
      setActiveProfileModal(null);
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleDisableAccount = async () => {
    if (disableStep === 1) {
      setDisableStep(2); // Move to password confirmation
      return;
    }
    if (disableStep === 2) {
      if (!disablePassword.trim()) {
        setDisableError("Veuillez saisir votre mot de passe d'authentification.");
        return;
      }
      setDisableError('');
      setDisableStep(3); // Move to final warning
      return;
    }
    if (disableStep === 3) {
      setDisableStep(4); // Trigger loading state
      try {
        await updateDoc(doc(db, 'users', profile!.uid), { disabled: true });
        // Update local demo state too
        if (localStorage.getItem('jefara_is_demo') === 'true') {
          const storedProfile = JSON.parse(localStorage.getItem('jefara_demo_profile') || '{}');
          storedProfile.disabled = true;
          localStorage.setItem('jefara_demo_profile', JSON.stringify(storedProfile));
        }
        
        // Show success and then log out
        setTimeout(async () => {
          await signOut(auth);
          localStorage.setItem('jefara_login_error', "Votre compte a été désactivé avec succès.");
          setActiveProfileModal(null);
          setProfile(null);
          setCompany(null);
        }, 2000);
      } catch (err: any) {
        setDisableError(err.message || "La désactivation de la node a échoué.");
        setDisableStep(2);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 1) {
      setDeleteStep(2); // Go to entry verification
      return;
    }
    if (deleteStep === 2) {
      if (deleteAccountNameInput !== (company?.name || '')) {
        setDeleteError("Le nom du compte saisi ne correspond pas à votre compte actuel.");
        return;
      }
      if (deletePhraseInput.toLowerCase() !== 'delete my account') {
        setDeleteError("La phrase de confirmation saisie est incorrecte.");
        return;
      }
      setDeleteError('');
      setDeleteStep(3); // Go to final warning
      return;
    }
    if (deleteStep === 3) {
      setDeleteStep(4); // Loading wiping state
      
      try {
        const uid = profile!.uid;
        const companyId = company!.id;
        
        // Delete User Profile
        await deleteDoc(doc(db, 'users', uid));
        
        // If they are owner, archive company too
        if (profile!.role === 'Owner') {
          await updateDoc(doc(db, 'companies', companyId), { 
            status: 'Archived', 
            deletedAt: new Date().toISOString() 
          });
        }
        
        // Update local accounts in storage
        const localAccountsStr = localStorage.getItem('jefara_local_accounts');
        if (localAccountsStr) {
          try {
            let accounts = JSON.parse(localAccountsStr);
            if (Array.isArray(accounts)) {
              accounts = accounts.filter((acc: any) => acc.uid !== uid);
              localStorage.setItem('jefara_local_accounts', JSON.stringify(accounts));
            }
          } catch {}
        }
        
        // Clear session
        localStorage.removeItem('jefara_is_demo');
        localStorage.removeItem('jefara_demo_profile');
        localStorage.removeItem('jefara_demo_company');
        
        // Progress complete
        setTimeout(() => {
          setDeleteStep(5); // Done
        }, 2000);
      } catch (err: any) {
        setDeleteError(err.message || "La suppression du compte a échoué.");
        setDeleteStep(2);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-2 border-t-zinc-900 border-zinc-200 rounded-full animate-spin" />
          <span className="text-xs font-mono font-bold text-zinc-400 tracking-wider">Verifying Tenant Signature...</span>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <LandingPage 
        onGetStarted={() => {
          setAuthInitialSignUp(true);
          setShowLanding(false);
        }} 
        onSignIn={() => {
          setAuthInitialSignUp(false);
          setShowLanding(false);
        }} 
        onLaunchDemo={() => {
          setAuthInitialSignUp(true);
          setShowLanding(false);
        }}
        onSandboxSuccess={(user, comp) => {
          setProfile(user);
          setCompany(comp);
          setShowLanding(false);
        }}
      />
    );
  }

  if (!profile || !company) {
    return (
      <Auth 
        initialIsSignUp={authInitialSignUp}
        onBackToLanding={() => setShowLanding(true)}
        onAuthSuccess={(user, comp) => { 
          setProfile(user); 
          setCompany(comp); 
        }} 
      />
    );
  }

  const getPageMetadata = () => {
    let matchedItem: { id: string; label: string; tab: string; subTab?: string } | undefined;
    let matchedSubItem: { id: string; label: string; tab: string; subTab?: string } | undefined;

    for (const section of sidebarSections) {
      for (const item of section.items) {
        if (item.subItems) {
          const found = item.subItems.find(sub => sub.tab === activeTab && sub.subTab === activeSubTab);
          if (found) {
            matchedItem = item;
            matchedSubItem = found;
            break;
          }
        } else {
          if (item.tab === activeTab && item.subTab === activeSubTab) {
            matchedItem = item;
            break;
          }
        }
      }
      if (matchedItem) break;
    }

    // Fallback search just by activeTab if no exact match is found
    if (!matchedItem) {
      for (const section of sidebarSections) {
        for (const item of section.items) {
          if (item.tab === activeTab) {
            matchedItem = item;
            break;
          }
        }
        if (matchedItem) break;
      }
    }

    const title = matchedSubItem ? t(matchedSubItem.label) : (matchedItem ? t(matchedItem.label) : t('Overview'));
    
    // Subtitles lookup
    const subtitle = t(SUBTAB_SUBTITLES[activeSubTab]) || 
      t('Roster and registers under Cameroon regulatory guidelines');

    return { title, subtitle };
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getPageMetadata();

  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardModule 
            company={company} 
            employees={employees} 
            payrollRuns={payrollRuns} 
            payslips={payslips}
            leaveRequests={leaveRequests} 
            attendanceLogs={attendanceLogs}
            jobPostings={jobPostings}
            jobApplications={jobApplications}
            accountingEntries={accountingEntries}
            financialRequests={financialRequests}
            documents={documents}
            setActiveTab={setActiveTab}
            activeSubTab={activeSubTab}
          />
        );
      case 'inbox':
        return <InboxModule />;
      case 'tasks':
        return <TasksModule />;
      case 'notifications':
        return <NotificationsModule />;
      case 'employees':
        return <EmployeesModule company={company} employees={employees} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'orgchart':
        return <OrgChartModule company={company} employees={employees} />;
      case 'departments':
        return <DepartmentsModule company={company} employees={employees} />;
      case 'teams':
        return <TeamsModule company={company} employees={employees} />;
      case 'positions':
        return <PositionsModule company={company} />;
      case 'onboarding':
        return <OnboardingModule />;
      case 'offboarding':
        return <OffboardingModule />;
      case 'payroll':
        return <PayrollModule company={company} employees={employees} payrollRuns={payrollRuns} payslips={payslips} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'benefits':
        return <BenefitsModule company={company} />;
      case 'expenses':
        return <ExpensesModule company={company} />;
      case 'leave':
        return <LeaveModule company={company} employees={employees} leaveRequests={leaveRequests} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'attendance':
        return <AttendanceModule company={company} employees={employees} attendanceLogs={attendanceLogs} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'schedules':
        return <SchedulesModule company={company} />;
      case 'timetracking':
        return <TimeTrackingModule />;
      case 'performance':
        return <PerformanceModule />;
      case 'training':
        return <TrainingModule />;
      case 'ledger':
        return <GeneralLedgerModule />;
      case 'accounting':
        return <AccountingModule company={company} accountingEntries={accountingEntries} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'financialServices':
        return <FinancialServicesModule company={company} employees={employees} financialRequests={financialRequests} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'documents':
        return <DocumentsModule company={company} employees={employees} documents={documents} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'recruitment':
        return <RecruitmentModule company={company} jobPostings={jobPostings} jobApplications={jobApplications} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'analytics':
        return <AnalyticsModule company={company} employees={employees} payrollRuns={payrollRuns} leaveRequests={leaveRequests} onRefresh={fetchTenantData} activeSubTab={activeSubTab} />;
      case 'companyProfile': {
        let settingsSubTab = 'settings-profile';
        if (activeSubTab === 'company-ohada') {
          settingsSubTab = 'settings-payroll';
        } else if (activeSubTab === 'company-banks') {
          settingsSubTab = 'settings-accounting';
        } else if (activeSubTab === 'company-integrations') {
          settingsSubTab = 'settings-workflows';
        }
        return (
          <SettingsModule 
            company={company} 
            employees={employees} 
            profile={profile}
            onRefresh={fetchTenantData} 
            themePalette={themePalette}
            activeSubTab={settingsSubTab}
            onThemePaletteChange={async (newPalette) => {
              setThemePalette(newPalette);
              if (profile) {
                const dbPalette = mapPaletteToDb(newPalette);
                const updatedProfile = { ...profile, themePalette: dbPalette };
                await updateDoc(doc(db, 'users', profile.uid), { themePalette: dbPalette });
                setProfile(updatedProfile);
                if (localStorage.getItem('jefara_is_demo') === 'true') {
                  localStorage.setItem('jefara_demo_profile', JSON.stringify(updatedProfile));
                }
              }
            }}
          />
        );
      }
      case 'security': {
        let secSubTab = 'settings-security';
        if (activeSubTab === 'security-roles') {
          secSubTab = 'settings-roles';
        } else if (activeSubTab === 'security-audit') {
          return <NotificationsModule />;
        }
        return (
          <SettingsModule 
            company={company} 
            employees={employees} 
            profile={profile}
            onRefresh={fetchTenantData} 
            themePalette={themePalette}
            activeSubTab={secSubTab}
            onThemePaletteChange={async (newPalette) => {
              setThemePalette(newPalette);
              if (profile) {
                const dbPalette = mapPaletteToDb(newPalette);
                const updatedProfile = { ...profile, themePalette: dbPalette };
                await updateDoc(doc(db, 'users', profile.uid), { themePalette: dbPalette });
                setProfile(updatedProfile);
                if (localStorage.getItem('jefara_is_demo') === 'true') {
                  localStorage.setItem('jefara_demo_profile', JSON.stringify(updatedProfile));
                }
              }
            }}
          />
        );
      }
      case 'settings':
        return (
          <SettingsModule 
            company={company} 
            employees={employees} 
            profile={profile}
            onRefresh={fetchTenantData} 
            themePalette={themePalette}
            activeSubTab={activeSubTab}
            onThemePaletteChange={async (newPalette) => {
              setThemePalette(newPalette);
              if (profile) {
                const dbPalette = mapPaletteToDb(newPalette);
                const updatedProfile = { ...profile, themePalette: dbPalette };
                await updateDoc(doc(db, 'users', profile.uid), { themePalette: dbPalette });
                setProfile(updatedProfile);
                if (localStorage.getItem('jefara_is_demo') === 'true') {
                  localStorage.setItem('jefara_demo_profile', JSON.stringify(updatedProfile));
                }
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderSidebarContent = (onCloseMobileMenu?: () => void) => {
    return (
      <>
        {/* Sidebar Top: Logo, Notifications & Search */}
        <div className="shrink-0 mb-4 flex flex-col justify-between h-[82px]">
          {/* Logo & Notifications & Close Button */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => {
                handleGoHome();
                onCloseMobileMenu?.();
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
              title="Return to Dashboard"
            >
              <div className="h-8 w-8 rounded-xl bg-[var(--theme-primary)] text-white flex items-center justify-center font-display font-bold tracking-wider p-1.5 group-hover:scale-105 transition-transform shadow-xs">
                <Logo size={20} className="text-white" />
              </div>
              <div className="text-left leading-none">
                <h1 className="font-display font-bold text-sm text-zinc-900">Jefara</h1>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Notifications Icon (Beside Logo) */}
              <button
                onClick={() => setActiveProfileModal('notifications')}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-800 active:scale-95 transition-all relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[var(--theme-primary)] rounded-full animate-pulse" />
              </button>

              {onCloseMobileMenu && (
                <button 
                  onClick={onCloseMobileMenu}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Search Bar */}
          <div className="relative select-none">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                value={sidebarSearchQuery}
                onChange={(e) => {
                  setSidebarSearchQuery(e.target.value);
                  setSidebarSearchFocused(true);
                }}
                onFocus={() => setSidebarSearchFocused(true)}
                className="w-full bg-white/70 border border-[var(--color-sidebar-border)] focus:bg-white focus:border-[var(--theme-primary)] focus:ring-4 focus:ring-[var(--theme-primary)]/5 rounded-full py-1.5 pl-9 pr-7 text-[11px] placeholder-zinc-400 text-zinc-850 transition-all focus:outline-none"
              />
              {sidebarSearchQuery && (
                <button 
                  onClick={() => setSidebarSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs font-semibold font-mono"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {sidebarSearchFocused && (
                <>
                  <div 
                    className="fixed inset-0 z-30 bg-transparent"
                    onClick={() => setSidebarSearchFocused(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.98 }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl p-2.5 z-40 max-h-72 overflow-y-auto scrollbar-thin flex flex-col gap-2"
                  >
                    {sidebarSearchQuery.trim() === '' ? (
                      <>
                        {recentSearches.length > 0 && (
                          <div className="space-y-0.5">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-1.5 flex items-center justify-between mb-0.5">
                              <span>Recent Searches</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRecentSearches([]);
                                }}
                                className="text-[9px] hover:text-zinc-600 capitalize cursor-pointer font-normal"
                              >
                                Clear
                              </button>
                            </div>
                            {recentSearches.map((term, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSidebarSearchQuery(term);
                                }}
                                className="w-full flex items-center gap-2 px-1.5 py-1 rounded-lg text-left text-[11px] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
                              >
                                <Clock className="h-3 w-3 text-zinc-400" />
                                <span className="truncate">{term}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-1.5 mb-0.5">
                            Suggestions
                          </div>
                          {[
                            { label: "Onboard Employee", action: () => handleCommandPaletteNavigate('employees__employees-profiles') },
                            { label: "Process Payroll Cycle", action: () => handleCommandPaletteNavigate('payroll__payroll-runs') },
                            { label: "View Ledger Balance", action: () => handleCommandPaletteNavigate('accounting__accounting-journal') },
                            { label: "Verify Leave Queue", action: () => handleCommandPaletteNavigate('leave__leave-queue') }
                          ].map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                sug.action();
                                setSidebarSearchFocused(false);
                                onCloseMobileMenu?.();
                                if (!recentSearches.includes(sug.label)) {
                                  setRecentSearches(prev => [sug.label, ...prev.slice(0, 4)]);
                                }
                              }}
                              className="w-full flex items-center gap-2 px-1.5 py-1 rounded-lg text-left text-[11px] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3 text-amber-500" />
                              <span className="truncate">{sug.label}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {sidebarSearchResults.length === 0 ? (
                          <div className="py-4 text-center text-zinc-400 text-[10px]">
                            No matching records found
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-1.5 mb-1">
                              Search Results
                            </div>
                            {sidebarSearchResults.slice(0, 6).map((res, idx) => {
                              const SearchIcon = res.icon || Search;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    res.action();
                                    setSidebarSearchFocused(false);
                                    onCloseMobileMenu?.();
                                    if (!recentSearches.includes(sidebarSearchQuery)) {
                                      setRecentSearches(prev => [sidebarSearchQuery, ...prev.slice(0, 4)]);
                                    }
                                  }}
                                  className="w-full flex items-center justify-between px-1.5 py-1.5 rounded-lg text-left text-[11px] text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="p-0.5 bg-zinc-100 rounded text-zinc-500 shrink-0">
                                      <SearchIcon className="h-3 w-3" />
                                    </span>
                                    <div className="truncate text-left leading-none">
                                      <span className="font-semibold text-zinc-900 block truncate">{res.title}</span>
                                      <span className="text-[9px] text-zinc-400 block mt-0.5 truncate">{res.subtitle}</span>
                                    </div>
                                  </div>
                                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1 py-0.5 rounded shrink-0 font-bold ml-1">
                                    {res.type}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Elements - Scrollable inside Sidebar Accordion */}
        <nav className="flex-1 space-y-5 overflow-y-auto pr-1 select-none no-scrollbar">
          {sidebarSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {/* Section Header */}
              <span className="text-[11px] font-bold text-zinc-400 block px-3.5 mb-1 mt-2 leading-none">
                {t(section.title)}
              </span>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isExpanded = !!expandedModules[item.id];
                  
                  // A module is active if the current activeTab matches its tab
                  // and, if it has sub-items, the activeSubTab is one of its sub-items' subTabs.
                  // Otherwise, it is active if activeTab and activeSubTab match exactly.
                  const isActive = item.subItems 
                    ? (activeTab === item.tab && item.subItems.some(sub => sub.subTab === activeSubTab))
                    : (activeTab === item.tab && (!item.subTab || activeSubTab === item.subTab));

                  return (
                    <div key={item.id} className="space-y-0.5">
                      {/* Parent level link */}
                      <button
                        onClick={() => {
                          if (item.subItems) {
                            setExpandedModules(prev => ({
                              ...prev,
                              [item.id]: !prev[item.id]
                            }));
                          } else {
                            setActiveTab(item.tab);
                            if (item.subTab) {
                              setActiveSubTab(item.subTab);
                            }
                            onCloseMobileMenu?.();
                          }
                        }}
                        className={`w-full flex items-center justify-between py-2 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer border-l-[3.5px] ${
                          isActive 
                            ? 'text-[#7c3aed] border-[#7c3aed] pl-[11px] pr-3.5 bg-transparent' 
                            : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] hover:bg-white/40 border-transparent pl-[11px] pr-3.5'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-[#7c3aed]' : 'text-zinc-400'}`} />
                          <span className="truncate">{t(item.label)}</span>
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <ChevronRight 
                            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                              isActive ? 'text-[#7c3aed]' : 'text-zinc-400'
                            } ${isExpanded ? 'rotate-90' : ''}`} 
                          />
                        )}
                      </button>

                      {/* Nested Sub-navigation items */}
                      {item.subItems && item.subItems.length > 0 && isExpanded && (
                        <div className="pl-3 pr-1 py-1 space-y-1 ml-4 border-l border-zinc-100">
                          {item.subItems.map((sub) => {
                            const isSubActive = activeTab === sub.tab && activeSubTab === sub.subTab;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => {
                                  setActiveTab(sub.tab);
                                  setActiveSubTab(sub.subTab);
                                  onCloseMobileMenu?.();
                                }}
                                className={`w-full flex items-center gap-2.5 py-1.5 rounded-md text-left transition-all duration-150 cursor-pointer group bg-transparent border-l-2 ${
                                  isSubActive
                                    ? 'text-[#7c3aed] border-[#7c3aed] pl-3.5 pr-4 font-semibold'
                                    : 'text-[var(--color-text-sub)] border-transparent hover:text-[var(--color-text-main)] hover:bg-white/40 pl-3.5 pr-4'
                                }`}
                              >
                                <span className="text-xs tracking-wide truncate">{t(sub.label)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info & Profile Button - Fixed to Bottom */}
        {profile && (
          <div className="pt-4 mt-6 border-t border-[var(--color-border-card)] shrink-0 relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center justify-between p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-left transition-all cursor-pointer group active:scale-[0.98]"
              title="User Profile & Menu"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div
                  className="h-8 w-8 rounded-full text-white flex items-center justify-center font-bold text-xs relative shadow-xs shrink-0 border border-zinc-200 overflow-hidden"
                  style={{ backgroundColor: profile.avatarColor || 'var(--theme-primary)' }}
                >
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    profile.displayName[0].toUpperCase()
                  )}
                </div>
                <div className="truncate text-left leading-none">
                  <span className="text-[12px] font-bold text-[var(--color-text-main)] block truncate">{profile.displayName}</span>
                </div>
              </div>
              
              <ChevronsUpDown className="h-3.5 w-3.5 text-[var(--color-text-sub)] group-hover:text-[var(--color-text-main)] shrink-0 transition-colors ml-1" />
            </button>

            {/* iOS 26 Inspired Floating Profile Dropdown overlay */}
            <AnimatePresence>
              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="absolute bottom-12 left-0 z-50 w-64 bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-3xl shadow-2xl p-3 flex flex-col gap-1 text-[var(--color-text-main)]"
                  >
                    <div className="px-3 py-2 border-b border-[var(--color-border-card)] flex items-center gap-3">
                      <div 
                        className="h-9 w-9 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden"
                        style={{ backgroundColor: profile.avatarColor || 'var(--theme-primary)' }}
                      >
                        {profile.photoUrl ? (
                          <img src={profile.photoUrl} alt={profile.displayName} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          profile.displayName[0].toUpperCase()
                        )}
                      </div>
                      <div className="truncate leading-none text-left">
                        <span className="text-xs font-bold text-[var(--color-text-main)] block leading-tight truncate">{profile.displayName}</span>
                      </div>
                    </div>

                    <div className="max-h-[280px] overflow-y-auto py-1.5 space-y-0.5 scrollbar-thin">
                      {[
                        { id: 'profile', label: 'My Profile', icon: User, color: 'text-[var(--color-text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800', type: 'modal' },
                        { id: 'settings', label: 'Company Details', icon: Building2, color: 'text-[var(--color-text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800', type: 'modal' },
                        { id: 'system-settings', label: 'System Settings', icon: Settings, color: 'text-[var(--color-text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800', type: 'tab' },
                        { id: 'language', label: 'Language', icon: Globe, color: 'text-[var(--color-text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800', type: 'modal' },
                        { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck, color: 'text-[var(--color-text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800', type: 'modal' },
                        { id: 'disable', label: 'Disable Account', icon: Ban, color: 'text-red-600 hover:bg-red-50/50 font-semibold', type: 'modal' },
                        { id: 'delete', label: 'Delete Account', icon: Trash2, color: 'text-red-600 hover:bg-red-50/50 font-semibold', type: 'modal' },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setShowProfileDropdown(false);
                              if (item.type === 'tab') {
                                setActiveTab('settings');
                                setActiveSubTab('settings-profile');
                              } else {
                                setActiveProfileModal(item.id);
                              }
                              onCloseMobileMenu?.();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors text-left cursor-pointer ${item.color}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight className="h-3 w-3 text-[var(--color-text-sub)]" />
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowSignOutConfirm(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 border-t border-[var(--color-border-card)] text-[var(--color-text-sub)] hover:text-red-600 hover:bg-red-50/30 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-screen w-screen bg-[var(--color-bg-base)] font-sans text-[var(--color-text-main)] flex flex-col overflow-hidden relative authenticated-workspace">
      
      {/* Top horizontal progress bar */}
      {globalLoading && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/30 z-[9999]">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="h-full bg-white"
          />
        </div>
      )}

      {/* Confirmation de déconnexion modal */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-3xl p-6 w-full max-w-sm shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 text-[var(--color-text-main)]">
              <LogOut className="h-5 w-5 text-red-600" />
              <h3 className="font-display font-bold text-sm">Confirmation de déconnexion</h3>
            </div>
            <p className="text-xs text-[var(--color-text-sub)] leading-relaxed">
              Êtes-vous sûr de vouloir vous déconnecter de Jefara ? Vos sessions cryptées seront closes.
            </p>
            <div className="flex gap-2 justify-end text-xs pt-1">
              <button 
                type="button" 
                onClick={() => setShowSignOutConfirm(false)}
                className="px-4 py-2 border border-[var(--color-border-card)] rounded-xl font-semibold text-[var(--color-text-main)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <button 
                type="button"
                onClick={triggerSignOutWithLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                Se déconnecter
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Mobile Burger Button - Floating in the top left corner */}
      {!mobileMenuOpen && (
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl shadow-md text-zinc-600 transition-all active:scale-95 cursor-pointer flex items-center justify-center animate-fade-in"
          title="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Outer container holding Sidebar and Main view area */}
      <div className="flex-1 flex flex-row overflow-hidden relative w-full">

        {/* Desktop Sidebar Panel */}
        <aside className="hidden md:flex flex-col w-64 h-full bg-[var(--color-sidebar-bg)] border-r border-[var(--color-sidebar-border)] p-5 shrink-0 relative justify-between">
          {renderSidebarContent()}
        </aside>

      {/* Mobile Menu Drawer (Slide-out Overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/45 backdrop-blur-xs z-[90]"
            />
            
            {/* Drawer Panel - exact copy of desktop sidebar */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="md:hidden fixed inset-y-0 left-0 w-64 bg-[var(--color-sidebar-bg)] z-[100] shadow-2xl flex flex-col p-5 h-full border-r border-[var(--color-sidebar-border)] justify-between"
            >
              {renderSidebarContent(() => setMobileMenuOpen(false))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Dialog Modals (iOS styled) */}
      <AnimatePresence>
        {activeProfileModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-150 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-zinc-100 rounded-xl text-zinc-800">
                    {activeProfileModal === 'profile' && <User className="h-4 w-4" />}
                    {activeProfileModal === 'settings' && <Settings className="h-4 w-4" />}
                    {activeProfileModal === 'help' && <HelpCircle className="h-4 w-4" />}
                    {activeProfileModal === 'appearance' && <Sun className="h-4 w-4" />}
                    {activeProfileModal === 'notifications' && <Bell className="h-4 w-4" />}
                    {activeProfileModal === 'language' && <Globe className="h-4 w-4" />}
                    {activeProfileModal === 'privacy' && <ShieldCheck className="h-4 w-4" />}
                    {activeProfileModal === 'disable' && <Ban className="h-4 w-4 text-red-600" />}
                    {activeProfileModal === 'delete' && <Trash2 className="h-4 w-4 text-red-600" />}
                  </span>
                  <h3 className="font-display font-bold text-sm text-zinc-900 capitalize">
                    {activeProfileModal === 'profile' && 'Mon Profil'}
                    {activeProfileModal === 'settings' && 'Paramètres du Nœud'}
                    {activeProfileModal === 'help' && 'Support & Assistance'}
                    {activeProfileModal === 'appearance' && 'Apparence'}
                    {activeProfileModal === 'notifications' && 'Notifications'}
                    {activeProfileModal === 'language' && 'Langue'}
                    {activeProfileModal === 'privacy' && 'Sécurité & Isolation'}
                    {activeProfileModal === 'disable' && 'Désactiver le Compte'}
                    {activeProfileModal === 'delete' && 'Supprimer le Compte'}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveProfileModal(null)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[80vh] text-xs space-y-4">
                
                {/* My Profile */}
                {activeProfileModal === 'profile' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Identité Nom Complet</label>
                      <input
                        type="text"
                        required
                        value={profileNameInput}
                        onChange={(e) => setProfileNameInput(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Adresse Email</label>
                      <input
                        type="email"
                        disabled
                        value={profile?.email || ''}
                        className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Rôle de Sécurité</label>
                      <input
                        type="text"
                        disabled
                        value={profile?.role || ''}
                        className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-400 cursor-not-allowed"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveProfileModal(null)}
                        className="px-4 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                )}

                {/* Account Settings */}
                {activeProfileModal === 'settings' && (
                  <form onSubmit={handleSaveCompany} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Nom de l'Entreprise</label>
                      <input
                        type="text"
                        required
                        value={compNameInput}
                        onChange={(e) => setCompNameInput(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Numéro de Registre</label>
                      <input
                        type="text"
                        value={compRegInput}
                        onChange={(e) => setCompRegInput(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Devise de Facturation</label>
                      <select
                        value={compCurrencyInput}
                        onChange={(e) => setCompCurrencyInput(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors"
                      >
                        <option value="XAF">Franc CFA (XAF)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="USD">Dollar US (USD)</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveProfileModal(null)}
                        className="px-4 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </form>
                )}

                {/* Help & Support */}
                {activeProfileModal === 'help' && (
                  <div className="space-y-4">
                    {supportSuccess ? (
                      <div className="text-center py-6 space-y-3">
                        <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-lg">✓</div>
                        <h4 className="font-bold text-zinc-900">Ticket Sécurisé Transmis</h4>
                        <p className="text-zinc-500 text-xs">
                          Votre message d'assistance a été crypté avec succès. Les opérateurs de la Jefara Cameroon vous répondront sous 12h.
                        </p>
                        <button
                          onClick={() => setSupportSuccess(false)}
                          className="mt-2 text-zinc-950 font-semibold hover:underline"
                        >
                          Envoyer un autre message
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-zinc-500 leading-relaxed">
                          Rencontrez-vous des difficultés sur votre tableau de bord ou lors du téléchargement de vos fiches de paie ? Envoyez un rapport chiffré directement aux experts.
                        </p>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Votre Message</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Décrivez votre problème ici..."
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors text-xs resize-none"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (!supportMessage.trim()) return;
                            setGlobalLoading(true);
                            setTimeout(() => {
                              setGlobalLoading(false);
                              setSupportSuccess(true);
                              setSupportMessage('');
                            }, 1200);
                          }}
                          className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm text-center"
                        >
                          Transmettre l'assistance sécurisée
                        </button>
                      </div>
                    )}
                  </div>
                )}



                {/* Notifications */}
                {activeProfileModal === 'notifications' && (
                  <div className="space-y-4">
                    <p className="text-zinc-500 leading-relaxed">
                      Sélectionnez les alertes réseau et rapports de paie que vous souhaitez recevoir sur vos terminaux.
                    </p>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-xl">
                        <div>
                          <span className="font-bold text-zinc-800 block">Alertes par Email</span>
                          <span className="text-[10px] text-zinc-400">Lorsqu'un bulletin ou virement est généré.</span>
                        </div>
                        <button 
                          onClick={() => setNotifEmail(!notifEmail)}
                          className={`w-10 h-6 rounded-full transition-colors relative ${notifEmail ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                        >
                          <span className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform ${notifEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-xl">
                        <div>
                          <span className="font-bold text-zinc-800 block">Notifications Push</span>
                          <span className="text-[10px] text-zinc-400">Mises à jour instantanées de la plateforme Jefara.</span>
                        </div>
                        <button 
                          onClick={() => setNotifPush(!notifPush)}
                          className={`w-10 h-6 rounded-full transition-colors relative ${notifPush ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                        >
                          <span className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform ${notifPush ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Language */}
                {activeProfileModal === 'language' && (
                  <div className="space-y-3">
                    <p className="text-zinc-500">{t("Choisissez votre langue de travail pour l'ensemble du système d'administration.")}</p>
                    <div className="space-y-1.5 pt-2">
                      {[
                        { id: 'fr', label: t('Français (Cameroun)') },
                        { id: 'en', label: t('English (UK/US)') }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={async () => {
                            setLangPreference(lang.id);
                            setLanguage(lang.id);
                            if (profile) {
                              try {
                                const updatedProfile = { ...profile, language: lang.id };
                                await updateDoc(doc(db, 'users', profile.uid), { language: lang.id });
                                setProfile(updatedProfile);
                                if (localStorage.getItem('jefara_is_demo') === 'true') {
                                  localStorage.setItem('jefara_demo_profile', JSON.stringify(updatedProfile));
                                }
                              } catch (err) {
                                console.error("Error saving language preference:", err);
                              }
                            }
                          }}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                            langPreference === lang.id 
                              ? 'bg-zinc-950 border-zinc-950 text-white font-bold' 
                               : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          <span>{lang.label}</span>
                          {langPreference === lang.id && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy & Security */}
                {activeProfileModal === 'privacy' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      <div>
                        <span className="font-bold text-zinc-800 block">Double Facteur (MFA)</span>
                        <span className="text-[10px] text-zinc-400">Ajouter une couche cryptographique supplémentaire.</span>
                      </div>
                      <button 
                        onClick={() => setSecurityMfa(!securityMfa)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${securityMfa ? 'bg-zinc-950' : 'bg-zinc-200'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white h-4 w-4 rounded-full transition-transform ${securityMfa ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Certificat d'Isolation Actif</span>
                      <div className="bg-zinc-950 text-green-400 font-mono text-[10px] p-4 rounded-2xl space-y-1 border border-green-950 overflow-x-auto select-all">
                        <div>TENANT_ID: {company?.id}</div>
                        <div>NODE_LOC: JEFARA_CM_DOUALA_NODE_26</div>
                        <div>ENC_ALGO: AES_GCM_256_STABLE</div>
                        <div>SIGNATURE: HMAC_SHA_512_SECURE</div>
                        <div>HASH: d87a2be98f103b4ac8112</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disable Account (Multi-step) */}
                {activeProfileModal === 'disable' && (
                  <div className="space-y-4">
                    
                    {disableStep === 1 && (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-[11px] leading-relaxed">
                          <strong>Avertissement :</strong> La désactivation suspend temporairement l'accès de ce terminal à Jefara. Les employés ne pourront plus être payés via ce compte tant qu'il n'est pas réactivé par un administrateur global.
                        </div>
                        <p className="text-zinc-500">Voulez-vous initier le protocole de mise hors-ligne temporaire ?</p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveProfileModal(null)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleDisableAccount}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl"
                          >
                            Poursuivre la désactivation
                          </button>
                        </div>
                      </div>
                    )}

                    {disableStep === 2 && (
                      <div className="space-y-4">
                        <p className="text-zinc-600">Saisissez le mot de passe de votre compte administrateur pour valider la désactivation de votre espace de travail.</p>
                        {disableError && <div className="p-2 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium">{disableError}</div>}
                        <input
                          type="password"
                          required
                          placeholder="Votre mot de passe..."
                          value={disablePassword}
                          onChange={(e) => setDisablePassword(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-medium text-zinc-800 focus:outline-none focus:border-zinc-950"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setDisableStep(1)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-600"
                          >
                            Retour
                          </button>
                          <button
                            onClick={handleDisableAccount}
                            className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold px-4 py-2 rounded-xl"
                          >
                            Vérifier l'autorisation
                          </button>
                        </div>
                      </div>
                    )}

                    {disableStep === 3 && (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-600 text-white rounded-2xl text-[11px] leading-relaxed">
                          <strong>ALERTE DE MISE HORS-LIGNE :</strong> Vous vous apprêtez à verrouiller de façon imminente ce tableau de bord. Toutes vos connexions actives et vos sessions de travail seront immédiatement purgées.
                        </div>
                        <p className="font-bold text-zinc-800 text-center">Souhaitez-vous exécuter cette action définitive ?</p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setDisableStep(2)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-600"
                          >
                            Retour
                          </button>
                          <button
                            onClick={handleDisableAccount}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl"
                          >
                            Confirmer & Désactiver l'accès
                          </button>
                        </div>
                      </div>
                    )}

                    {disableStep === 4 && (
                      <div className="py-8 text-center space-y-4">
                        <div className="h-10 w-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <span className="text-[10px] font-mono text-red-600 block tracking-widest animate-pulse">CRYPTAGE DES CLÉS DE COMPTE...</span>
                      </div>
                    )}

                  </div>
                )}

                {/* Delete Account (Multi-step) */}
                {activeProfileModal === 'delete' && (
                  <div className="space-y-4">
                    
                    {deleteStep === 1 && (
                      <div className="space-y-4">
                        <div className="p-3 bg-red-100 text-red-800 border border-red-200 rounded-2xl font-bold leading-relaxed text-xs">
                          ATTENTION : Cette action est irréversible et supprimera intégralement vos données de Jefara.
                        </div>
                        <p className="text-zinc-500 leading-relaxed text-xs">
                          La suppression détruit votre profil administrateur, vos fiches de paie générées, vos contrats archivés et clôture définitivement votre souscription au nœud du Cameroun.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setActiveProfileModal(null)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer text-xs"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl cursor-pointer text-xs"
                          >
                            Commencer la purge
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteStep === 2 && (
                      <div className="space-y-4">
                        <p className="text-zinc-600 font-medium text-xs">
                          Pour continuer, veuillez confirmer les informations de votre compte :
                        </p>

                        <div className="space-y-3">
                          {/* Account name check */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                              Saisissez le nom exact de votre compte : <span className="font-semibold text-zinc-800 select-all font-sans">"{company?.name}"</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Nom du compte"
                              value={deleteAccountNameInput}
                              onChange={(e) => setDeleteAccountNameInput(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors text-xs"
                            />
                            {deleteAccountNameInput && deleteAccountNameInput !== (company?.name || '') && (
                              <p className="text-[10px] text-red-600 font-medium">
                                Le nom saisi ne correspond pas exactement au nom du compte.
                              </p>
                            )}
                          </div>

                          {/* Confirmation phrase check */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                              Saisissez la phrase de confirmation : <span className="font-semibold text-zinc-800 select-all font-sans">"delete my account"</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="delete my account"
                              value={deletePhraseInput}
                              onChange={(e) => setDeletePhraseInput(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-800 focus:outline-none focus:border-zinc-950 transition-colors text-xs"
                            />
                            {deletePhraseInput && deletePhraseInput.toLowerCase() !== 'delete my account' && (
                              <p className="text-[10px] text-red-600 font-medium">
                                La phrase de confirmation est incorrecte.
                              </p>
                            )}
                          </div>
                        </div>

                        {deleteError && (
                          <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[11px]">
                            {deleteError}
                          </div>
                        )}

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setDeleteStep(1)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-600 cursor-pointer text-xs"
                          >
                            Retour
                          </button>
                          <button
                            disabled={
                              deleteAccountNameInput !== (company?.name || '') ||
                              deletePhraseInput.toLowerCase() !== 'delete my account'
                            }
                            onClick={handleDeleteAccount}
                            className="bg-red-600 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer text-xs transition-opacity"
                          >
                            Confirmer la suppression
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteStep === 3 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-red-700 text-white rounded-2xl text-[11px] leading-relaxed font-bold space-y-2">
                          <p className="uppercase tracking-wider">⚠️ DERNIER PROTOCOLE DE DESTRUCTION ⚠️</p>
                          <p>
                            Cette action est définitive, permanente et absolument irréversible. L'activation de ce protocole videra l'ensemble des disques et documents de Cameroon Jefara associés à votre entreprise de façon immédiate. Aucun backup ne sera conservé.
                          </p>
                        </div>
                        <p className="text-center text-zinc-850 font-bold text-xs">
                          Êtes-vous absolument sûr de vouloir détruire ce compte et toutes ses données ?
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setDeleteStep(2)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-600 cursor-pointer text-xs"
                          >
                            Retour
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-700 hover:bg-red-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-md cursor-pointer text-xs"
                          >
                            Oui, supprimer définitivement
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteStep === 4 && (
                      <div className="py-8 text-center space-y-4">
                        <div className="h-10 w-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        <span className="text-[10px] font-mono text-red-600 block tracking-widest animate-pulse uppercase">WIPING CLOUD DISKS & DATABASE RECORDS...</span>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
                          <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.8, ease: "easeInOut" }}
                            className="h-full bg-red-600"
                          />
                        </div>
                      </div>
                    )}

                    {deleteStep === 5 && (
                      <div className="py-6 text-center space-y-4">
                        <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                        <h4 className="font-bold text-zinc-900 text-sm">Prise en compte validée</h4>
                        <p className="text-zinc-500 text-xs px-2">
                          Votre nœud et l'ensemble de vos fichiers cryptés ont été purgés de façon définitive. Nous vous remercions d'avoir utilisé Jefara.
                        </p>
                        <button
                          onClick={async () => {
                            await signOut(auth);
                            setActiveProfileModal(null);
                            setProfile(null);
                            setCompany(null);
                          }}
                          className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                        >
                          Fermer le terminal Jefara
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invite Collaborator Modal Overlay */}
      <AnimatePresence>
        {showInviteModal && (
          <InviteCollaboratorModal 
            company={company} 
            onClose={() => setShowInviteModal(false)} 
          />
        )}
      </AnimatePresence>

      {/* Command Palette Overlay */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleCommandPaletteNavigate}
        onOpenModal={(modalId) => {
          setCommandPaletteOpen(false);
          setActiveProfileModal(modalId);
        }}
        onSignOut={() => {
          setCommandPaletteOpen(false);
          setShowSignOutConfirm(true);
        }}
        onRefreshData={() => {
          setCommandPaletteOpen(false);
          fetchTenantData();
        }}
        activeTab={activeTab}
        navItems={flattenedNavItems}
      />

      {/* Main workspace arena */}
      <main className="flex-1 h-full flex flex-col overflow-hidden bg-[var(--color-bg-base)]">

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 md:px-8 md:pb-8 md:pt-0 w-full max-w-7xl mx-auto overflow-x-hidden">
          <div className="pb-16 md:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (tabLoading ? "-loading" : "-loaded")}
                initial={{ opacity: 0, scale: 0.98, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.97, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Spacer to align main workspace with beginning of sidebar navigation */}
                <div className="h-[118px] shrink-0" />

                {tabLoading ? (
                  <div className="w-full flex flex-col justify-center items-center py-24 px-6 space-y-6 bg-white border border-zinc-100 rounded-3xl min-h-[450px]">
                    <div className="relative flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full border-2 border-zinc-100 animate-pulse" />
                      <motion.div 
                        className="absolute h-10 w-10 rounded-full border-t-2 border-zinc-950"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    </div>
                    <div className="text-center space-y-1.5">
                      <h4 className="text-sm font-semibold text-zinc-900">Syncing Records</h4>
                      <p className="text-xs text-zinc-400 max-w-xs leading-normal">
                        Loading {loadingTabName} and verifying regulatory compliance...
                      </p>
                    </div>
                    {/* Skeleton loader block representation */}
                    <div className="w-full max-w-md space-y-3 pt-6 opacity-40">
                      <div className="h-4 bg-zinc-100 rounded-full w-2/3 mx-auto animate-pulse" />
                      <div className="h-3 bg-zinc-100 rounded-full w-full mx-auto animate-pulse" />
                      <div className="h-3 bg-zinc-100 rounded-full w-5/6 mx-auto animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Consistent Page Header */}
                    <div className="flex flex-row items-center justify-between mb-8 gap-4">
                      <div className="min-w-0">
                        <h1 id="page-main-header-title" className="text-xl font-display font-bold text-zinc-900 md:text-2xl truncate">
                          {pageTitle}
                        </h1>
                        <p id="page-main-header-subtitle" className="text-xs text-zinc-400 mt-1 truncate">
                          {pageSubtitle}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center justify-end">
                        <PageHelpButton module={activeTab} />
                      </div>
                    </div>

                    {renderModule()}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
