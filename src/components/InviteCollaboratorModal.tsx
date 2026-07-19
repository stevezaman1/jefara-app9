import React, { useState, useEffect } from 'react';
import { Company, CollaboratorInvitation } from '../types';
import { 
  X, Mail, Shield, Check, Copy, RefreshCw, AlertCircle, 
  Trash2, Send, HelpCircle, Layers, CheckSquare, Square
} from 'lucide-react';
import { db, collection, doc, setDoc, getDocs, updateDoc, deleteDoc } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface InviteCollaboratorModalProps {
  company: Company;
  onClose: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_employees', name: 'Read Employees', desc: 'Allows viewing employee profiles and contracts' },
  { id: 'manage_employees', name: 'Manage Employees', desc: 'Allows adding, editing, or archiving employees' },
  { id: 'manage_payroll', name: 'Manage Payroll', desc: 'Allows running, validating, and approving payroll cycles' },
  { id: 'manage_leaves', name: 'Approve Leaves', desc: 'Allows approving or rejecting leave requests' },
  { id: 'manage_attendance', name: 'Track Attendance', desc: 'Allows monitoring clock-ins and approving overtime' },
  { id: 'manage_recruitment', name: 'Manage Jobs & Recruits', desc: 'Allows creating job openings and managing applicants' },
  { id: 'manage_accounting', name: 'Manage Ledger', desc: 'Allows adding expense claims and viewing books' },
  { id: 'manage_financial_services', name: 'Staff Financials', desc: 'Allows managing advances, loans, and savings' },
  { id: 'manage_documents', name: 'Manage Digital Vault', desc: 'Allows signing contracts and uploading files' },
  { id: 'manage_settings', name: 'System Settings', desc: 'Allows modifying company settings and preferences' }
];

