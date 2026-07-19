import React, { useState } from 'react';
import { Company, Employee, getRandomAvatarColor } from '../types';
import { 
  Plus, Users, Search, Mail, Phone, Calendar, 
  MapPin, ShieldAlert, Archive, FileText, UserMinus, 
  ChevronRight, Network, RefreshCw, CreditCard 
} from 'lucide-react';
import { db, doc, setDoc, deleteDoc, updateDoc } from '../firebase';
import { PageHelpButton } from './PageHelpButton';
import { motion } from 'motion/react';

interface EmployeesProps {
  company: Company;
  employees: Employee[];
  onRefresh: () => void;
  activeSubTab?: string;
}

type SubTab = 'directory' | 'add' | 'orgchart' | 'archive';

const getEmployeeColor = (emp: Employee) => {
  if (emp.avatarColor) return emp.avatarColor;
  const charCode = (emp.firstName.charCodeAt(0) || 0) + (emp.lastName.charCodeAt(0) || 0);
  const colors = [
    '#ec4899', '#f43f5e', '#8b5cf6', '#a855f7', '#6366f1',
    '#2563eb', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981',
    '#059669', '#f59e0b', '#d97706', '#dc2626'
  ];
  return colors[charCode % colors.length];
};

export default function EmployeesModule({ company, employees, onRefresh, activeSubTab }: EmployeesProps) {
  const [subTab, setSubTab] = useState<SubTab>('directory');

  React.useEffect(() => {
    if (activeSubTab === 'employees-orgchart') {
      setSubTab('orgchart');
    } else if (activeSubTab === 'employees-profiles') {
      setSubTab('add');
    } else if (activeSubTab === 'employees-archive' || activeSubTab === 'employees-history' || activeSubTab === 'employees-offboarding') {
      setSubTab('archive');
    } else {
      setSubTab('directory');
    }
  }, [activeSubTab]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(company.departments[0] || 'Operations');
  const [role, setRole] = useState(company.roles[0] || 'Junior Staff');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [saving, setSaving] = useState(false);

  // Termination form states
  const [showTermDialog, setShowTermDialog] = useState(false);
  const [terminationReason, setTerminationReason] = useState('');
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !basicSalary) return;

    setSaving(true);
    try {
      const employeeId = 'emp_' + Math.random().toString(36).substring(2, 11);
      const newEmployee: Employee = {
        id: employeeId,
        companyId: company.id,
        firstName,
        lastName,
        email,
        phone,
        department,
        role,
        status: 'Active',
        joiningDate,
        basicSalary: parseFloat(basicSalary),
        bankAccountNumber,
        bankName,
        createdAt: new Date().toISOString(),
        avatarColor: getRandomAvatarColor()
      };

      await setDoc(doc(db, 'companies', company.id, 'employees', employeeId), newEmployee);
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setBasicSalary('');
      setBankAccountNumber('');
      setBankName('');
      setSubTab('directory');
      onRefresh();
    } catch (err) {
      console.error("Error creating employee document: ", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const docRef = doc(db, 'companies', company.id, 'employees', selectedEmployee.id);
      await updateDoc(docRef, {
        status: 'Terminated',
        terminationDate,
        terminationReason
      });
      setSelectedEmployee(null);
      setShowTermDialog(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveEmployee = async (empId: string) => {
    try {
      const docRef = doc(db, 'companies', company.id, 'employees', empId);
      await updateDoc(docRef, {
        status: 'Archived'
      });
      setSelectedEmployee(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const activeEmployees = employees.filter(e => e.status === 'Active');
  const archivedEmployees = employees.filter(e => e.status === 'Archived' || e.status === 'Terminated');

  const filteredEmployees = activeEmployees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {subTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search staff, departments, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-zinc-150 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
              />
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white border border-zinc-100 rounded-[32px] flex flex-col items-center justify-center space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="h-12 w-12 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-zinc-900">No employees yet.</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-normal">
                    Secure workspace isolation is initialized. Please onboard your first employee to populate the directory and activate administrative workflows.
                  </p>
                </div>
                <button 
                  onClick={() => setSubTab('add')}
                  className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all shadow-sm"
                >
                  Onboard Your First Employee
                </button>
              </div>
            ) : (
              <div className="bg-white border border-zinc-100 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.015)] p-2 space-y-1">
                {filteredEmployees.map((emp) => (
                  <div 
                    key={emp.id} 
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-4 flex items-center justify-between cursor-pointer rounded-2xl transition-all ${selectedEmployee?.id === emp.id ? 'bg-violet-50/50 border-l-[3.5px] border-violet-600 pl-3 shadow-[0_4px_12px_rgba(124,58,237,0.02)]' : 'hover:bg-zinc-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full text-white flex items-center justify-center font-bold text-sm tracking-wide shrink-0"
                        style={{ backgroundColor: getEmployeeColor(emp) }}
                      >
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900">{emp.firstName} {emp.lastName}</h4>
                        <div className="flex gap-2 text-[11px] text-zinc-500 font-medium mt-0.5">
                          <span>{emp.department}</span>
                          <span>•</span>
                          <span>{emp.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-zinc-800">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(emp.basicSalary)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Details Drawer / Column */}
          <div className="lg:col-span-5">
            {selectedEmployee ? (
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xs space-y-6 sticky top-6">
                <div className="flex flex-col items-center text-center pb-6 border-b border-zinc-100">
                  <div 
                    className="h-16 w-16 rounded-full text-white flex items-center justify-center font-bold text-xl mb-3 tracking-wide shadow-md"
                    style={{ backgroundColor: getEmployeeColor(selectedEmployee) }}
                  >
                    {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                  </div>
                  <h3 className="font-display font-bold text-lg text-zinc-900 tracking-tight">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-100 mt-1.5">
                    {selectedEmployee.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Corporate Identity</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Department</span>
                      <span className="font-medium text-zinc-900 mt-0.5 block">{selectedEmployee.department}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Job Role</span>
                      <span className="font-medium text-zinc-900 mt-0.5 block">{selectedEmployee.role}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Joining Date</span>
                      <span className="font-medium text-zinc-900 mt-0.5 block">{new Date(selectedEmployee.joiningDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">System Identifier</span>
                      <span className="font-mono text-[10px] text-zinc-600 mt-0.5 block">{selectedEmployee.id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Contact Information</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-zinc-700">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      <span>{selectedEmployee.email}</span>
                    </div>
                    {selectedEmployee.phone && (
                      <div className="flex items-center gap-2.5 text-zinc-700">
                        <Phone className="h-4 w-4 text-zinc-400" />
                        <span>{selectedEmployee.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Compensation & Banking</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-zinc-500 block">Basic Contract Base</span>
                      <span className="font-semibold text-zinc-900 mt-0.5 block">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(selectedEmployee.basicSalary)}
                      </span>
                    </div>
                    {selectedEmployee.bankName && (
                      <div>
                        <span className="text-zinc-500 block">Bank Institution</span>
                        <span className="font-medium text-zinc-900 mt-0.5 block">{selectedEmployee.bankName}</span>
                      </div>
                    )}
                    {selectedEmployee.bankAccountNumber && (
                      <div className="col-span-2">
                        <span className="text-zinc-500 block">Account Number / RIB</span>
                        <span className="font-mono text-xs text-zinc-700 mt-0.5 block tracking-wide">{selectedEmployee.bankAccountNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exit Controls */}
                <div className="pt-6 border-t border-zinc-100 flex gap-2">
                  <button 
                    onClick={() => setShowTermDialog(true)}
                    className="flex-1 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-semibold text-xs transition-colors"
                  >
                    <UserMinus className="h-4 w-4" />
                    Terminate Contract
                  </button>
                  <button 
                    onClick={() => handleArchiveEmployee(selectedEmployee.id)}
                    className="flex items-center justify-center p-2.5 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl transition-colors"
                    title="Archive Record"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 border border-zinc-100 border-dashed rounded-3xl p-8 text-center text-zinc-400 h-full flex flex-col items-center justify-center">
                <Users className="h-8 w-8 text-zinc-300 mb-2" />
                <p className="text-xs font-medium">Select a profile from the directory</p>
                <p className="text-[10px] text-zinc-400 max-w-xs mt-1 leading-normal">
                  Detailed metadata, compensations, CNPS rates, career history, and exit workflows will populate on screen.
                </p>
              </div>
            )}
          </div>
        </div>
      )}      {subTab === 'add' && (
        <form onSubmit={handleAddEmployee} className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-[0_10px_35px_rgba(0,0,0,0.015)] max-w-2xl space-y-6">
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Onboard New Team Member</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Add a legally binding labor contract. All inputs trigger localized wage, social security, and tax calculation formulas in Cameroon.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">First Name *</label>
              <input 
                type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Jean"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Last Name *</label>
              <input 
                type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Ndi"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Email Address *</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jean.ndi@company.cm"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Phone Number</label>
              <input 
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+237 6XX XX XX XX"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Department</label>
              <select 
                value={department} onChange={e => setDepartment(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all appearance-none"
              >
                {company.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Role / Grade</label>
              <select 
                value={role} onChange={e => setRole(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all appearance-none"
              >
                {company.roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Joining Date *</label>
              <input 
                type="date" required value={joiningDate} onChange={e => setJoiningDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Basic Contract Salary (Monthly) *</label>
              <div className="relative">
                <span className="absolute right-3.5 top-2.5 text-xs text-zinc-400 font-bold">{company.currency}</span>
                <input 
                  type="number" required value={basicSalary} onChange={e => setBasicSalary(e.target.value)}
                  placeholder="e.g. 250000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 pl-3.5 pr-12 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
                />
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 font-display">Bank Deposit Specifications</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Bank Name</label>
                  <input 
                    type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. BICEC, SG Cameroon, Afriland"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 font-display">Account Number (RIB)</label>
                  <input 
                    type="text" value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. CM21 10001 00001 12345678901 23"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-zinc-100">
            <button 
              type="button" onClick={() => setSubTab('directory')}
              className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={saving}
              className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? 'Creating cryptographic index...' : 'Register Contract & Onboard'}
            </button>
          </div>
        </form>
      )}

      {subTab === 'orgchart' && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Organization Chart</h3>
            <p className="text-xs text-zinc-500 mt-1">Visual reporting chain and structure hierarchy in Jefara.</p>
          </div>

          {activeEmployees.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
              <Network className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-medium">No reporting chart layout available</p>
              <p className="text-[10px] text-zinc-400 mt-1">Please add active contracts to build your enterprise reporting tree.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-6">
              {/* Simple tree rendering */}
              <div className="bg-zinc-900 text-white p-4 rounded-2xl text-center shadow-sm w-56">
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">Executive Board</span>
                <h4 className="text-xs font-semibold mt-1">Owner Workspace node</h4>
                <p className="text-[10px] text-zinc-300 mt-0.5">{company.name}</p>
              </div>

              <div className="h-8 w-0.5 bg-zinc-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                {activeEmployees.map(emp => (
                  <div key={emp.id} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-center hover:shadow-xs transition-shadow relative">
                    <div 
                      className="h-2 w-full rounded-t-2xl absolute top-0 left-0" 
                      style={{ backgroundColor: getEmployeeColor(emp) }}
                    />
                    <div 
                      className="h-10 w-10 rounded-full text-white flex items-center justify-center font-bold text-xs mx-auto mb-2 mt-2 shadow-xs"
                      style={{ backgroundColor: getEmployeeColor(emp) }}
                    >
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <h5 className="text-xs font-bold text-zinc-900">{emp.firstName} {emp.lastName}</h5>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{emp.department} • {emp.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'archive' && (
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Archives & System Exits</h3>
            <p className="text-xs text-zinc-500 mt-1">View non-active or terminated records for compliance auditing.</p>
          </div>

          {archivedEmployees.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
              <Archive className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-medium">No archived records</p>
              <p className="text-[10px] text-zinc-400 mt-1">Employee exit forms and archived contracts will persist here securely.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50 overflow-hidden border border-zinc-100 rounded-2xl">
              {archivedEmployees.map(emp => (
                <div key={emp.id} className="p-4 flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ backgroundColor: getEmployeeColor(emp) }}
                    >
                      {emp.firstName[0]}{emp.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-900">{emp.firstName} {emp.lastName}</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Status: <span className="font-bold text-red-600">{emp.status}</span> • Reason: {emp.terminationReason || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {emp.terminationDate && (
                    <span className="text-[10px] font-mono text-zinc-400">Exit: {new Date(emp.terminationDate).toLocaleDateString()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Termination Dialog */}
      {showTermDialog && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-150 rounded-3xl p-6 w-full max-w-md shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              <h3 className="font-display font-bold text-zinc-900">Confirm Contract Termination</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              You are terminating the contract for <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>. This record will move to Archives. It cannot be reverted.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Termination Date</label>
                <input 
                  type="date" value={terminationDate} onChange={e => setTerminationDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Reason for Dismissal / Exit</label>
                <textarea 
                  value={terminationReason} onChange={e => setTerminationReason(e.target.value)}
                  placeholder="e.g. Mutual Agreement, Redundancy, Resignation"
                  rows={3}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button 
                onClick={() => setShowTermDialog(false)}
                className="px-4 py-2 border border-zinc-200 rounded-xl text-xs font-semibold hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleTerminateEmployee}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                Terminate Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
