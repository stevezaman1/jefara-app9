import { useState, useEffect } from 'react';

// Unified translation dictionary
const dictionary: Record<string, Record<string, string>> = {
  fr: {
    // English-to-French mappings for sidebar and menus
    "Dashboard": "Tableau de bord",
    "Overview": "Vue d'ensemble",
    "Recent Activity": "Activité récente",
    "Alertes": "Alertes",
    "Alerts": "Alertes",
    "Inbox": "Boîte de réception",
    "Tasks & Approvals": "Tâches & Approbations",
    "Notifications": "Notifications",
    "Employees": "Salariés",
    "Employee Directory": "Annuaire des salariés",
    "Employee Profiles": "Profils des salariés",
    "Organization Chart": "Organigramme",
    "Employee History": "Historique",
    "Offboarding": "Départ de salariés",
    "Archive": "Archives",
    "Recruitment & Onboarding": "Recrutement & Intégration",
    "Job Postings": "Offres d'emploi",
    "Candidates": "Candidatures",
    "Recruitment Pipeline": "Pipeline de recrutement",
    "Onboarding": "Intégration",
    "Hiring Documents": "Documents d'embauche",
    "Payroll": "Paie",
    "Payroll Runs": "Cycles de paie",
    "Salary Calculation": "Calcul de salaire",
    "Bonuses": "Primes",
    "Deductions": "Retenues",
    "Payslips": "Fiches de paie",
    "Payroll History": "Historique des paies",
    "Approval Workflow": "Flux d'approbation",
    "Leave & Absences": "Congés & Absences",
    "Leave Requests": "Demandes de congé",
    "Approval Queue": "File d'approbation",
    "Team Calendar": "Calendrier d'équipe",
    "Leave Policies": "Politiques de congé",
    "Time & Attendance": "Temps & Présences",
    "Clock In / Out": "Pointeuse (Enregistrement)",
    "Work Schedules": "Planning de travail",
    "Overtime": "Heures supplémentaires",
    "Remote Work": "Télétravail",
    "Attendance Reports": "Rapports de présence",
    "General Ledger & Accounting": "Comptabilité & Grand Livre",
    "Journal Entries": "Écritures de journal",
    "Payroll Expenses": "Dépenses de paie",
    "Cost Centers": "Centres de coûts",
    "Budgets": "Budgets",
    "Expense Claims": "Notes de frais",
    "Reimbursements": "Remboursements",
    "Financial Reports": "Rapports financiers",
    "Staff Financial Services": "Services financiers salariés",
    "Salary Advances": "Acomptes sur salaire",
    "Loans": "Prêts",
    "Insurance": "Assurances",
    "Savings": "Épargne",
    "Repayments": "Remboursements de prêts",
    "Financial Analytics": "Analyses financières",
    "Digital Vault & Documents": "Coffre-fort & Documents",
    "Contracts": "Contrats",
    "Certificates": "Certificats",
    "HR Documents": "Documents RH",
    "Digital Vault": "Coffre-fort numérique",
    "Electronic Signatures": "Signatures électroniques",
    "HR Analytics & BI": "Analyses RH & Décisionnel",
    "Workforce Analytics": "Analyses d'effectifs",
    "Attendance Analytics": "Analyses de présence",
    "Forecasts": "Prévisions",
    "Custom Reports": "Rapports personnalisés",
    "System Settings": "Paramètres système",
    "Company Profile": "Profil de l'entreprise",
    "Account & Security": "Compte & Sécurité",
    "Departments": "Départements",
    "Grades": "Grades",
    "Roles & Permissions": "Rôles & Autorisations",
    "Approval Workflows": "Flux d'approbation",
    "Payroll Settings": "Paramètres de paie",
    "Accounting Settings": "Paramètres comptables",
    "Essentials": "Essentiels",
    "People": "Membres",
    "Finance & Payroll": "Finance & Paie",
    "Company": "Entreprise",
    "Security": "Sécurité",
    "Tasks": "Tâches",
    "Settings": "Paramètres",
    "Log Out": "Déconnexion",
    "Work shifts, weekly rosters": "Planning, rotations hebdomadaires",
    "Interactive local time terminal": "Terminal de pointage local"
  },
  en: {
    // French-to-English mappings for UI text
    "Tableau de bord": "Dashboard",
    "Aperçu de la Cameroon Compliance": "Cameroon Compliance Overview",
    "Aperçu de l'entreprise": "Company Overview",
    "Aggregated enterprise telemetry and operational overview": "Aggregated enterprise telemetry and operational overview",
    "Audits, transactions de base de données, et logs système": "Audits, database transactions, and system logs",
    "Salariés Actifs": "Active Employees",
    "Fiches de paie en cours": "Payslips in Progress",
    "Congés en attente": "Pending Leaves",
    "Dernière paie validée": "Last Validated Payroll",
    "Prochaine paie en attente": "Next Pending Payroll",
    "Actions rapides": "Quick Actions",
    "Rapports & Audit": "Reports & Audit",
    "Réglementations locales": "Local Regulations",
    "Générer un rapport": "Generate Report",
    "Lancer la paie": "Run Payroll",
    "Ajouter un employé": "Add Employee",
    "Voir les congés": "View Leaves",
    "Statistiques mensuelles": "Monthly Statistics",
    "Salaires nets payés": "Net Paid Salaries",
    "Charges patronales": "Employer Charges",
    "Total Masse Salariale": "Total Payroll Cost",
    "Rapport d'activité": "Activity Report",
    "Répartition par département": "Department Breakdown",
    "Dernières Activités": "Recent Activities",
    "Audit Trail": "Audit Trail",
    "Alertes critiques": "Critical Alerts",
    "Aucune alerte critique en cours": "No active critical alerts",
    "Masse salariale mensuelle": "Monthly Payroll Cost",
    "Primes & Taxes locales": "Local Bonuses & Taxes",
    "Configurez et activez les primes, taxes locales et retenues salariales": "Configure and activate bonuses, local taxes, and salary deductions",
    "Enregistrer": "Save",
    "Annuler": "Cancel",
    "Chargement...": "Loading...",
    "Succès": "Success",
    "Erreur": "Error",
    "Oui": "Yes",
    "Non": "No",
    "Confirmer": "Confirm",
    "Fermer": "Close",
    "Suivant": "Next",
    "Précédent": "Previous",
    "Modifier": "Edit",
    "Supprimer": "Delete",
    "Ajouter": "Add",
    "Créer": "Create",
    "Rechercher...": "Search...",
    "Actif": "Active",
    "Inactif": "Inactive",
    "En attente": "Pending",
    "Approuvé": "Approved",
    "Rejeté": "Rejected",
    "Payé": "Paid",
    "Brouillon": "Draft",
    "Validé": "Validated",
    "Bienvenue": "Welcome",
    "Profil de l'entreprise": "Company Profile",
    "Mon Profil": "My Profile",
    "Téléphone": "Phone",
    "Adresse": "Address",
    "Contact d'urgence": "Emergency Contact",
    "Date de naissance": "Birthday",
    "Photo de profil": "Profile Photo",
    "Couleur de l'avatar": "Avatar Color",
    "Préférences de notification": "Notification Preferences",
    "Double facteur (MFA)": "Two-Factor (MFA)",
    "Désactiver le compte": "Disable Account",
    "Supprimer le compte": "Delete Account",
    "Toutes les notifications": "All Notifications",
    "Nouveau collaborateur": "New Collaborator",
    "Inviter": "Invite",
    "Sélectionner": "Select",
    "Tous": "All",
    "Rechercher un outil...": "Search tools...",
    "Profil": "Profile",
    "Sécurité": "Security",
    "Langue": "Language",
    "Déconnexion": "Sign Out",
    "Notifications Push": "Push Notifications",
    "Double Facteur (MFA)": "Two-Factor (MFA)",
    "Mises à jour instantanées": "Instant updates",
    "Choisissez votre langue de travail pour l'ensemble du système d'administration.": "Choose your working language for the entire administration system.",
    "Français (Cameroun)": "Français (Cameroun)",
    "English (UK/US)": "English (UK/US)",
    "Configurez et activez les primes, taxes locales et retenues salariales synchronisées en arrière-plan.": "Configure and activate bonuses, local taxes, and salary deductions synchronized in the background.",
    "Devise de transaction": "Transaction Currency",
    "Numéro d'enregistrement": "Registration Number",
    "Type d'entreprise": "Business Type",
    "Siège social": "Headquarters",
    "Pays": "Country",
    "Heures de travail par jour": "Work Hours Per Day",
    "Fuseau horaire de l'entreprise": "Company Timezone",
    "Approbation automatique des congés": "Auto-Approve Leaves",
    "Sauvegarder les modifications": "Save Changes",
    "Mettre à jour le mot de passe": "Update Password",
    "Ancien mot de passe": "Old Password",
    "Nouveau mot de passe": "New Password",
    "Confirmer le nouveau mot de passe": "Confirm New Password",
    "Activer le double facteur (MFA)": "Enable Two-Factor (MFA)",
    "Certificat d'Isolation Actif": "Active Isolation Certificate",
    "Désactivation du Compte": "Account Deactivation",
    "Êtes-vous sûr de vouloir désactiver votre compte ?": "Are you sure you want to deactivate your account?",
    "Cette action est réversible par un administrateur.": "This action is reversible by an administrator.",
    "Suppression Définitive": "Permanent Deletion",
    "Attention : Cette action est irréversible et supprimera toutes vos données.": "Warning: This action is irreversible and will delete all your data.",
    "Saisissez le nom de votre compte pour confirmer": "Enter your account name to confirm",
    "Saisissez la phrase de sécurité": "Enter the security phrase",
    "Supprimer définitivement mon compte": "Permanently delete my account",
    "Fiche de paie": "Payslip",
    "Calculateur de paie": "Payroll Calculator",
    "Primes & Indemnités": "Bonuses & Allowances",
    "Cotisations & Taxes": "Contributions & Taxes",
    "Historique des paies": "Payroll History",
    "Organigramme de l'entreprise": "Company Organization Chart",
    "Départements & Équipes": "Departments & Teams",
    "Grades & Salaires de base": "Grades & Base Salaries",
    "Structure salariale": "Salary Structure",
    "Annuaire des employés": "Employee Directory",
    "Profils des employés": "Employee Profiles",
    "Historique professionnel": "Professional History",
    "Départ de salariés (Offboarding)": "Offboarding (Staff Exit)",
    "Archives du personnel": "Personnel Archives",
    "Offres d'emploi actives": "Active Job Postings",
    "Candidatures reçues": "Applications Received",
    "Pipeline de recrutement": "Recruitment Pipeline",
    "Intégration des recrues": "Newcomer Onboarding",
    "Documents légaux": "Legal Documents",
    "Demandes de congés": "Leave Requests",
    "File d'approbation": "Approval Queue",
    "Calendrier des absences": "Absence Calendar",
    "Politiques de congés": "Leave Policies",
    "Enregistrement de présence": "Attendance Logging",
    "Planning de travail": "Work Schedule",
    "Heures supplémentaires": "Overtime Hours",
    "Travail à distance (Télétravail)": "Remote Work / Telecommuting",
    "Journal comptable": "Accounting Journal",
    "Centres de coûts": "Cost Centers",
    "Notes de frais": "Expense Claims",
    "Remboursements": "Reimbursements",
    "Acomptes sur salaire": "Salary Advances",
    "Prêts d'entreprise": "Company Loans",
    "Épargne salariale": "Employee Savings",
    "Suivi des remboursements": "Repayment Tracking",
    "Analyses financières": "Financial Analytics",
    "Coffre-fort numérique": "Digital Vault",
    "Signatures électroniques": "Electronic Signatures",
    "Analyses de paie": "Payroll Analytics",
    "Analyses d'effectifs": "Workforce Analytics",
    "Prévisions financières": "Financial Forecasts",
    "Rapports personnalisés": "Custom Reports",
    "Rôles & Autorisations": "Roles & Permissions",
    "Flux d'approbation": "Approval Workflows"
  }
};

