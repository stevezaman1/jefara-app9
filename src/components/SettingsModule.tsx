import React, { useState } from 'react';
import { Company, Employee, DepartmentDetail, GradeDetail, RuleDetail } from '../types';
import { t, useTranslation, setLanguage } from '../utils/translations';
import { 
  Settings, Building2, Plus, Trash2, 
  RefreshCw, Check, Sparkles, Coins, Edit2, X,
  Archive, RotateCcw, User, Layers, ShieldCheck,
  Mail, Phone, MapPin, Globe, Clock, Sliders,
  CheckCircle2, AlertCircle, Copy, ToggleLeft, ToggleRight,
  Info, BarChart3, ArrowUpRight, DollarSign
} from 'lucide-react';
import { auth, db, doc, updateDoc } from '../firebase';
import { signInWithEmailAndPassword, updatePassword, updateEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsProps {
  company: Company;
  employees: Employee[];
  profile: any; // UserProfile or null
  onRefresh: () => void;
  themePalette?: 'violet' | 'midnight' | 'emerald' | 'graphite' | 'burgundy';
  onThemePaletteChange?: (palette: 'violet' | 'midnight' | 'emerald' | 'graphite' | 'burgundy') => void;
  activeSubTab?: string;
}

export default function SettingsModule({ 
  company, 
  employees, 
  profile,
  onRefresh, 
  themePalette = 'violet', 
  onThemePaletteChange,
  activeSubTab
}: SettingsProps) {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState<'profile' | 'security' | 'departments' | 'grades' | 'rules' | 'payroll'>('profile');

  React.useEffect(() => {
    if (activeSubTab === 'settings-departments') {
      setSubTab('departments');
    } else if (activeSubTab === 'settings-security') {
      setSubTab('security');
    } else if (activeSubTab === 'settings-grades') {
      setSubTab('grades');
    } else if (activeSubTab === 'settings-rules') {
      setSubTab('rules');
    } else if (activeSubTab === 'settings-payroll') {
      setSubTab('payroll');
    } else {
      setSubTab('profile');
    }
  }, [activeSubTab]);

  React.useEffect(() => {
    if (profile) {
      setProfileName(profile.displayName || '');
      setProfileEmail(profile.email || '');
      setProfilePhone(profile.phone || '');
      setTwoFAEnabled(profile.twoFAEnabled ?? false);
    }
  }, [profile]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Profile States
  const [name, setName] = useState(company.name);
  const [regNumber, setRegNumber] = useState(company.registrationNumber || '');
  const [logoUrl, setLogoUrl] = useState(company.logoUrl || '');
  const [email, setEmail] = useState(company.email || 'contact@jefara.io');
  const [phone, setPhone] = useState(company.phone || '+237 670 123 456');
  const [address, setAddress] = useState(company.address || 'Bonanjo, Douala, Littoral');
  const [taxId, setTaxId] = useState(company.taxId || 'M061612457891U');
  const [businessType, setBusinessType] = useState(company.businessType || 'Société Anonyme (S.A.)');
  const [headquarters, setHeadquarters] = useState(company.headquarters || 'Douala HQ');
  const [country, setCountry] = useState(company.country || 'Cameroon');
  const [currency, setCurrency] = useState(company.currency || 'XAF');
  const [prefLanguage, setPrefLanguage] = useState(company.preferences?.language || 'fr');
  const [prefWorkHours, setPrefWorkHours] = useState(company.preferences?.workHoursPerDay?.toString() || '8');
  const [prefTimezone, setPrefTimezone] = useState(company.preferences?.timezone || 'GMT+1 (Africa/Douala)');
  const [prefAutoApproveLeave, setPrefAutoApproveLeave] = useState(company.preferences?.autoApproveLeave ?? false);

  // 1b. Account & Security States
  const [profileName, setProfileName] = useState(profile?.displayName || '');
  const [profileEmail, setProfileEmail] = useState(profile?.email || '');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(profile?.photoUrl || '');
  const [profileVerificationPassword, setProfileVerificationPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(profile?.twoFAEnabled ?? false);
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setProfileName(profile.displayName || '');
      setProfileEmail(profile.email || '');
      setProfilePhone(profile.phone || '');
      setProfilePhotoUrl(profile.photoUrl || '');
      setTwoFAEnabled(profile.twoFAEnabled ?? false);
    }
  }, [profile]);

  // Fallbacks & Backwards Compatibility Data Models
  const activeDeptsList: DepartmentDetail[] = company.departmentsData && company.departmentsData.length > 0
    ? company.departmentsData
    : company.departments.map((d, index) => ({
        id: `dept_${index}_${d.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: d,
        status: 'Active' as const,
        employeeCount: employees.filter(e => e.department === d).length,
        budget: 5000000 + (index * 1500000),
        createdAt: company.createdAt || new Date().toISOString(),
        description: `Cost center department responsible for local operations.`,
        managerId: undefined,
        managerName: undefined
      }));

  const activeGradesList = company.gradesData && company.gradesData.length > 0
    ? company.gradesData
    : [
        { id: 'gr_1', name: 'Executive Level', code: 'GR-EXEC', salaryMin: 800000, salaryMax: 2000000, status: 'Active' as const, createdAt: new Date().toISOString(), description: 'Top tier executive leadership' },
        { id: 'gr_2', name: 'Senior Staff', code: 'GR-SNR', salaryMin: 400000, salaryMax: 800000, status: 'Active' as const, createdAt: new Date().toISOString(), description: 'Department heads and technical experts' },
        { id: 'gr_3', name: 'Associate Specialist', code: 'GR-ASSOC', salaryMin: 200000, salaryMax: 400000, status: 'Active' as const, createdAt: new Date().toISOString(), description: 'Professional individual contributors' },
        { id: 'gr_4', name: 'Junior Support', code: 'GR-JUN', salaryMin: 80000, salaryMax: 200000, status: 'Active' as const, createdAt: new Date().toISOString(), description: 'Administrative and operational support' }
      ];

  const activeRulesList = company.ruleMatrixData && company.ruleMatrixData.length > 0
    ? company.ruleMatrixData
    : [
        { id: 'rule_1', name: 'CNPS Social Contribution', type: 'Deduction' as const, valueType: 'Percentage' as const, value: 4.2, description: 'National Social Insurance Fund deduction for Cameroonian staff', active: true, createdAt: new Date().toISOString() },
        { id: 'rule_2', name: 'Employer CNPS Contribution', type: 'Tax' as const, valueType: 'Percentage' as const, value: 16.2, description: 'Employer pension and workplace accident contribution', active: true, createdAt: new Date().toISOString() },
        { id: 'rule_3', name: 'Housing Allowance (Indemnité de Logement)', type: 'Allowance' as const, valueType: 'Fixed' as const, value: 50000, description: 'Standard residential support allowance', active: true, targetGrade: 'gr_1', createdAt: new Date().toISOString() },
        { id: 'rule_4', name: 'Transport Allowance', type: 'Allowance' as const, valueType: 'Fixed' as const, value: 25000, description: 'Standard commuter allowance', active: true, createdAt: new Date().toISOString() }
      ];

  // 2. Department CRUD States
  const [deptSearch, setDeptSearch] = useState('');
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptFormName, setDeptFormName] = useState('');
  const [deptFormManagerId, setDeptFormManagerId] = useState('');
  const [deptFormBudget, setDeptFormBudget] = useState('');
  const [deptFormDesc, setDeptFormDesc] = useState('');
  const [showDeleteDeptConfirm, setShowDeleteDeptConfirm] = useState<string | null>(null);

  // 3. Grade CRUD States
  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
  const [gradeFormName, setGradeFormName] = useState('');
  const [gradeFormCode, setGradeFormCode] = useState('');
  const [gradeFormMin, setGradeFormMin] = useState('');
  const [gradeFormMax, setGradeFormMax] = useState('');
  const [gradeFormDesc, setGradeFormDesc] = useState('');
  const [showDeleteGradeConfirm, setShowDeleteGradeConfirm] = useState<string | null>(null);

  // 4. Rule Matrix CRUD States
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleFormName, setRuleFormName] = useState('');
  const [ruleFormType, setRuleFormType] = useState<'Allowance' | 'Deduction' | 'Tax'>('Allowance');
  const [ruleFormValueType, setRuleFormValueType] = useState<'Percentage' | 'Fixed'>('Fixed');
  const [ruleFormValue, setRuleFormValue] = useState('');
  const [ruleFormDesc, setRuleFormDesc] = useState('');
  const [ruleFormGrade, setRuleFormGrade] = useState('All');
  const [showDeleteRuleConfirm, setShowDeleteRuleConfirm] = useState<string | null>(null);

  // 5. Regional Tax States
  const [socialSecurityRateEmployer, setSocialSecurityRateEmployer] = useState(
    company.payrollSettings?.socialSecurityRateEmployer?.toString() || '16.2'
  );
  const [socialSecurityRateEmployee, setSocialSecurityRateEmployee] = useState(
    company.payrollSettings?.socialSecurityRateEmployee?.toString() || '4.2'
  );
  const [taxRateBase, setTaxRateBase] = useState(
    company.payrollSettings?.taxRateBase?.toString() || '15'
  );

  // Helper trigger alerts
  const triggerToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Base64 Logo Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('La taille de l\'image doit être inférieure à 2Mo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
        triggerToast('Logo temporairement chargé. Enregistrez les modifications pour synchroniser.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Workspace Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerToast('Le nom de l\'entreprise est obligatoire.', 'error');
      return;
    }
    setSaving(true);
    try {
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, {
        name: name.trim(),
        registrationNumber: regNumber.trim(),
        logoUrl,
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        taxId: taxId.trim(),
        businessType: businessType.trim(),
        headquarters: headquarters.trim(),
        country: country.trim(),
        currency: currency.trim(),
        preferences: {
          language: prefLanguage,
          workHoursPerDay: parseFloat(prefWorkHours) || 8,
          timezone: prefTimezone,
          autoApproveLeave: prefAutoApproveLeave
        }
      });
      setLanguage(prefLanguage);
      triggerToast('Profil de nœud d\'entreprise mis à jour avec succès.', 'success');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerToast('Erreur lors de la synchronisation : ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 1c. Account & Security Handlers
  const verifyCurrentPassword = async (pwd: string): Promise<boolean> => {
    if (!profile) return false;

    // 1. Check local accounts first
    const localAccountsStr = localStorage.getItem('jefara_local_accounts');
    if (localAccountsStr) {
      try {
        const accounts = JSON.parse(localAccountsStr);
        if (Array.isArray(accounts)) {
          const matched = accounts.find(
            (acc: any) => acc.uid === profile.uid || acc.email.toLowerCase() === profile.email.toLowerCase()
          );
          if (matched) {
            return matched.password === pwd;
          }
        }
      } catch (e) {
        console.error("Local account parsing error during verification:", e);
      }
    }

    // 2. Try Firebase Auth re-authentication if it's a real Firebase user
    if (auth.currentUser && auth.currentUser.email) {
      try {
        await signInWithEmailAndPassword(auth, auth.currentUser.email, pwd);
        return true;
      } catch (err) {
        console.warn("Firebase re-authentication failed:", err);
        return false;
      }
    }

    // 3. Fallback check for demo sandbox mode
    if (localStorage.getItem('jefara_is_demo') === 'true') {
      return true; // Pass verification if no explicit local account was found
    }

    return false;
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        triggerToast('Profile photo must be smaller than 1MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoUrl(reader.result as string);
        triggerToast('Profile photo loaded. Save changes to update permanently.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      triggerToast('No active security profile context available.', 'error');
      return;
    }
    if (!profileName.trim() || !profileEmail.trim()) {
      triggerToast('Profile name and email address are required fields.', 'error');
      return;
    }

    const emailChanged = profileEmail.trim().toLowerCase() !== (profile.email || '').toLowerCase();

    setUpdatingSecurity(true);
    try {
      if (emailChanged) {
        if (!profileVerificationPassword) {
          triggerToast('Current password is required to change your email address.', 'error');
          setUpdatingSecurity(false);
          return;
        }
        const isPasswordCorrect = await verifyCurrentPassword(profileVerificationPassword);
        if (!isPasswordCorrect) {
          triggerToast('Incorrect current password. Verification failed.', 'error');
          setUpdatingSecurity(false);
          return;
        }

        // Try updating Firebase user email if possible
        if (auth.currentUser) {
          try {
            await updateEmail(auth.currentUser, profileEmail.trim());
          } catch (fbErr: any) {
            console.warn("Firebase updateEmail failed:", fbErr);
            if (fbErr.code === 'auth/requires-recent-login') {
              triggerToast('Sensitive action requires a fresh sign-in. Please log out and log back in.', 'error');
              setUpdatingSecurity(false);
              return;
            }
          }
        }
      }

      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName: profileName.trim(),
        email: profileEmail.trim(),
        phone: profilePhone.trim(),
        photoUrl: profilePhotoUrl
      });

      // If in demo mode, keep localStorage profile in sync
      if (localStorage.getItem('jefara_is_demo') === 'true') {
        const updated = {
          ...profile,
          displayName: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
          photoUrl: profilePhotoUrl
        };
        localStorage.setItem('jefara_demo_profile', JSON.stringify(updated));
      }

      // Update in local accounts list
      const localAccountsStr = localStorage.getItem('jefara_local_accounts');
      if (localAccountsStr) {
        try {
          let accounts = JSON.parse(localAccountsStr);
          if (Array.isArray(accounts)) {
            const idx = accounts.findIndex((acc: any) => acc.uid === profile.uid);
            if (idx !== -1) {
              accounts[idx].email = profileEmail.trim();
              accounts[idx].profile.displayName = profileName.trim();
              accounts[idx].profile.email = profileEmail.trim();
              accounts[idx].profile.phone = profilePhone.trim();
              accounts[idx].profile.photoUrl = profilePhotoUrl;
              localStorage.setItem('jefara_local_accounts', JSON.stringify(accounts));
            }
          }
        } catch {}
      }

      triggerToast('Your personal account profile has been updated successfully.', 'success');
      setProfileVerificationPassword('');
      onRefresh();
    } catch (err: any) {
      triggerToast('Error updating profile: ' + err.message, 'error');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      triggerToast('No active security profile context available.', 'error');
      return;
    }
    if (!oldPassword) {
      triggerToast('Please enter your current password.', 'error');
      return;
    }
    if (!newPassword) {
      triggerToast('Please specify a new security password.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      triggerToast('Security password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('The passwords you entered do not match.', 'error');
      return;
    }

    setUpdatingSecurity(true);
    try {
      const isPasswordCorrect = await verifyCurrentPassword(oldPassword);
      if (!isPasswordCorrect) {
        triggerToast('Incorrect current password. Verification failed.', 'error');
        setUpdatingSecurity(false);
        return;
      }

      // Try updating Firebase user password if possible
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, newPassword);
        } catch (fbErr: any) {
          console.warn("Firebase updatePassword failed:", fbErr);
          if (fbErr.code === 'auth/requires-recent-login') {
            triggerToast('Sensitive action requires a fresh sign-in. Please log out and log back in.', 'error');
            setUpdatingSecurity(false);
            return;
          }
        }
      }

      // Update in local accounts list
      const localAccountsStr = localStorage.getItem('jefara_local_accounts');
      if (localAccountsStr) {
        try {
          let accounts = JSON.parse(localAccountsStr);
          if (Array.isArray(accounts)) {
            const idx = accounts.findIndex((acc: any) => acc.uid === profile.uid);
            if (idx !== -1) {
              accounts[idx].password = newPassword;
              localStorage.setItem('jefara_local_accounts', JSON.stringify(accounts));
            }
          }
        } catch {}
      }

      triggerToast('Account password updated successfully across isolated nodes.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      triggerToast('Error changing security key: ' + err.message, 'error');
    } finally {
      setUpdatingSecurity(false);
    }
  };

  const handleToggle2FA = async () => {
    const nextVal = !twoFAEnabled;
    setTwoFAEnabled(nextVal);
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        twoFAEnabled: nextVal
      });
      triggerToast(nextVal ? 'Two-Factor Authentication (2FA) protection activated.' : 'Two-Factor Authentication (2FA) deactivated.', 'success');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLogoutOtherSessions = async () => {
    setUpdatingSecurity(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    triggerToast('All other session signatures revoked. Safe logout executed successfully.', 'success');
    setUpdatingSecurity(false);
  };

  // Save Departments
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormName.trim()) {
      triggerToast('Le nom du département est requis.', 'error');
      return;
    }
    setSaving(true);
    try {
      let updatedList = [...activeDeptsList];
      const mng = employees.find(emp => emp.id === deptFormManagerId);
      const mngName = mng ? `${mng.firstName} ${mng.lastName}` : undefined;

      if (editingDeptId) {
        // Edit mode
        updatedList = updatedList.map(d => d.id === editingDeptId ? {
          ...d,
          name: deptFormName.trim(),
          managerId: deptFormManagerId || undefined,
          managerName: mngName,
          budget: parseFloat(deptFormBudget) || 0,
          description: deptFormDesc.trim()
        } : d);
      } else {
        // Create mode
        const newD: DepartmentDetail = {
          id: `dept_${Math.random().toString(36).substring(2, 11)}`,
          name: deptFormName.trim(),
          managerId: deptFormManagerId || undefined,
          managerName: mngName,
          status: 'Active',
          employeeCount: 0,
          budget: parseFloat(deptFormBudget) || 0,
          description: deptFormDesc.trim(),
          createdAt: new Date().toISOString()
        };
        updatedList.push(newD);
      }

      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, {
        departmentsData: updatedList,
        departments: updatedList.map(d => d.name) // sync original array
      });

      triggerToast(editingDeptId ? 'Département modifié.' : 'Département créé avec succès.', 'success');
      setShowAddDeptModal(false);
      setEditingDeptId(null);
      resetDeptForm();
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveDept = async (id: string, archive: boolean) => {
    try {
      const updatedList = activeDeptsList.map(d => d.id === id ? {
        ...d,
        status: (archive ? 'Archived' : 'Active') as 'Active' | 'Archived'
      } : d);
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { departmentsData: updatedList });
      triggerToast(archive ? 'Département archivé.' : 'Département restauré.', 'success');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const handleDeleteDept = async (id: string) => {
    try {
      const updatedList = activeDeptsList.filter(d => d.id !== id);
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, {
        departmentsData: updatedList,
        departments: updatedList.map(d => d.name)
      });
      triggerToast('Département définitivement supprimé.', 'success');
      setShowDeleteDeptConfirm(null);
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const resetDeptForm = () => {
    setDeptFormName('');
    setDeptFormManagerId('');
    setDeptFormBudget('');
    setDeptFormDesc('');
  };

  // Save Grade
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeFormName.trim() || !gradeFormCode.trim()) {
      triggerToast('Le nom et le code du grade sont requis.', 'error');
      return;
    }
    setSaving(true);
    try {
      let updatedList = [...activeGradesList];
      if (editingGradeId) {
        updatedList = updatedList.map(g => g.id === editingGradeId ? {
          ...g,
          name: gradeFormName.trim(),
          code: gradeFormCode.trim().toUpperCase(),
          salaryMin: parseFloat(gradeFormMin) || 0,
          salaryMax: parseFloat(gradeFormMax) || 0,
          description: gradeFormDesc.trim()
        } : g);
      } else {
        const newG: GradeDetail = {
          id: `gr_${Math.random().toString(36).substring(2, 11)}`,
          name: gradeFormName.trim(),
          code: gradeFormCode.trim().toUpperCase(),
          salaryMin: parseFloat(gradeFormMin) || 0,
          salaryMax: parseFloat(gradeFormMax) || 0,
          status: 'Active',
          description: gradeFormDesc.trim(),
          createdAt: new Date().toISOString()
        };
        updatedList.push(newG);
      }

      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { gradesData: updatedList });

      triggerToast(editingGradeId ? 'Grade mis à jour.' : 'Grade créé avec succès.', 'success');
      setShowAddGradeModal(false);
      setEditingGradeId(null);
      resetGradeForm();
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveGrade = async (id: string, archive: boolean) => {
    try {
      const updatedList = activeGradesList.map(g => g.id === id ? {
        ...g,
        status: (archive ? 'Archived' : 'Active') as 'Active' | 'Archived'
      } : g);
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { gradesData: updatedList });
      triggerToast(archive ? 'Grade archivé.' : 'Grade restauré.', 'success');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const handleDeleteGrade = async (id: string) => {
    try {
      const updatedList = activeGradesList.filter(g => g.id !== id);
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { gradesData: updatedList });
      triggerToast('Grade définitivement supprimé.', 'success');
      setShowDeleteGradeConfirm(null);
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const resetGradeForm = () => {
    setGradeFormName('');
    setGradeFormCode('');
    setGradeFormMin('');
    setGradeFormMax('');
    setGradeFormDesc('');
  };

  // Save Rule Matrix
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormName.trim() || !ruleFormValue) {
      triggerToast('Le nom de la règle et sa valeur sont requis.', 'error');
      return;
    }
    setSaving(true);
    try {
      let updatedList = [...activeRulesList];
      if (editingRuleId) {
        updatedList = updatedList.map(r => r.id === editingRuleId ? {
          ...r,
          name: ruleFormName.trim(),
          type: ruleFormType,
          valueType: ruleFormValueType,
          value: parseFloat(ruleFormValue) || 0,
          description: ruleFormDesc.trim(),
          targetGrade: ruleFormGrade !== 'All' ? ruleFormGrade : undefined
        } : r);
      } else {
        const newR: RuleDetail = {
          id: `rule_${Math.random().toString(36).substring(2, 11)}`,
          name: ruleFormName.trim(),
          type: ruleFormType,
          valueType: ruleFormValueType,
          value: parseFloat(ruleFormValue) || 0,
          description: ruleFormDesc.trim(),
          active: true,
          targetGrade: ruleFormGrade !== 'All' ? ruleFormGrade : undefined,
          createdAt: new Date().toISOString()
        };
        updatedList.push(newR);
      }

      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { ruleMatrixData: updatedList });

      triggerToast(editingRuleId ? 'Règle modifiée.' : 'Règle ajoutée à la matrice.', 'success');
      setShowAddRuleModal(false);
      setEditingRuleId(null);
      resetRuleForm();
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (id: string, active: boolean) => {
    try {
      const updatedList = activeRulesList.map(r => r.id === id ? { ...r, active } : r);
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { ruleMatrixData: updatedList });
      triggerToast(active ? 'Règle activée.' : 'Règle désactivée.', 'success');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const handleDuplicateRule = async (rule: RuleDetail) => {
    try {
      const newRule: RuleDetail = {
        ...rule,
        id: `rule_${Math.random().toString(36).substring(2, 11)}`,
        name: `${rule.name} (Copy)`,
        createdAt: new Date().toISOString()
      };
      const updatedList = [...activeRulesList, newRule];
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { ruleMatrixData: updatedList });
      triggerToast('Règle dupliquée avec succès.', 'success');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const updatedList = activeRulesList.filter(r => r.id !== id);
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, { ruleMatrixData: updatedList });
      triggerToast('Règle supprimée.', 'success');
      setShowDeleteRuleConfirm(null);
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    }
  };

  const resetRuleForm = () => {
    setRuleFormName('');
    setRuleFormDesc('');
    setRuleFormValue('');
    setRuleFormType('Allowance');
    setRuleFormValueType('Fixed');
    setRuleFormGrade('All');
  };

  // Save Payroll / Tax Settings Tab
  const handleUpdatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'companies', company.id);
      await updateDoc(docRef, {
        payrollSettings: {
          socialSecurityRateEmployer: parseFloat(socialSecurityRateEmployer) || 16.2,
          socialSecurityRateEmployee: parseFloat(socialSecurityRateEmployee) || 4.2,
          taxRateBase: parseFloat(taxRateBase) || 15
        }
      });
      triggerToast('Paramètres de taxation régionale mis à jour.', 'success');
      onRefresh();
    } catch (err: any) {
      triggerToast('Erreur : ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: company.currency, minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Alerts Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 animate-bounce" />
            <span>{successMsg}</span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs"
          >
            <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Subtabs */}

      {/* 1. NODE PROFILE SUBTAB */}
      {subTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Logo & Preferences Block */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs flex flex-col items-center text-center space-y-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Company Branding</span>
              
              <div className="relative group">
                <div className="h-28 w-28 rounded-3xl bg-zinc-50 border-2 border-zinc-200 flex items-center justify-center overflow-hidden transition-all duration-300 relative">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 text-zinc-300" />
                  )}
                  
                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold uppercase tracking-wider p-2">
                    <span>Changer</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-zinc-950">{name || 'Nom de la structure'}</h4>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{regNumber || 'Aucun numéro NIU'}</p>
              </div>

              <div className="w-full pt-4 border-t border-zinc-100 text-left space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">HQ Location :</span>
                  <span className="font-semibold text-zinc-800">{country}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Default Currency :</span>
                  <span className="font-mono font-bold text-violet-600">{currency}</span>
                </div>
              </div>
            </div>

            {/* Application Preferences */}
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-50 pb-2">
                <Clock className="h-4 w-4 text-zinc-800" />
                <h4 className="font-display font-bold text-xs text-zinc-900 uppercase tracking-wider">Preferences</h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Language</label>
                  <select 
                    value={prefLanguage} onChange={e => setPrefLanguage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-2.5 text-xs focus:outline-none focus:bg-white"
                  >
                    <option value="fr">Français (Cameroun)</option>
                    <option value="en">English (UK/US)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Timezone</label>
                  <select 
                    value={prefTimezone} onChange={e => setPrefTimezone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-2.5 text-xs focus:outline-none focus:bg-white"
                  >
                    <option value="GMT+1 (Africa/Douala)">GMT+1 (Africa/Douala)</option>
                    <option value="GMT (UTC)">GMT (UTC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Work Hours Per Day</label>
                  <input 
                    type="number" step="0.5" value={prefWorkHours} onChange={e => setPrefWorkHours(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg py-2 px-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div 
                  onClick={() => setPrefAutoApproveLeave(!prefAutoApproveLeave)}
                  className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:bg-zinc-100/30 transition-all"
                >
                  <div>
                    <span className="font-bold text-[11px] text-zinc-800 block">Auto-Approve Leaves</span>
                    <span className="text-[9px] text-zinc-400 block">System approves requests automatically</span>
                  </div>
                  <button type="button">
                    {prefAutoApproveLeave ? (
                      <ToggleRight className="h-6 w-6 text-violet-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-zinc-300" />
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Core Information Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-6">
              
              {/* Block 1: Legal Profile */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-50 pb-2">
                  <Building2 className="h-4.5 w-4.5 text-zinc-900" />
                  <h3 className="font-display font-bold text-sm text-zinc-900 uppercase tracking-wider">Legal Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Legal Entity Name *</label>
                    <input 
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Registration Number (NIU)</label>
                    <input 
                      type="text" value={regNumber} onChange={e => setRegNumber(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                      placeholder="e.g. M061612457891U"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tax Identification Number (TIN/TVA)</label>
                    <input 
                      type="text" value={taxId} onChange={e => setTaxId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Business Type Structure</label>
                    <input 
                      type="text" value={businessType} onChange={e => setBusinessType(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">HQ Location (Country) *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white font-semibold"
                    >
                      <option value="Benin">Benin</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Chad">Chad</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Republic of the Congo">Republic of the Congo</option>
                      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                      <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Mali">Mali</option>
                      <option value="Niger">Niger</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Togo">Togo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Default Currency *</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white font-semibold"
                    >
                      <option value="XAF">XAF (FCFA)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Block 2: Contact Information */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 border-b border-zinc-50 pb-2">
                  <Mail className="h-4.5 w-4.5 text-zinc-900" />
                  <h3 className="font-display font-bold text-sm text-zinc-900 uppercase tracking-wider">Contact Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Company Office Email *</label>
                    <input 
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Office Phone Number *</label>
                    <input 
                      type="text" required value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">HQ Physical Address</label>
                    <input 
                      type="text" value={address} onChange={e => setAddress(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex justify-end">
                <button 
                  type="submit" disabled={saving}
                  className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{saving ? 'Synchronizing...' : 'Enregistrer le Profil'}</span>
                </button>
              </div>

            </div>
          </div>
        </form>
      )}

      {/* 1.5 ACCOUNT & SECURITY SUBTAB */}
      {subTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Profile Card & Quick Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs flex flex-col items-center text-center space-y-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Security Profile</span>
              
              <div className="relative group">
                <div className="h-20 w-20 rounded-full bg-zinc-950 text-white flex items-center justify-center font-display font-bold text-2xl shadow-sm overflow-hidden border border-zinc-200">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt={profileName} className="h-full w-full object-cover" />
                  ) : profileName ? (
                    profileName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePhotoChange}
                  />
                </label>
              </div>

              <div>
                <h3 className="font-display font-bold text-zinc-900 text-sm">{profileName || 'Active Collaborator'}</h3>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{profile?.role || 'Administrator'}</span>
              </div>

              <div className="w-full pt-4 border-t border-zinc-100 flex flex-col items-center space-y-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Multi-Factor Status</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  twoFAEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {twoFAEnabled ? '● 2FA Active' : '○ 2FA Disabled'}
                </span>
              </div>
            </div>

            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-zinc-900" />
                <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Security Details</h4>
              </div>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Your credentials and sessions are securely isolated per workspace tenant. All modifications require active cryptographic validation.
              </p>
              <div className="pt-2 border-t border-zinc-100 space-y-2 text-[10px] text-zinc-400 font-medium">
                <div className="flex justify-between">
                  <span>Tenant ID</span>
                  <span className="font-mono text-zinc-600">{company.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Checked</span>
                  <span className="font-mono text-zinc-600">Just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Forms Panel */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Form 1: General Profile Info */}
            <form onSubmit={handleUpdateUserProfile} className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-display font-bold text-zinc-900 text-sm">Personal Profile Information</h3>
                <p className="text-[11px] text-zinc-400">Update your name, contact email, profile picture, and active telephone signatures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Full Name *</label>
                  <input 
                    type="text" required value={profileName} onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Contact Email Address *</label>
                  <input 
                    type="email" required value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Direct Phone Line</label>
                  <input 
                    type="text" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                    placeholder="+237 600 000 000"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Profile Picture</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file"
                      accept="image/*"
                      id="profile-upload-btn"
                      className="hidden"
                      onChange={handleProfilePhotoChange}
                    />
                    <label 
                      htmlFor="profile-upload-btn"
                      className="cursor-pointer border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-[11px] px-3.5 py-2.5 rounded-xl transition-all"
                    >
                      Choose Image File
                    </label>
                    {profilePhotoUrl && (
                      <button 
                        type="button"
                        onClick={() => setProfilePhotoUrl('')}
                        className="text-red-500 hover:text-red-700 text-[11px] font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {profileEmail.trim().toLowerCase() !== (profile?.email || '').toLowerCase() && (
                  <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <AlertCircle className="h-4 w-4" />
                      <span>Sensitive Change Authorization Required</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-normal">
                      You are changing your primary login email address. To authorize this action, please confirm your current security password.
                    </p>
                    <div>
                      <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1.5">Current Password *</label>
                      <input 
                        type="password"
                        required
                        value={profileVerificationPassword}
                        onChange={e => setProfileVerificationPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <button 
                  type="submit" disabled={updatingSecurity}
                  className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {updatingSecurity && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span>Save Personal Details</span>
                </button>
              </div>
            </form>

            {/* Form 2: Password Management */}
            <form onSubmit={handleUpdatePassword} className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
              <div>
                <h3 className="font-display font-bold text-zinc-900 text-sm">Security Key & Password</h3>
                <p className="text-[11px] text-zinc-400">Regularly rotate your cryptographic password to maintain robust system compliance.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Current Password</label>
                  <input 
                    type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">New Password *</label>
                  <input 
                    type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm New Password *</label>
                  <input 
                    type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex justify-end">
                <button 
                  type="submit" disabled={updatingSecurity}
                  className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-[11px] px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {updatingSecurity && <RefreshCw className="h-3 w-3 animate-spin" />}
                  <span>Rotate Password Key</span>
                </button>
              </div>
            </form>

            {/* Form 3: 2FA & Concurrent Session controls */}
            <div className="bg-white border border-zinc-150/80 rounded-[28px] p-6 shadow-xs space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-zinc-900 text-sm">Multi-Factor Authentication (2FA)</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Secure logins by requiring a secondary verification token code upon access.</p>
                </div>
                <button 
                  onClick={handleToggle2FA}
                  className="focus:outline-none cursor-pointer"
                >
                  {twoFAEnabled ? (
                    <ToggleRight className="h-10 w-10 text-zinc-950" />
                  ) : (
                    <ToggleLeft className="h-10 w-10 text-zinc-300" />
                  )}
                </button>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-zinc-900 text-sm">Concurrent Workspace Sign-ins</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Revoke and terminate access tokens on any other devices or browser tabs immediately.</p>
                </div>
                <button 
                  onClick={handleLogoutOtherSessions} disabled={updatingSecurity}
                  className="border border-zinc-200 hover:bg-zinc-50 text-zinc-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Log Out Other Sessions
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS DASHBOARD SUBTAB */}
      {subTab === 'departments' && (
        <div className="space-y-6">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Total Departments</span>
                <span className="text-base font-bold text-zinc-900 font-display block mt-0.5">{activeDeptsList.length} Units</span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Active Cost Centers</span>
                <span className="text-base font-bold text-zinc-900 font-display block mt-0.5">
                  {activeDeptsList.filter(d => d.status === 'Active').length} Active
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Archive className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Archived Units</span>
                <span className="text-base font-bold text-zinc-900 font-display block mt-0.5">
                  {activeDeptsList.filter(d => d.status === 'Archived').length} Archived
                </span>
              </div>
            </div>

            <div className="p-4 bg-white border border-zinc-150/80 rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Average Budget</span>
                <span className="text-sm font-mono font-bold text-zinc-900 block mt-0.5">
                  {formatAmount(activeDeptsList.reduce((sum, d) => sum + (d.budget || 0), 0) / (activeDeptsList.length || 1))}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 w-full sm:w-80">
              <input 
                type="text" placeholder="Rechercher un département..." value={deptSearch} onChange={e => setDeptSearch(e.target.value)}
                className="bg-transparent border-none text-xs focus:outline-none w-full text-zinc-700"
              />
            </div>
            
            <button 
              onClick={() => {
                setEditingDeptId(null);
                resetDeptForm();
                setShowAddDeptModal(true);
              }}
              className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Créer un Département</span>
            </button>
          </div>

          {/* Departments Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDeptsList
              .filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()))
              .map((dept) => {
                const isArchived = dept.status === 'Archived';
                const deptEmps = employees.filter(e => e.department === dept.name);
                const manager = employees.find(e => e.id === dept.managerId);
                const progressPercent = Math.min(100, Math.round((deptEmps.length / 15) * 100)); // arbitrary target

                return (
                  <div 
                    key={dept.id} 
                    className={`bg-white border rounded-[24px] p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                      isArchived ? 'opacity-65 border-zinc-100 bg-zinc-50/50' : 'border-zinc-150/80 hover:border-zinc-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-display font-bold text-sm text-zinc-950 flex items-center gap-1.5">
                            {dept.name}
                            {isArchived && (
                              <span className="text-[8px] font-bold font-mono bg-zinc-100 border text-zinc-500 px-1 py-0.5 rounded uppercase">Archivé</span>
                            )}
                          </h4>
                          <span className="text-[9px] text-zinc-400 block font-semibold uppercase tracking-wider">Unit Cost Center</span>
                        </div>
                        
                        {/* Control actions */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              setEditingDeptId(dept.id);
                              setDeptFormName(dept.name);
                              setDeptFormManagerId(dept.managerId || '');
                              setDeptFormBudget(dept.budget?.toString() || '');
                              setDeptFormDesc(dept.description || '');
                              setShowAddDeptModal(true);
                            }}
                            className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          
                          <button 
                            onClick={() => handleArchiveDept(dept.id, !isArchived)}
                            className="p-1 text-zinc-400 hover:text-violet-600 transition-colors"
                            title={isArchived ? 'Restaurer' : 'Archiver'}
                          >
                            {isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                          </button>
                          
                          <button 
                            onClick={() => setShowDeleteDeptConfirm(dept.id)}
                            className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                            title="Supprimer définitivement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                        {dept.description || 'No operational description provided.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-100/80 space-y-3.5">
                      {/* Manager */}
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="text-zinc-400">Responsable :</span>
                        <span className="font-bold text-zinc-800 truncate">
                          {dept.managerName || (manager ? `${manager.firstName} ${manager.lastName}` : 'Non assigné')}
                        </span>
                      </div>

                      {/* Budget */}
                      <div className="flex items-center gap-2 text-xs">
                        <DollarSign className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="text-zinc-400">Budget Annuel :</span>
                        <span className="font-bold font-mono text-zinc-800">
                          {formatAmount(dept.budget || 0)}
                        </span>
                      </div>

                      {/* Progress headcount */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-zinc-500">
                          <span>Effectif Actuel</span>
                          <span className="text-zinc-950">{deptEmps.length} Agents</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-zinc-950 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Delete Department Confirmation Dialog */}
          {showDeleteDeptConfirm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
              <div className="bg-white border border-zinc-200 rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-display font-bold text-sm">Confirmation de suppression</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Êtes-vous certain de vouloir supprimer définitivement ce département ? Cette action effacera également ses budgets associés. Les employés affectés devront être réassignés.
                </p>
                <div className="flex justify-end gap-2 text-xs pt-1">
                  <button 
                    onClick={() => setShowDeleteDeptConfirm(null)}
                    className="px-4 py-2 border rounded-xl hover:bg-zinc-50 text-zinc-700 font-semibold"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={() => handleDeleteDept(showDeleteDeptConfirm)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm"
                  >
                    Supprimer définitivement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add / Edit Department Modal */}
          {showAddDeptModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[99] flex items-center justify-center p-4">
              <form onSubmit={handleSaveDepartment} className="bg-white border border-zinc-200 rounded-[28px] p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-display font-bold text-zinc-950 text-sm">
                    {editingDeptId ? 'Modifier le Département' : 'Créer un Département'}
                  </h3>
                  <button type="button" onClick={() => setShowAddDeptModal(false)} className="p-1 hover:bg-zinc-50 rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nom du Département *</label>
                    <input 
                      type="text" required value={deptFormName} onChange={e => setDeptFormName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none focus:bg-white"
                      placeholder="e.g. Finances & Comptabilité"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Responsable Manager</label>
                    <select 
                      value={deptFormManagerId} onChange={e => setDeptFormManagerId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
                    >
                      <option value="">-- Sélectionner un Manager --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Budget Alloué Annuel ({company.currency})</label>
                    <input 
                      type="number" value={deptFormBudget} onChange={e => setDeptFormBudget(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs focus:outline-none"
                      placeholder="e.g. 15000000"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Description Opérationnelle</label>
                    <textarea 
                      value={deptFormDesc} onChange={e => setDeptFormDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                      placeholder="Indiquez les missions ou les objectifs de l'unité."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-3 border-t">
                  <button 
                    type="button" onClick={() => setShowAddDeptModal(false)}
                    className="px-4 py-2 border rounded-xl hover:bg-zinc-50"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" disabled={saving}
                    className="bg-zinc-950 hover:bg-zinc-900 text-white px-5 py-2 rounded-xl font-bold shadow-sm"
                  >
                    {saving ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* 3. GRADES structure SUBTAB */}
      {subTab === 'grades' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Grades & Grilles Salariales</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Configurez les échelons et bandes de rémunération applicables au nœud.</p>
            </div>

            <button 
              onClick={() => {
                setEditingGradeId(null);
                resetGradeForm();
                setShowAddGradeModal(true);
              }}
              className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Grade</span>
            </button>
          </div>

          <div className="bg-white border border-zinc-150/80 rounded-[28px] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Code / Grade</th>
                    <th className="py-3.5 px-4">Fourchette de Salaire (Band)</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Collaborateurs</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
                  {activeGradesList.map((grade) => {
                    const gradeEmps = employees.filter(e => e.role === grade.code || e.role === grade.name);
                    const isArchived = grade.status === 'Archived';

                    return (
                      <tr key={grade.id} className={`hover:bg-zinc-50/20 transition-all ${isArchived ? 'opacity-60 bg-zinc-50/40' : ''}`}>
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-mono font-bold text-xs bg-zinc-100 border text-zinc-800 px-2 py-0.5 rounded-md">{grade.code}</span>
                            <span className="font-bold text-zinc-900 block mt-1.5">{grade.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono">
                          <div className="space-y-1">
                            <span className="text-zinc-950 font-bold block">{formatAmount(grade.salaryMin)} - {formatAmount(grade.salaryMax)}</span>
                            {/* Visual pay bar */}
                            <div className="w-40 bg-zinc-100 h-1 rounded-full overflow-hidden">
                              <div className="bg-violet-600 h-full w-2/3" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-zinc-500 max-w-xs truncate">
                          {grade.description || 'Aucune description.'}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-bold text-zinc-900 bg-zinc-50 border px-2.5 py-1 rounded-xl text-[10px]">
                            {gradeEmps.length} Agents assignés
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded-full uppercase ${
                            isArchived ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {grade.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => {
                                setEditingGradeId(grade.id);
                                setGradeFormName(grade.name);
                                setGradeFormCode(grade.code);
                                setGradeFormMin(grade.salaryMin.toString());
                                setGradeFormMax(grade.salaryMax.toString());
                                setGradeFormDesc(grade.description || '');
                                setShowAddGradeModal(true);
                              }}
                              className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                              title="Modifier"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            
                            <button 
                              onClick={() => handleArchiveGrade(grade.id, !isArchived)}
                              className="p-1 text-zinc-400 hover:text-violet-600 transition-colors"
                              title={isArchived ? 'Restaurer' : 'Archiver'}
                            >
                              {isArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                            </button>
                            
                            <button 
                              onClick={() => setShowDeleteGradeConfirm(grade.id)}
                              className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Grade Confirm */}
          {showDeleteGradeConfirm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
              <div className="bg-white border border-zinc-200 rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-display font-bold text-sm">Supprimer définitivement</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Confirmez-vous la purge totale de ce grade et de son échelon de salaire associé ? Cette opération n'est pas réversible.
                </p>
                <div className="flex justify-end gap-2 text-xs pt-1">
                  <button onClick={() => setShowDeleteGradeConfirm(null)} className="px-4 py-2 border rounded-xl text-zinc-700">Annuler</button>
                  <button onClick={() => handleDeleteGrade(showDeleteGradeConfirm)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold">Supprimer</button>
                </div>
              </div>
            </div>
          )}

          {/* Add / Edit Grade Modal */}
          {showAddGradeModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[99] flex items-center justify-center p-4">
              <form onSubmit={handleSaveGrade} className="bg-white border border-zinc-200 rounded-[28px] p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-display font-bold text-zinc-950 text-sm">
                    {editingGradeId ? 'Modifier le Grade' : 'Nouveau Grade d\'Échelon'}
                  </h3>
                  <button type="button" onClick={() => setShowAddGradeModal(false)} className="p-1 hover:bg-zinc-50 rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Code Grade *</label>
                      <input 
                        type="text" required value={gradeFormCode} onChange={e => setGradeFormCode(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs font-mono uppercase"
                        placeholder="e.g. GR-SNR"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nom du Grade *</label>
                      <input 
                        type="text" required value={gradeFormName} onChange={e => setGradeFormName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
                        placeholder="e.g. Cadre Supérieur"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Salaire Minimal ({company.currency})</label>
                      <input 
                        type="number" required value={gradeFormMin} onChange={e => setGradeFormMin(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs font-mono"
                        placeholder="e.g. 500000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Salaire Maximal ({company.currency})</label>
                      <input 
                        type="number" required value={gradeFormMax} onChange={e => setGradeFormMax(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs font-mono"
                        placeholder="e.g. 1200000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Description / Notes</label>
                    <textarea 
                      value={gradeFormDesc} onChange={e => setGradeFormDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-3 border-t">
                  <button type="button" onClick={() => setShowAddGradeModal(false)} className="px-4 py-2 border rounded-xl hover:bg-zinc-50">Annuler</button>
                  <button type="submit" className="bg-zinc-950 text-white px-5 py-2 rounded-xl font-bold">Enregistrer</button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* 4. RULE MATRIX SUBTAB */}
      {subTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-bold text-sm text-zinc-950 uppercase tracking-wider">Calculations Rule Matrix</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Configurez et activez les primes, taxes locales et retenues salariales synchronisées en arrière-plan.</p>
            </div>

            <button 
              onClick={() => {
                setEditingRuleId(null);
                resetRuleForm();
                setShowAddRuleModal(true);
              }}
              className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter une Règle</span>
            </button>
          </div>

          {/* Rule Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRulesList.map((rule) => {
              const targetG = activeGradesList.find(g => g.id === rule.targetGrade);

              return (
                <div 
                  key={rule.id} 
                  className={`bg-white border rounded-[24px] p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                    rule.active ? 'border-zinc-150/80 hover:border-zinc-200' : 'opacity-65 bg-zinc-50/40 border-zinc-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-display font-bold text-sm text-zinc-950 leading-tight">{rule.name}</h5>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border rounded-md uppercase ${
                            rule.type === 'Allowance' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            rule.type === 'Deduction' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {rule.type}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-bold uppercase">{rule.valueType}</span>
                        </div>
                      </div>

                      {/* Switch and action buttons */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button 
                          onClick={() => handleToggleRule(rule.id, !rule.active)}
                          title={rule.active ? 'Désactiver' : 'Activer'}
                        >
                          {rule.active ? (
                            <ToggleRight className="h-6 w-6 text-violet-600 cursor-pointer" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-zinc-300 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 leading-relaxed min-h-8">
                      {rule.description || 'Pas de description.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 space-y-3.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-zinc-400">Valeur :</span>
                      <span className="text-lg font-mono font-bold text-zinc-950">
                        {rule.valueType === 'Percentage' ? `${rule.value}%` : formatAmount(rule.value)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Cible :</span>
                      <span className="font-bold text-zinc-800">
                        {targetG ? targetG.name : 'Tous les salariés'}
                      </span>
                    </div>

                    {/* Quick Duplication & Deletion Row */}
                    <div className="flex justify-end gap-1.5 pt-1.5">
                      <button 
                        onClick={() => {
                          setEditingRuleId(rule.id);
                          setRuleFormName(rule.name);
                          setRuleFormType(rule.type);
                          setRuleFormValueType(rule.valueType);
                          setRuleFormValue(rule.value.toString());
                          setRuleFormDesc(rule.description || '');
                          setRuleFormGrade(rule.targetGrade || 'All');
                          setShowAddRuleModal(true);
                        }}
                        className="px-2 py-1 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors text-[10px] font-semibold"
                      >
                        Modifier
                      </button>
                      
                      <button 
                        onClick={() => handleDuplicateRule(rule)}
                        className="px-2 py-1 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-violet-600 transition-colors text-[10px] font-semibold"
                      >
                        Dupliquer
                      </button>
                      
                      <button 
                        onClick={() => setShowDeleteRuleConfirm(rule.id)}
                        className="px-2 py-1 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors text-[10px] font-semibold"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delete Rule Confirm Dialog */}
          {showDeleteRuleConfirm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
              <div className="bg-white border border-zinc-200 rounded-[24px] p-6 max-w-sm w-full space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-display font-bold text-sm">Supprimer la règle</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Confirmez-vous le retrait de cette règle de calcul de la matrice de paie globale ?
                </p>
                <div className="flex justify-end gap-2 text-xs pt-1">
                  <button onClick={() => setShowDeleteRuleConfirm(null)} className="px-4 py-2 border rounded-xl text-zinc-700">Annuler</button>
                  <button onClick={() => handleDeleteRule(showDeleteRuleConfirm)} className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold">Confirmer</button>
                </div>
              </div>
            </div>
          )}

          {/* Add / Edit Rule Modal */}
          {showAddRuleModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[99] flex items-center justify-center p-4">
              <form onSubmit={handleSaveRule} className="bg-white border border-zinc-200 rounded-[28px] p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-display font-bold text-zinc-950 text-sm">
                    {editingRuleId ? 'Modifier la Règle' : 'Ajouter une Règle de Calcul'}
                  </h3>
                  <button type="button" onClick={() => setShowAddRuleModal(false)} className="p-1 hover:bg-zinc-50 rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Nom de la Règle *</label>
                    <input 
                      type="text" required value={ruleFormName} onChange={e => setRuleFormName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs"
                      placeholder="e.g. Indemnité de Transport Spécifique"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Type de Règle</label>
                      <select 
                        value={ruleFormType} onChange={e => setRuleFormType(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs"
                      >
                        <option value="Allowance">Allowance (Gain)</option>
                        <option value="Deduction">Deduction (Retenue)</option>
                        <option value="Tax">Tax (Cotisation Patronale)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Type de Calcul</label>
                      <select 
                        value={ruleFormValueType} onChange={e => setRuleFormValueType(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs"
                      >
                        <option value="Fixed">Valeur Fixe ({company.currency})</option>
                        <option value="Percentage">Pourcentage (%)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Valeur Numérique *</label>
                      <input 
                        type="number" step="0.01" required value={ruleFormValue} onChange={e => setRuleFormValue(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-xs font-mono"
                        placeholder="e.g. 15000"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Grade Salarial Cible</label>
                      <select 
                        value={ruleFormGrade} onChange={e => setRuleFormGrade(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs"
                      >
                        <option value="All">Tous les salariés</option>
                        {activeGradesList.map(g => (
                          <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Description / Notes Légales</label>
                    <textarea 
                      value={ruleFormDesc} onChange={e => setRuleFormDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs pt-3 border-t">
                  <button type="button" onClick={() => setShowAddRuleModal(false)} className="px-4 py-2 border rounded-xl hover:bg-zinc-50">Annuler</button>
                  <button type="submit" className="bg-zinc-950 text-white px-5 py-2 rounded-xl font-bold">Ajouter la règle</button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* 5. REGIONAL TAX RULES & CONFIG SUBTAB */}
      {subTab === 'payroll' && (
        <form onSubmit={handleUpdatePayroll} className="bg-white border border-zinc-150/80 rounded-[28px] p-6 md:p-8 shadow-xs max-w-xl space-y-5">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-zinc-900" />
            <h3 className="font-display font-bold text-zinc-900 text-base">Regional Contribution Settings</h3>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Configurez les taux par défaut pour l'impôt général et les caisses nationales de prévoyance sociale (CNPS) applicables au Cameroun. Les règles s'appliquent automatiquement sur les salaires calculés.
          </p>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Employer CNPS Rate (%)</label>
                <input 
                  type="number" step="0.01" value={socialSecurityRateEmployer} onChange={e => setSocialSecurityRateEmployer(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Employee CNPS Rate (%)</label>
                <input 
                  type="number" step="0.01" value={socialSecurityRateEmployee} onChange={e => setSocialSecurityRateEmployee(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Base Flat Tax / IRPP Bracket Rate (%)</label>
              <input 
                type="number" step="0.01" value={taxRateBase} onChange={e => setTaxRateBase(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button 
              type="submit" disabled={saving}
              className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {saving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{saving ? 'Applying changes...' : 'Save Configuration Matrix'}</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