export default function InviteCollaboratorModal({ company, onClose }: InviteCollaboratorModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Owner' | 'Admin' | 'HR' | 'Manager' | 'Employee'>('Admin');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    AVAILABLE_PERMISSIONS.map(p => p.id) // Default all for Admin
  );
  
  // Pending invites state
  const [invitations, setInvitations] = useState<CollaboratorInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invite' | 'pending'>('invite');

  // Load departments from company data or default
  const activeDepts = company.departmentsData && company.departmentsData.length > 0
    ? company.departmentsData.filter(d => d.status === 'Active').map(d => d.name)
    : company.departments || [];

  // Fetch existing invitations
  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const inviteSnap = await getDocs(collection(db, 'companies', company.id, 'invitations'));
      const list = inviteSnap.docs.map(d => d.data() as CollaboratorInvitation);
      // Sort by newest
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setInvitations(list);
    } catch (err: any) {
      console.error("Error loading collaborator invitations:", err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [company.id]);

  // Handle role defaults changes
  useEffect(() => {
    if (role === 'Admin' || role === 'Owner') {
      setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
    } else if (role === 'HR') {
      setSelectedPermissions(['view_employees', 'manage_employees', 'manage_leaves', 'manage_attendance', 'manage_documents']);
    } else if (role === 'Manager') {
      setSelectedPermissions(['view_employees', 'manage_leaves', 'manage_attendance']);
    } else {
      setSelectedPermissions([]);
    }
  }, [role]);

  const toggleDept = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleCopyLink = (inviteId: string, link: string) => {
    try {
      navigator.clipboard.writeText(link);
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback
      console.error("Failed to copy using navigator.clipboard, trying fallback...", err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid collaborator email address.");
      return;
    }

    setSubmitting(true);
    try {
      const inviteId = `invite_${Math.random().toString(36).substring(2, 11)}`;
      const generatedLink = `${window.location.origin}/?invite=${inviteId}&company=${company.id}`;
      
      const newInvite: CollaboratorInvitation = {
        id: inviteId,
        companyId: company.id,
        email: email.trim().toLowerCase(),
        role,
        departments: selectedDepartments,
        permissions: selectedPermissions,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        inviteLink: generatedLink
      };

      await setDoc(doc(db, 'companies', company.id, 'invitations', inviteId), newInvite);
      
      setSuccess(`Invitation successfully generated for ${newInvite.email}!`);
      setEmail('');
      setSelectedDepartments([]);
      
      // Refresh pending list
      await fetchInvitations();
      
      // Switch tab to view it
      setTimeout(() => {
        setActiveTab('pending');
        setSuccess(null);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Failed to create collaborator invitation.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await updateDoc(doc(db, 'companies', company.id, 'invitations', inviteId), {
        status: 'Cancelled'
      });
      await fetchInvitations();
    } catch (err: any) {
      console.error("Error cancelling invitation:", err);
    }
  };

  const handleDeleteInviteRecord = async (inviteId: string) => {
    try {
      await deleteDoc(doc(db, 'companies', company.id, 'invitations', inviteId));
      await fetchInvitations();
    } catch (err: any) {
      console.error("Error deleting invitation record:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white border border-zinc-150 rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-zinc-100 flex items-center justify-between bg-violet-950 text-white">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-xl text-white">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base leading-none">Invite Collaborator</h3>
              <p className="text-[11px] text-violet-200 mt-1 font-sans">
                Grant enterprise-grade workspace access to administrative peers
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-100 bg-zinc-50/50 px-6 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'invite' 
                ? 'border-violet-600 text-violet-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            New Invitation
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'pending' 
                ? 'border-violet-600 text-violet-600' 
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Pending Invites
            {invitations.filter(i => i.status === 'Pending').length > 0 && (
              <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {invitations.filter(i => i.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'invite' ? (
              <motion.form 
                key="invite-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendInvite}
                className="space-y-6"
              >
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Collaborator Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    Collaborator Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., administrator@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-violet-500 rounded-2xl px-4 py-3.5 text-xs font-medium focus:outline-none transition-all placeholder:text-zinc-400"
                  />
                </div>

                {/* Role Allocation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-zinc-400" />
                    Administrative Role
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(['Owner', 'Admin', 'HR', 'Manager', 'Employee'] as const).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`px-3 py-3 rounded-2xl text-xs font-bold transition-all border text-center ${
                          role === r
                            ? 'bg-violet-50 border-violet-600 text-violet-700 shadow-sm'
                            : 'bg-zinc-50/50 border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans italic mt-1.5">
                    {role === 'Owner' && 'Super Administrator with full ownership and root terminal control keys.'}
                    {role === 'Admin' && 'Full system setup privileges, access to general ledger and payroll validations.'}
                    {role === 'HR' && 'Human Resources staff focused on directory, leaves, time cards, and documents.'}
                    {role === 'Manager' && 'Department head access restricted to matching department personnel & leaves.'}
                    {role === 'Employee' && 'Self-service read-only access to custom payroll payslips & leaves.'}
                  </p>
                </div>

                {/* Department scope */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-zinc-400" />
                    Department Restrictions (Optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeDepts.map((dept) => {
                      const isSelected = selectedDepartments.includes(dept);
                      return (
                        <button
                          type="button"
                          key={dept}
                          onClick={() => toggleDept(dept)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                          }`}
                        >
                          {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                          {dept}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans">
                    Leave unselected to grant global scope access across all departments.
                  </p>
                </div>

                {/* Custom Permission Matrix */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide block">
                    Security Permission Gates
                  </label>
                  <div className="bg-zinc-50/50 border border-zinc-150 rounded-2xl p-4 max-h-[220px] overflow-y-auto divide-y divide-zinc-100 scrollbar-thin">
                    {AVAILABLE_PERMISSIONS.map((perm) => {
                      const checked = selectedPermissions.includes(perm.id);
                      return (
                        <div 
                          key={perm.id} 
                          onClick={() => togglePermission(perm.id)}
                          className="flex items-start gap-3 py-2.5 cursor-pointer select-none group"
                        >
                          <span className="text-zinc-400 group-hover:text-violet-600 transition-colors mt-0.5">
                            {checked ? (
                              <CheckSquare className="h-4 w-4 text-violet-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </span>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-zinc-800 block">{perm.name}</span>
                            <span className="text-[10px] text-zinc-400 leading-normal block">{perm.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer submit */}
                <div className="pt-2 border-t border-zinc-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-3 border border-zinc-200 rounded-2xl font-bold text-zinc-700 hover:bg-zinc-50 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-violet-950 text-white hover:bg-violet-900 active:scale-95 px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Keys...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Invite & Copy Link
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="pending-invites"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 min-h-[300px]"
              >
                {loadingInvitations ? (
                  <div className="py-20 text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-violet-600 animate-spin mx-auto" />
                    <span className="text-xs font-semibold text-zinc-400 block font-mono">Synchronizing keys...</span>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-[24px] space-y-3 flex flex-col items-center justify-center bg-zinc-50/50">
                    <Mail className="h-10 w-10 text-zinc-300" />
                    <h4 className="text-xs font-bold text-zinc-600">No pending invitations found</h4>
                    <p className="text-[10px] text-zinc-400 max-w-xs leading-normal">
                      Administrative invites issued on behalf of {company.name} will be tracked here with active secure cryptographic credentials.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((invite) => (
                      <div 
                        key={invite.id}
                        className="p-5 border border-zinc-150 rounded-2xl bg-zinc-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-200 transition-colors"
                      >
                        <div className="space-y-1.5 max-w-md">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-zinc-900 block">{invite.email}</span>
                            <span className="text-[9px] font-mono uppercase bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-semibold">
                              {invite.role}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              invite.status === 'Pending' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : invite.status === 'Accepted'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-zinc-100 text-zinc-400'
                            }`}>
                              {invite.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                            <span>Issued: {new Date(invite.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Permissions: {invite.permissions.length} active gates</span>
                          </div>

                          {invite.departments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[9px] text-zinc-400 font-semibold font-mono">Departments:</span>
                              {invite.departments.map(d => (
                                <span key={d} className="bg-zinc-100 text-zinc-600 font-mono text-[8px] px-1.5 py-0.5 rounded">
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}

                          {invite.status === 'Pending' && invite.inviteLink && (
                            <div className="mt-2 flex items-center gap-1.5 bg-zinc-100/60 p-2 rounded-xl border border-zinc-150/40">
                              <span className="text-[9px] font-mono text-zinc-500 truncate flex-1 block">
                                {invite.inviteLink}
                              </span>
                              <button
                                onClick={() => handleCopyLink(invite.id, invite.inviteLink || '')}
                                className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-800 transition-all active:scale-95"
                                title="Copy Access Link"
                              >
                                {copiedId === invite.id ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {invite.status === 'Pending' && (
                            <button
                              onClick={() => handleCancelInvite(invite.id)}
                              className="px-3 py-2 bg-white border border-zinc-200 hover:border-red-200 text-zinc-600 hover:text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              Cancel Access
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInviteRecord(invite.id)}
                            className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-xl transition-all"
                            title="Delete Invite Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