let currentLang = localStorage.getItem('jefara_lang') || 'fr';

export const getLanguage = (): string => {
  return currentLang;
};

export const setLanguage = (lang: string) => {
  if (lang === 'en' || lang === 'fr') {
    currentLang = lang;
    localStorage.setItem('jefara_lang', lang);
    window.dispatchEvent(new Event('languagechange'));
  }
};

export const t = (text: string, lang: string = currentLang): string => {
  if (!text) return '';
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();
  
  if (lang === 'fr') {
    // If French and we have an English-to-French translation, return it!
    if (dictionary.fr && dictionary.fr[cleanText]) {
      return dictionary.fr[cleanText];
    }
    // Otherwise return as is
    return text;
  }
  
  // English translations (French to English)
  if (lang === 'en') {
    // Try exact lookup
    if (dictionary.en && dictionary.en[cleanText]) {
      return dictionary.en[cleanText];
    }
    
    // Try case-insensitive lookup
    if (dictionary.en) {
      const keys = Object.keys(dictionary.en);
      const matchKey = keys.find(k => k.toLowerCase() === lowerText);
      if (matchKey) {
        return dictionary.en[matchKey];
      }
    }
  }
  
  return text;
};

export const useTranslation = () => {
  const [lang, setLang] = useState(getLanguage());
  
  useEffect(() => {
    const handleLangChange = () => {
      setLang(getLanguage());
    };
    window.addEventListener('languagechange', handleLangChange);
    return () => {
      window.removeEventListener('languagechange', handleLangChange);
    };
  }, []);
  
  return {
    t: (text: string) => t(text, lang),
    language: lang,
    setLanguage
  };
};
