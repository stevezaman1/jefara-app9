export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  companyId: string;
  role: 'Owner' | 'Admin' | 'HR' | 'Manager' | 'Employee';
  createdAt: string;
  themePalette?: 'jefara-violet' | 'midnight-blue' | 'emerald-green' | 'graphite-black' | 'burgundy';
  themePreference?: 'light' | 'dark';
  avatarColor?: string;
  photoUrl?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  language?: string;
  timezone?: string;
  birthday?: string;
}

export interface Company {
  id: string;
  name: string;
  registrationNumber?: string;
  country: string;
  currency: string;
  departments: string[];
  roles: string[];
  payrollSettings?: {
    socialSecurityRateEmployer: number; // e.g. CNPS rate in Cameroon (approx 16.2%)
    socialSecurityRateEmployee: number; // e.g. approx 4.2%
    taxRateBase: number; // e.g. IRPP rate
  };
  accountingSettings?: {
    payrollJournalCode: string;
    employerChargesAccount: string;
    salaryExpenseAccount: string;
  };
  createdAt: string;
  // Expanded profile fields
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  businessType?: string;
  headquarters?: string;
  preferences?: {
    language: string;
    workHoursPerDay: number;
    timezone: string;
    autoApproveLeave: boolean;
  };
  departmentsData?: DepartmentDetail[];
  gradesData?: GradeDetail[];
  ruleMatrixData?: RuleDetail[];
}

export interface DepartmentDetail {
  id: string;
  name: string;
  managerId?: string;
  managerName?: string;
  status: 'Active' | 'Archived';
  employeeCount: number;
  budget?: number;
  createdAt: string;
  description?: string;
}

export interface GradeDetail {
  id: string;
  name: string;
  code: string;
  salaryMin: number;
  salaryMax: number;
  description?: string;
  status: 'Active' | 'Archived';
  createdAt: string;
}

export interface RuleDetail {
  id: string;
  name: string;
  type: 'Allowance' | 'Deduction' | 'Tax';
  valueType: 'Percentage' | 'Fixed';
  value: number;
  description?: string;
  active: boolean;
  targetGrade?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: 'Active' | 'Archived' | 'Terminated';
  joiningDate: string;
  terminationDate?: string;
  terminationReason?: string;
  basicSalary: number;
  bankAccountNumber?: string;
  bankName?: string;
  createdAt: string;
  avatarColor?: string;
}

export const VIBRANT_AVATAR_COLORS = [
  '#ec4899', '#f43f5e', '#8b5cf6', '#a855f7', '#6366f1',
  '#2563eb', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981',
  '#059669', '#f59e0b', '#d97706', '#dc2626'
];

export function getRandomAvatarColor(): string {
  return VIBRANT_AVATAR_COLORS[Math.floor(Math.random() * VIBRANT_AVATAR_COLORS.length)];
}

export interface PayrollRun {
  id: string;
  companyId: string;
  month: string; // e.g. "January", "February"
  year: number;
  status: 'Draft' | 'Validated' | 'Approved' | 'Paid';
  totalBasic: number;
  totalBonuses: number;
  totalDeductions: number;
  totalNet: number;
  processedBy: string;
  processedAt: string;
}

export interface PayslipBonus {
  name: string;
  amount: number;
}

export interface PayslipDeduction {
  name: string;
  amount: number;
}

export interface Payslip {
  id: string;
  companyId: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  bonuses: PayslipBonus[];
  deductions: PayslipDeduction[];
  netSalary: number;
  month: string;
  year: number;
  status: 'Draft' | 'Paid';
}

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid' | 'Other';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  createdAt: string;
}

export interface AttendanceLog {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  remote: boolean;
  overtimeHours: number;
  status: string; // "Present", "Absent", "Late"
  overtimeApproved?: boolean;
  lateHours?: number;
  expectedIn?: string;
  earlyDepartureMinutes?: number;
}

export interface JobPosting {
  id: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  description: string;
  salaryRange?: string;
  status: 'Draft' | 'Active' | 'Closed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  companyId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  resumeUrl?: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  notes?: string;
  createdAt: string;
}

export interface AccountingEntry {
  id: string;
  companyId: string;
  type: 'Journal' | 'ExpenseClaim' | 'BudgetAllocation';
  description: string;
  amount: number;
  category?: string; // e.g. "Travel", "Equipment", "Salary"
  department?: string;
  status?: string; // e.g. "Approved", "Paid", "Pending"
  date: string;
  createdAt: string;
}

export interface FinancialServiceRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  type: 'Salary Advance' | 'Loan' | 'Insurance' | 'Savings';
  amount: number;
  repaymentTermMonths?: number;
  monthlyDeduction?: number;
  purpose?: string;
  status: 'Pending' | 'Approved' | 'Active' | 'Repaid' | 'Rejected';
  createdAt: string;
}

export interface HRDocument {
  id: string;
  companyId: string;
  employeeId?: string;
  employeeName?: string;
  name: string;
  category: 'Contract' | 'Certificate' | 'ID Proof' | 'Tax' | 'Payslip' | 'Other';
  fileContent?: string; // base64 or text representation
  signatureRequired: boolean;
  signed: boolean;
  signedAt?: string;
  createdAt: string;
}

export interface CollaboratorInvitation {
  id: string;
  companyId: string;
  email: string;
  role: 'Owner' | 'Admin' | 'HR' | 'Manager' | 'Employee';
  departments: string[];
  permissions: string[];
  status: 'Pending' | 'Accepted' | 'Cancelled';
  createdAt: string;
  inviteLink?: string;
}
