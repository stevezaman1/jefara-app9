import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Shield, ArrowRight, CheckCircle2, Wallet, 
  Building2, Users, Receipt, Calendar, Clock, Lock, 
  BarChart4, ChevronRight, Globe, Zap, FileText, 
  ArrowUpRight, HelpCircle, Briefcase, Percent, ChevronDown, Menu, X,
  Landmark, CreditCard, Send, Sparkle, RefreshCw, Key, Check,
  CheckCircle, AlertCircle, PlayCircle, BarChart3, Database, ShieldAlert,
  ArrowRightLeft, FileCheck, Landmark as BankIcon
} from 'lucide-react';
import { Logo } from './Logo';
import { db, doc, setDoc, seedDemoData } from '../firebase';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onLaunchDemo?: () => void;
  onSandboxSuccess?: (profile: any, company: any) => void;
}

export default function LandingPage({ onGetStarted, onSignIn, onLaunchDemo, onSandboxSuccess }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const isProgrammaticScrolling = useRef(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<{
    name: string;
    email: string;
    eventType: string;
    eventUri: string;
    inviteeUuid: string;
  } | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Language & Translation State
  const [currentLang, setCurrentLang] = useState<'EN' | 'FR'>('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Dedicated Product Tour State
  const [showProductTour, setShowProductTour] = useState(false);

  // Close language dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const landingTranslations: Record<'EN' | 'FR', Record<string, string>> = {
    EN: {
      heroBadge: "PAYROLL & HR PLATFORM",
      heroRating: "4.8/5 from 2,500+ growing businesses",
      heroTitleLine1: "Payroll, HR & employee finance.",
      heroTitleLine2: "All in",
      heroTitleLine3: "one place.",
      heroSubtitle: "Pay your team, manage your people, and give employees instant access to their earned wages, all from one simple platform.",
      bookDemo: "Book a Demo",
      signIn: "Sign in",
      platform: "Platform",
      ohada: "OHADA Compliance",
      financialServices: "Financial Services",
      faq: "FAQ",
      productTour: "Take a tour",
    },
    FR: {
      heroBadge: "LOGICIEL DE PAIE ET RH",
      heroRating: "4,8/5 par plus de 2 500 entreprises",
      heroTitleLine1: "Paie, RH & finance des employés.",
      heroTitleLine2: "Tout en",
      heroTitleLine3: "un seul endroit.",
      heroSubtitle: "Payez votre équipe, gérez vos collaborateurs et offrez à vos employés un accès instantané à leurs salaires gagnés, le tout depuis une plateforme simple.",
      bookDemo: "Réserver une démo",
      signIn: "Se connecter",
      platform: "Plateforme",
      ohada: "Conformité OHADA",
      financialServices: "Services Financiers",
      faq: "FAQ",
      productTour: "Visite Guidée",
    }
  };

  const t = (key: string) => {
    return landingTranslations[currentLang][key] || key;
  };
  
  // Book a Demo Modal State
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoCompany, setDemoCompany] = useState('');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoSize, setDemoSize] = useState('10-50');
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);

  // Active Product Feature Showcase State
  const [activeFeature, setActiveFeature] = useState<'payroll' | 'hr' | 'finance' | 'accounting' | 'time' | 'analytics' | 'docs' | 'security'>('payroll');

  // Automatically scroll the active sticky-nav tab into view when it changes on mobile
  useEffect(() => {
    const activeBtn = document.querySelector(`#sticky-nav button[data-active="true"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeFeature]);

  // URL Query Detection for Calendly redirection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteeUuid = urlParams.get('invitee_uuid');
    const inviteeEmail = urlParams.get('invitee_email');
    const inviteeName = urlParams.get('invitee_name');
    const eventType = urlParams.get('event_type_name') || 'Enterprise Demo (30min)';
    const eventUri = urlParams.get('event_uri') || '';

    if (inviteeUuid || inviteeEmail || urlParams.get('booking_status') === 'success') {
      setBookingConfirmed(true);
      setBookingDetails({
        name: inviteeName || 'Valued Partner',
        email: inviteeEmail || '',
        eventType: eventType,
        eventUri: eventUri,
        inviteeUuid: inviteeUuid || '',
      });
      
      // Clean up the URL query parameters so they don't reappear on reload, but keep them in state
      try {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (e) {
        console.warn("Could not clean up URL parameters", e);
      }
    }
  }, []);

  // Interactive Live Salary Simulator State
  const [salaryValue, setSalaryValue] = useState(450000); // Base salary in XAF
  
  // Interactive Live Financial Advance Simulator State
  const [advanceRequest, setAdvanceRequest] = useState(120000);

  // Dedicated Financial Services Section Simulator States
  const [financialTab, setFinancialTab] = useState<'advance' | 'loan' | 'insurance' | 'savings'>('advance');
  const [financialAdvance, setFinancialAdvance] = useState(80000);
  const [financialLoan, setFinancialLoan] = useState(600000);
  const [financialLoanTenure, setFinancialLoanTenure] = useState(6);
  const [financialSavingsPercent, setFinancialSavingsPercent] = useState(8);

  // Mockup Autonomous Animation States
  const [mockupTab, setMockupTab] = useState<'payroll' | 'attendance' | 'analytics'>('payroll');
  const [focusedProfile, setFocusedProfile] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [chartBounce, setChartBounce] = useState<number[]>([40, 48, 56, 64, 60, 78, 85]);
  const [isModuleOpen, setIsModuleOpen] = useState(true);
  const [tableScrollOffset, setTableScrollOffset] = useState(0);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 12;
      
      // Cycle tabs
      if (step === 0 || step === 4 || step === 8) {
        setMockupTab('payroll');
        setIsModuleOpen(true);
      } else if (step === 1 || step === 5 || step === 9) {
        setMockupTab('attendance');
      } else if (step === 2 || step === 6 || step === 10) {
        setMockupTab('analytics');
      }

      // Simulated table scrolling / shifts
      setTableScrollOffset((prev) => (prev + 1) % 3);

      // Toggle mini setup module open/close effect automatically
      if (step % 4 === 0) {
        setIsModuleOpen(prev => !prev);
      }

      // Focus profiles periodically with high-contrast hover effects
      setFocusedProfile((prev) => (prev + 1) % 3);

      // Smoothly update chart columns
      if (step % 2 === 0) {
        setChartBounce(prev => prev.map(val => Math.max(30, Math.min(95, val + (Math.random() > 0.5 ? 12 : -12)))));
      }

      // Display beautiful alert/success toasts inside the mockup environment
      if (step === 1) {
        setNotification("✓ Orange Money payment gateway online");
      } else if (step === 3) {
        setNotification("📊 142 Pay Slips signed cryptographically with secure QR validation");
      } else if (step === 5) {
        setNotification("✓ Regional CNPS filing compiled automatically");
      } else if (step === 7) {
        setNotification("⚠️ Late clock-in audit completed for Operations team");
      } else if (step === 9) {
        setNotification("✓ Double-entry balanced in OHADA SYSCOHADA general ledger");
      } else {
        setNotification(null);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
      
      const sentinelEl = document.getElementById('sticky-nav-sentinel');
      const solutionsEl = document.getElementById('solutions');
      const headerHeight = window.innerWidth >= 768 ? 80 : 64;

      if (sentinelEl && solutionsEl) {
        const sentinelRect = sentinelEl.getBoundingClientRect();
        const solutionsRect = solutionsEl.getBoundingClientRect();
        
        // Stuck when the sentinel reaches or passes behind the responsive header height
        // and the solutions section hasn't completely scrolled away.
        const isStuck = sentinelRect.top <= (headerHeight + 2) && solutionsRect.bottom > (headerHeight + 140);
        setIsNavSticky(isStuck);
      } else {
        setIsNavSticky(false);
      }

      // Scroll spy logic
      if (!isProgrammaticScrolling.current) {
        const targets = document.querySelectorAll('[id^="suite-"]');
        if (targets.length > 0) {
          const subNavHeight = 58;
          const headerOffset = headerHeight + subNavHeight + 10; // dynamically match the combined sticky nav height
          
          // Check if we are near the bottom of the page
          const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120;
          if (isBottom) {
            const lastTarget = targets[targets.length - 1];
            const id = lastTarget.id.replace('suite-', '');
            setActiveFeature(id as any);
          } else {
            let activeId = '';
            
            for (let i = 0; i < targets.length; i++) {
              const target = targets[i];
              const rect = target.getBoundingClientRect();
              
              // Check if this section is currently crossing/occupying the focus area just below the sticky header
              if (rect.top <= headerOffset + 20 && rect.bottom > headerOffset) {
                activeId = target.id.replace('suite-', '');
                break;
              }
            }
            
            // Default to first if we are above the first target
            if (!activeId) {
              const firstRect = targets[0].getBoundingClientRect();
              if (firstRect.top > headerOffset) {
                activeId = targets[0].id.replace('suite-', '');
              }
            }
            
            if (activeId) {
              setActiveFeature(activeId as any);
            }
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check on load
    const timeoutId = setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleBookDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDemo(true);
    setRedirecting(true);
    
    const leadId = 'lead_' + Math.random().toString(36).substring(2, 11);
    const leadData = {
      id: leadId,
      name: demoName,
      email: demoEmail,
      company: demoCompany,
      phone: demoPhone,
      companySize: demoSize,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    try {
      // Save lead to Firestore for real persistent CRM integration
      await setDoc(doc(db, 'demo_leads', leadId), leadData);
    } catch (err) {
      console.warn("Firestore save failed, preserving lead in localStorage:", err);
    }
    
    // Save to localStorage as secondary backup
    const currentLeads = JSON.parse(localStorage.getItem('jefara_demo_leads') || '[]');
    currentLeads.push(leadData);
    localStorage.setItem('jefara_demo_leads', JSON.stringify(currentLeads));

    // Construct the Calendly booking URL with pre-filled visitor fields
    const calendlyBaseUrl = "https://calendly.com/jefarasas/30min";
    const params = new URLSearchParams({
      name: demoName,
      email: demoEmail,
      // Map custom variables for company name and phone number
      a1: demoCompany,
      a2: demoPhone,
      // Pass standard/fallback parameters for Calendly
      company: demoCompany,
      phone: demoPhone,
      location: demoPhone,
      // Track source metadata
      utm_source: 'jefara',
      utm_medium: 'lead_form',
      utm_campaign: 'demo_booking',
      utm_content: demoSize
    });
    
    const redirectUrl = `${calendlyBaseUrl}?${params.toString()}`;
    
    // Perform redirection with fallback for iframe environment
    setTimeout(() => {
      setSubmittingDemo(false);
      setRedirecting(false);
      try {
        if (window.self !== window.top) {
          window.top!.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      } catch (err) {
        window.location.href = redirectUrl;
      }
    }, 1200); // 1.2s delay for a premium transition message
  };

  const resetDemoForm = () => {
    setDemoName('');
    setDemoEmail('');
    setDemoCompany('');
    setDemoPhone('');
    setDemoSize('10-50');
    setDemoSubmitted(false);
    setRedirecting(false);
    setIsDemoModalOpen(false);
  };

  // Helper calculation formulas for Cameroon Payroll
  const computeCameroonTaxBreakdown = (basic: number) => {
    const cnpsEmployee = Math.min(basic * 0.042, 31500); // 4.2% employee cap at 750k base
    const cnpsEmployer = Math.min(basic * 0.162, 121500); // 16.2% employer
    
    // Simple bracket simulation for IRPP (Impôt sur le Revenu des Personnes Physiques)
    let irpp = 0;
    if (basic > 500000) {
      irpp = (basic - 500000) * 0.25 + 75000;
    } else if (basic > 150000) {
      irpp = (basic - 150000) * 0.15;
    }
    
    const netPay = basic - cnpsEmployee - irpp;
    
    return {
      cnpsEmployee: Math.round(cnpsEmployee),
      cnpsEmployer: Math.round(cnpsEmployer),
      irpp: Math.round(irpp),
      netPay: Math.round(netPay)
    };
  };

  const taxBreakdown = computeCameroonTaxBreakdown(salaryValue);

  // Accordion FAQ state
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is Jefara fully compliant with OHADA regulations?",
      a: "Yes, absolutely. Jefara has been built from the ground up specifically to support OHADA accounting standards and regional labor laws. All calculations for IRPP, CNPS, communal taxes, and local salary brackets are fully automated and verified by leading regional financial experts."
    },
    {
      q: "How does the salary advance and employee micro-finance feature work?",
      a: "Jefara allows qualified employers to enable instant salary advances for their team. Employees can request a safe percentage of their already earned salary via their mobile app, which is directly disbursed to their Orange Money or MTN MoMo wallet. The advance is then automatically logged and deducted at the source during the next monthly payroll run, removing all collection risk."
    },
    {
      q: "Can we migrate our existing employee database to Jefara easily?",
      a: "Yes. Jefara offers high-speed bulk import options. You can upload standard Excel/CSV templates, and our system will automatically parse contracts, department roles, current bank routes, and basic salaries. Our dedicated integration support team also assists enterprise clients with manual validation."
    },
    {
      q: "What security measures does Jefara use to protect employee data?",
      a: "We understand that payroll and HR data are highly sensitive. Jefara uses isolated multi-tenant data storage, bank-grade AES-256 encryption at rest, and end-to-end TLS encryption for all transmissions. Access logs are cryptographically hashed and all critical administrative activities require multi-factor verification."
    },
    {
      q: "What are your future direct-to-bank and mobile money integrations?",
      a: "We are actively engineering direct, secure API connections with leading regional providers, including Orange Money, MTN Mobile Money, Afriland First Bank, UBA, Société Générale Cameroun, and Mastercard. While these integrations are currently in development, they will soon enable one-click direct batch payments straight from your company balance."
    }
  ];

  const productFeatures = [
    {
      id: 'payroll' as const,
      label: 'Automated Payroll',
      icon: Receipt,
      badge: 'OHADA Compliant',
      title: 'Flawless OHADA-Compliant Payroll Engine',
      subtitle: 'Eliminate calculation risks, manual spreadsheets, and legal penalties.',
      description: 'Automatically compute basic salaries, specific allowances, CNPS contributions, communal charges, and IRPP brackets. Generates cryptographically verifiable payslips and tax reporting matrices tailored directly to regional law in milliseconds.'
    },
    {
      id: 'hr' as const,
      label: 'HR Management',
      icon: Users,
      badge: 'Core HR',
      title: 'Modern Employee Directory & Lifecycle Tracking',
      subtitle: 'Nurture talent and manage organizational hierarchies from one clean hub.',
      description: 'Streamline employee folders, physical and digital contracts (CDI, CDD, Temp), role assignments, promotional history, and department splits. Build structured departments and manage team operations in a premium enterprise interface.'
    },
    {
      id: 'finance' as const,
      label: 'Financial Services',
      icon: Wallet,
      badge: 'Liquidity',
      title: 'Instant Salary Advances & Financial Wellness',
      subtitle: 'Empower your workforce with on-demand liquidity directly to mobile wallets.',
      description: 'Reduce financial stress and boost productivity. Jefara enables employees to access up to 50% of their earned salary prior to pay day, with secure instant disbursement and seamless automatic source-deductions during payroll processing.'
    },
    {
      id: 'accounting' as const,
      label: 'Ledger Accounting',
      icon: Landmark,
      badge: 'OHADA Standards',
      title: 'Dynamic General Ledger & Financial Export Matrix',
      subtitle: 'Sync payroll flows directly with your corporate accounting standards.',
      description: 'Jefara automatically formats and maps payroll expenses, tax liabilities, and social security claims into standard double-entry journal matrices. Seamlessly download files styled to OHADA accounting configurations.'
    },
    {
      id: 'time' as const,
      label: 'Time & Attendance',
      icon: Clock,
      badge: 'Active Tracking',
      title: 'Integrated Shift Rosters, Clock-ins & Overtime',
      subtitle: 'Monitor workforce hours and compute complex overtime pay without friction.',
      description: 'Enable staff to submit digital timesheets or clock-in. Our core engine reads approved logs, automatically computes applicable overtime multiplication tiers, and maps the extra pay directly to the active month payroll.'
    },
    {
      id: 'analytics' as const,
      label: 'Visual Analytics',
      icon: BarChart4,
      badge: 'Intelligence',
      title: 'Stunning Visual Reports & Cost Projections',
      subtitle: 'Make strategic, data-backed decisions with crystal clear dashboards.',
      description: 'Gain holistic oversight of salary expenditures, historical department costs, gender parity matrices, age distribution, leave trends, and monthly growth indicators. Fully interactive with gorgeous dynamic charts.'
    },
    {
      id: 'docs' as const,
      label: 'Secure Vault',
      icon: FileText,
      badge: 'Digital Signatures',
      title: 'Secure Cloud Vault & Cryptographic Certificates',
      subtitle: 'Secure institutional documents with advanced access control lists.',
      description: 'Upload, sign, and store critical digital documents including work certifications, tax certificates, and employment contracts. All documents are encrypted using AES-256 protocols and can be signed electronically with secure digital signatures.'
    },
    {
      id: 'security' as const,
      label: 'Enterprise Security',
      icon: Shield,
      badge: 'High Security',
      title: 'Isolated Multi-Tenant Architecture & Audit Trails',
      subtitle: 'Bank-grade safety designed to protect enterprise integrity.',
      description: 'Maintain strict control over administrative actions. Define precise user permissions (Admin, Owner, Manager, Employee), enable multi-factor logins, and review secure, unalterable access logs tracing every payroll calculation and signature.'
    }
  ];

  const currentFeatureData = productFeatures.find(f => f.id === activeFeature) || productFeatures[0];
  const CurrentFeatureIcon = currentFeatureData.icon;

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        {/* Top Header / Nav Bar (simplified) */}
        <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setBookingConfirmed(false)}>
              <div className="h-9 w-9 bg-violet-600 text-white rounded-lg flex items-center justify-center font-display font-black tracking-tight shadow-md shadow-violet-600/25">
                J
              </div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900">Jefara</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-mono font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100 uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-violet-500 rounded-full animate-ping" /> Connection secure
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-2xl w-full bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Success Header Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-violet-850 px-6 py-12 text-center text-white relative overflow-hidden">
              {/* Background abstract visual patterns */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#ffffff_0%,transparent_60%)] pointer-events-none" />
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5 blur-xl pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                className="h-16 w-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-10 w-10 text-violet-200 fill-white/10" />
              </motion.div>
              
              <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight">Booking Confirmed!</h1>
              <p className="text-violet-100 text-xs sm:text-sm font-medium mt-2 max-w-md mx-auto">
                Thank you, <span className="font-bold text-white">{bookingDetails?.name}</span>. Your interactive walkthrough with a Jefara OHADA compliance architect is officially scheduled.
              </p>
            </div>

            {/* Core Details and Next Steps */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Event details summary */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg mt-0.5">
                    <Calendar className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Meeting Format</p>
                    <p className="text-xs font-bold text-slate-900">{bookingDetails?.eventType || 'Interactive Assessment'}</p>
                    <p className="text-[11px] text-slate-500 font-medium">30 Minutes, One-on-One</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg mt-0.5">
                    <Globe className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Access Details</p>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-violet-500" /> Google Meet Video
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]" title={bookingDetails?.email}>
                      Invites sent to {bookingDetails?.email || 'your registered email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Seamless Premium Timeline / Next Steps */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" /> What happens next?
                </h3>
                
                <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-4 ring-white text-[10px] font-bold">
                      1
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">Sandbox Workspace Allocation</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Our cloud backend is pre-provisioning an isolated secure workspace matching your corporate workforce tier. This contains pre-seeded OHADA compliance parameters.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-4 ring-white text-[10px] font-bold">
                      2
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">Compliance Specialization Prep</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        An assigned regional advisor is preparing localized insights for CNPS, IRPP, and regional labor laws matching your company size.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-violet-100 text-violet-700 ring-4 ring-white text-[10px] font-bold">
                      3
                    </span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">Workspace Walkthrough</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Simply join the Google Meet link in your calendar invitation at the scheduled slot for a guided tour and direct questions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Access CTA */}
              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-900">Can't wait to see the platform?</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Explore our fully operational sandbox environment immediately.</p>
                </div>
                
                <button
                  onClick={() => {
                    seedDemoData();
                    const storedProfile = JSON.parse(localStorage.getItem('jefara_demo_profile') || '{}');
                    const storedCompany = JSON.parse(localStorage.getItem('jefara_demo_company') || '{}');
                    if (onSandboxSuccess) {
                      onSandboxSuccess(storedProfile, storedCompany);
                    } else if (onLaunchDemo) {
                      onLaunchDemo();
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-[#7c3aed] text-white font-bold rounded-xl text-xs hover:bg-[#6d28d9] transition-all duration-300 active:scale-[0.98] shadow-md shadow-violet-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Explore Interactive Sandbox <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-slate-100 bg-white text-center">
          <p className="text-[10px] text-slate-400 font-semibold leading-normal">
            © 2026 Jefara SAS. All rights reserved. Regional Compliance • Douala, Cameroon.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-900 relative overflow-x-hidden">
      
      {/* Premium Minimalist Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-violet-50/70 via-slate-50/30 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-0 w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[45%] left-[-100px] w-[500px] h-[500px] rounded-full bg-violet-50/40 blur-[130px] pointer-events-none -z-10" />

      {/* Header Navbar */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          hasScrolled 
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs' 
            : 'bg-transparent shadow-none'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <button 
              onClick={() => { setShowProductTour(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 cursor-pointer border-none bg-transparent p-0 text-left"
            >
              <div className="h-10 w-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shadow-sm shadow-[#7c3aed]/20 flex-shrink-0">
                <Logo size={22} className="text-white" />
              </div>
              <div className="flex-shrink-0">
                <span className="font-display font-black text-lg sm:text-xl md:text-2xl tracking-tight text-slate-900">Jefara</span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-9 text-sm md:text-[15px] font-bold text-slate-600 tracking-tight">
            <a href="#solutions" className="hover:text-slate-950 transition-colors">{t('platform')}</a>
            <a href="#compliance" className="hover:text-slate-950 transition-colors">{t('ohada')}</a>
            <a href="#financial" className="hover:text-slate-950 transition-colors">{t('financialServices')}</a>
            <a href="#faq" className="hover:text-slate-950 transition-colors">{t('faq')}</a>
          </nav>

          {/* Unified CTAs / Button Container */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 flex-shrink-0">
            {/* Desktop Sign In */}
            <button 
              onClick={onSignIn}
              className="hidden md:block text-sm sm:text-base font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-50 transition-all px-5 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer"
            >
              {t('signIn')}
            </button>

            {/* Always Visible "Book a Demo" Button */}
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs sm:text-sm md:text-base font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all active:scale-[0.98] shadow-sm shadow-[#7c3aed]/15 cursor-pointer flex-shrink-0"
            >
              {t('bookDemo')}
            </button>

            {/* Language Selector (Desktop) */}
            <div className="hidden md:block relative ml-1" ref={langDropdownRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 text-sm sm:text-base font-bold text-slate-600 hover:text-slate-950 transition-colors px-2 py-2 cursor-pointer border-none bg-transparent"
              >
                <span>{currentLang === 'EN' ? 'EN' : 'FR'}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-1.5 w-24 bg-white border border-slate-100 rounded-lg shadow-lg z-50 py-1"
                  >
                    <button
                      onClick={() => {
                        setCurrentLang('EN');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors ${currentLang === 'EN' ? 'text-[#7c3aed]' : 'text-slate-600'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => {
                        setCurrentLang('FR');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 transition-colors ${currentLang === 'FR' ? 'text-[#7c3aed]' : 'text-slate-600'}`}
                    >
                      Français
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Controls Container (Mobile trigger - EN/FR selector moved to drawer) */}
            <div className="flex md:hidden items-center gap-1 sm:gap-2">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-lg absolute top-full left-0 right-0 z-50"
            >
              <div className="px-6 py-6 flex flex-col gap-4 text-sm font-semibold text-slate-600">
                <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900 py-1 transition-colors">{t('platform')}</a>
                <a href="#compliance" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900 py-1 transition-colors">{t('ohada')}</a>
                <a href="#financial" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900 py-1 transition-colors">{t('financialServices')}</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-900 py-1 transition-colors">{t('faq')}</a>
                <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 my-1">
                  <span className="text-slate-500 text-xs font-semibold">{currentLang === 'EN' ? 'Language' : 'Langue'}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCurrentLang('EN')}
                      className={`px-3 py-1.5 text-xs font-bold rounded ${currentLang === 'EN' ? 'bg-[#7c3aed] text-white' : 'bg-slate-50 text-slate-600'}`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setCurrentLang('FR')}
                      className={`px-3 py-1.5 text-xs font-bold rounded ${currentLang === 'FR' ? 'bg-[#7c3aed] text-white' : 'bg-slate-50 text-slate-600'}`}
                    >
                      FR
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onSignIn(); }}
                    className="text-center font-bold text-slate-700 hover:text-slate-900 py-2.5 bg-slate-50 rounded-lg cursor-pointer text-xs"
                  >
                    {t('signIn')}
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); setIsDemoModalOpen(true); }}
                    className="text-center bg-[#7c3aed] text-white font-bold py-2.5 rounded-lg shadow-sm shadow-[#7c3aed]/15 cursor-pointer text-xs"
                  >
                    {t('bookDemo')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {!showProductTour ? (
        <>
          {/* Hero Section */}
          <section className="relative w-full bg-gradient-to-b from-violet-100/45 via-violet-50/20 to-transparent pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              {/* Soft ambient violet glow at the bottom of the hero ground */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-200/35 blur-[120px] pointer-events-none rounded-full -z-10" />
        
        {/* Display Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[21px] sm:text-[25px] md:text-[34px] font-display font-black tracking-tight text-slate-950 max-w-md sm:max-w-lg md:max-w-xl leading-[1.2] mx-auto text-center"
        >
          <span className="block mb-2 md:mb-3">{t('heroTitleLine1')}</span>
          <span className="block text-slate-900">{t('heroTitleLine2')} {t('heroTitleLine3')}</span>
        </motion.h1>

        {/* Supporting Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base text-slate-700 mt-6 max-w-xs sm:max-w-md md:max-w-lg font-medium leading-relaxed mx-auto text-center"
        >
          {t('heroSubtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-8 w-full sm:w-auto mx-auto"
        >
          <button 
            onClick={() => setIsDemoModalOpen(true)}
            className="w-full sm:w-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs px-8 py-3.5 rounded-lg transition-all active:scale-[0.98] shadow-sm shadow-[#7c3aed]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {t('bookDemo')} <ArrowRight className="h-4 w-4" />
          </button>
          <button 
            onClick={() => {
              setShowProductTour(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-8 py-3.5 rounded-lg border border-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlayCircle className="h-4 w-4 text-[#7c3aed]" /> {t('productTour')}
          </button>
        </motion.div>

        {/* High-Fidelity Product Mockup Frame */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="w-full max-w-5xl mt-14 md:mt-18"
        >
          <div className="w-full bg-violet-950 rounded-xl border border-violet-900/60 shadow-xl overflow-hidden text-left flex flex-col h-[820px] sm:h-[680px] md:h-[600px] lg:h-[580px]">
            
            {/* Top Chrome Window Header */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between relative">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              </div>
            </div>

            {/* Top center toast overlay inside the mockup */}
            <div className="relative">
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, x: "-50%", scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                    exit={{ opacity: 0, y: -15, x: "-50%", scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-sm bg-slate-900 text-white border border-slate-800 p-3 rounded-lg shadow-xl flex items-center gap-2.5"
                  >
                    <Sparkles className="h-4 w-4 text-violet-400 shrink-0 animate-bounce" />
                    <p className="text-[11px] font-semibold tracking-tight text-slate-100 leading-tight">
                      {notification}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Internal Top Tab Bar */}
            <div className="flex border-b border-slate-100 bg-white px-4 md:px-6 py-2.5 items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none gap-4">
              <div className="flex gap-1">
                {[
                  { id: 'payroll', label: 'Payroll Engine', icon: Receipt },
                  { id: 'attendance', label: 'Attendance Module', icon: Clock },
                  { id: 'analytics', label: 'Analytics Engine', icon: BarChart4 }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = mockupTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMockupTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-violet-50 text-[#7c3aed]"
                          : "text-slate-650 hover:text-slate-800"
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">Sync State: Live</span>
              </div>
            </div>

            {/* Simulated Live Product Dashboard layout */}
            <div className="flex-1 p-6 md:p-8 bg-slate-50 relative overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <AnimatePresence mode="wait">
                {mockupTab === 'payroll' && (
                  <motion.div
                    key="payroll"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Left Mock stats & employee list */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Visual Header within Mockup */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                            <span>Enterprises</span>
                            <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
                            <span className="text-violet-600">SNE S.A.</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">Société Nouvelle d'Énergie S.A.</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live OHADA Sync
                          </span>
                        </div>
                      </div>

                      {/* Grid of cards inside mockup */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-sm space-y-2 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">Active Personnel</span>
                            <Users className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Full Crew Active</span>
                            <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-1.5 py-0.5 rounded flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> Growing</span>
                          </div>
                          {/* Mini visual avatar grouping */}
                          <div className="flex items-center pt-2 gap-1">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              <span className="inline-block h-4 w-4 rounded-full ring-2 ring-white bg-slate-200 text-[8px] font-bold flex items-center justify-center text-slate-600">JN</span>
                              <span className="inline-block h-4 w-4 rounded-full ring-2 ring-white bg-violet-100 text-[8px] font-bold flex items-center justify-center text-violet-700">FM</span>
                              <span className="inline-block h-4 w-4 rounded-full ring-2 ring-white bg-indigo-100 text-[8px] font-bold flex items-center justify-center text-indigo-700">AT</span>
                            </div>
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50/50 px-1.5 py-0.5 rounded">Optimal Stability</span>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-sm space-y-2 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">Monthly Payroll</span>
                            <Briefcase className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-extrabold text-[#7c3aed] bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100/50">Disbursed Cycle</span>
                            <span className="text-[10px] font-mono text-slate-700 font-bold">XAF</span>
                          </div>
                          {/* Mini Monthly Trend Bars */}
                          <div className="flex items-end gap-1 pt-3 h-5">
                            <span className="w-2.5 bg-slate-100 rounded-t h-2" />
                            <span className="w-2.5 bg-slate-100 rounded-t h-3" />
                            <span className="w-2.5 bg-slate-200 rounded-t h-2.5" />
                            <span className="w-2.5 bg-slate-200 rounded-t h-4" />
                            <span className="w-2.5 bg-violet-500 rounded-t h-5" />
                            <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Budget Track Stable</span>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-sm space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">Compliance Rating</span>
                            <Shield className="h-4 w-4 text-violet-400" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100"><Check className="h-3 w-3" /> Fully Compliant</span>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">✓ CNPS Audit Clear</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                            <div className="bg-emerald-500 h-full w-full rounded-full" />
                          </div>
                        </div>
                      </div>

                      {/* Mock Employee Directory List snippet */}
                      <div className="bg-white border-2 border-violet-700/80 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-5 py-3 border-b border-violet-200 flex items-center justify-between bg-violet-50/40">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                            <span className="text-xs font-bold text-slate-800">Team Salary Status Directory</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-600 font-bold bg-white px-2 py-0.5 rounded border border-slate-150">Active Payroll Cycle</span>
                        </div>
                        
                        {/* Interactive Table with headers */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-violet-100/80 bg-violet-50/20 text-[10px] font-mono text-violet-700 font-bold uppercase">
                                <th className="py-2.5 px-4 font-semibold">Employee Details</th>
                                <th className="py-2.5 px-4 font-semibold">Contract</th>
                                <th className="py-2.5 px-4 font-semibold">Salary Grade</th>
                                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-violet-100/60">
                              {[
                                { id: 0, name: "Jean-Pierre Ndi", role: "Chief Architect", dept: "Engineering", type: "CDI", loc: "Douala HQ", salary: "Executive Band", status: "Paid", avatarInit: "JN", avatarColor: "bg-violet-100 text-violet-700" },
                                { id: 1, name: "Fabiola Mbango", role: "HR Operations Lead", dept: "Operations", type: "CDI", loc: "Yaounde Branch", salary: "Management Band", status: "Paid", avatarInit: "FM", avatarColor: "bg-violet-100 text-violet-700" },
                                { id: 2, name: "Armand Tchakounté", role: "Senior Accountant", dept: "Finance", type: "CDD", loc: "Garoua Base", salary: "Senior Professional", status: "Reviewing", avatarInit: "AT", avatarColor: "bg-amber-100 text-amber-800" }
                              ].map((person) => {
                                const isFocused = focusedProfile === person.id;
                                return (
                                  <tr 
                                    key={person.id}
                                    onClick={() => setFocusedProfile(person.id)}
                                    className={`transition-all duration-200 cursor-pointer ${
                                      isFocused 
                                        ? "bg-violet-50/40 border-l-4 border-[#7c3aed]!" 
                                        : "hover:bg-slate-50/60"
                                    }`}
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full ${person.avatarColor} flex items-center justify-center font-bold text-xs relative shrink-0`}>
                                          {person.avatarInit}
                                          {isFocused && (
                                            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-violet-600 animate-ping" />
                                          )}
                                        </div>
                                        <div>
                                          <span className="font-bold text-slate-800 block text-[11px]">{person.name}</span>
                                          <span className="text-[10px] text-slate-600 font-medium">{person.role} • <span className="text-slate-700 font-bold">{person.dept}</span></span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <div className="space-y-0.5">
                                        <span className="inline-block text-[9px] bg-slate-100 border border-slate-200/40 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold leading-none">{person.type}</span>
                                        <span className="block text-[9px] text-slate-600 font-medium">{person.loc}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isFocused 
                                          ? "bg-violet-100 text-violet-700 border border-violet-200" 
                                          : person.id === 0 
                                            ? "bg-violet-50 text-violet-600 border border-violet-100" 
                                            : person.id === 1 
                                              ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                                              : "bg-slate-100 text-slate-600 border border-slate-200"
                                      }`}>
                                        {person.salary}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        person.status === "Paid" 
                                          ? "bg-violet-50 text-violet-700 border border-violet-100" 
                                          : "bg-amber-50 text-amber-800 border border-amber-200"
                                      }`}>
                                        <span className={`h-1 w-1 rounded-full ${person.status === "Paid" ? "bg-violet-500" : "bg-amber-500 animate-pulse"}`} />
                                        {person.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    {/* Right side drawer / calculations */}
                    <div className="space-y-6">
                      
                      {/* Premium OHADA Receipt Slip Card */}
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                        {/* Top decorative receipt hole punches */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent flex justify-between px-6">
                          {[...Array(8)].map((_, i) => (
                            <span key={i} className="h-2 w-2 rounded-full bg-slate-50 -mt-1 block" />
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 pt-2">
                          <div>
                            <span className="text-[9px] font-mono text-[#7c3aed] font-bold tracking-widest block">AUDITED REGISTER</span>
                            <span className="text-[10px] font-bold text-slate-600 font-mono">OHADA-SYSCOHADA-REGISTRY</span>
                          </div>
                          <span className="text-[9px] font-mono bg-violet-50 text-[#7c3aed] px-2 py-0.5 rounded font-bold border border-violet-100/60 uppercase">SECURE SEAL</span>
                        </div>

                        <div className="space-y-3.5">
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-slate-600 font-semibold">Active Employee</span>
                            <span className="font-bold text-slate-800 text-[13px]">
                               {focusedProfile === 0 ? "Jean-Pierre Ndi" : focusedProfile === 1 ? "Fabiola Mbango" : "Armand Tchakounté"}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-slate-600">Basic Salary (Base)</span>
                            <span className="font-mono font-bold text-slate-700">
                              {focusedProfile === 0 ? "Executive Level Rate" : focusedProfile === 1 ? "Management Level Rate" : "Standard Grade Rate"}
                            </span>
                          </div>

                          <div className="flex justify-between items-baseline text-xs">
                            <span className="text-slate-600">Housing Allowance</span>
                            <span className="font-mono font-semibold text-indigo-600">
                              {focusedProfile === 0 ? "+Executive Benefit" : focusedProfile === 1 ? "+Management Benefit" : "+Standard Benefit"}
                            </span>
                          </div>

                          {/* Dashed breakdown divider */}
                          <div className="border-t border-dashed border-slate-200 pt-3 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-700">
                              <span className="flex items-center gap-1">CNPS Pension Share</span>
                              <span className="font-mono text-slate-700">
                                -Statutory Deduction
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                              <span className="flex items-center gap-1">IRPP Tax Levy</span>
                              <span className="font-mono text-slate-700">
                                -Auto-Calculated Tax
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                              <span className="flex items-center gap-1">Local Communal Tax</span>
                              <span className="font-mono text-slate-700">
                                -Municipal Surcharge
                              </span>
                            </div>
                          </div>

                          {/* Calculated final total box */}
                          <div className="border-t border-solid border-slate-100 pt-3 flex justify-between items-center font-bold text-slate-800">
                            <div className="text-left">
                              <span className="block text-[9px] text-slate-600 uppercase font-bold tracking-wider font-mono">Net Payable</span>
                              <span className="text-[10px] text-slate-700 font-medium">To Mobile Money / Bank</span>
                            </div>
                            <span className="font-mono text-xs text-[#7c3aed] font-black tracking-tight">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">Disbursed & Reconciled</span>
                            </span>
                          </div>

                          {/* Visual barcode mockup inside receipt slip */}
                          <div className="pt-3 border-t border-slate-100 text-center">
                            <div className="h-5 bg-slate-100 rounded flex gap-0.5 items-center justify-center px-4 overflow-hidden opacity-70">
                              {[2,4,1,3,2,1,4,2,3,1,2,4,2,1,3,2,1,4,2,3].map((w, idx) => (
                                <span key={idx} className="bg-slate-800 h-full block shrink-0" style={{ width: `${w}px` }} />
                              ))}
                            </div>
                            <span className="text-[8px] font-mono text-slate-400 font-bold block mt-1 tracking-wider">✓ JEFARA COMPLIANCE SECURED GATEWAY</span>
                          </div>
                        </div>
                      </div>

                      {/* Sliding settings module */}
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">Regional Setup Settings</span>
                          <span className="text-[9px] font-mono font-bold bg-violet-100 text-[#7c3aed] px-1.5 py-0.5 rounded">
                            {isModuleOpen ? "Active Node" : "Standby"}
                          </span>
                        </div>
                        <motion.div
                          animate={{ height: isModuleOpen ? "auto" : 0, opacity: isModuleOpen ? 1 : 0 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-3.5 overflow-hidden text-xs"
                        >
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <div>
                                <span className="block text-[11px] font-bold text-slate-850">CNPS Employer Cap</span>
                                <span className="text-[9px] text-slate-600 font-mono">OHADA Rule • Statutory Share</span>
                              </div>
                              {/* Custom functional toggle switch */}
                              <div className="h-4.5 w-8 rounded-full bg-violet-600 relative p-0.5 transition-colors cursor-pointer">
                                <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 bg-white rounded-full shadow-sm block" />
                              </div>
                            </div>

                            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <div>
                                <span className="block text-[11px] font-bold text-slate-850">Housing Taxability Rules</span>
                                <span className="text-[9px] text-slate-600 font-mono">Standard flat rate calculation</span>
                              </div>
                              <div className="h-4.5 w-8 rounded-full bg-violet-600 relative p-0.5 transition-colors cursor-pointer">
                                <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 bg-white rounded-full shadow-sm block" />
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-[10px] text-slate-600 font-medium leading-normal bg-violet-50/50 p-2 rounded border border-violet-100/50">
                            💡 Regional tax multiplier rates and legal caps are monitored dynamically and updated seamlessly by corporate legal advisors.
                          </p>
                        </motion.div>
                        {!isModuleOpen && (
                          <div className="py-1 text-center text-[9px] font-mono text-slate-600 font-bold uppercase tracking-wider">
                            Drawer Minimized
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {mockupTab === 'attendance' && (
                  <motion.div
                    key="attendance"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Attendance audit records */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                            <span>Operations</span>
                            <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
                            <span className="text-violet-600">Roster Stream</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">Roster Audit & Shift Attendance</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-[#7c3aed] border border-violet-100/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                            Full Shift Presence Verified
                          </span>
                        </div>
                      </div>

                      {/* Roster cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-sm space-y-1">
                          <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">Morning Shift</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded">Day Crew Active</span>
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Full Roster</span>
                          </div>
                          {/* Mini fluid occupancy bar */}
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                            <div className="bg-[#7c3aed] h-full w-[96%] rounded-full" />
                          </div>
                          <span className="text-[9px] text-slate-600 font-medium block pt-1">Capacity: Optimized Peak</span>
                        </div>

                        <div className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-sm space-y-1">
                          <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">Afternoon Shift</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded">Late Crew Active</span>
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">Full Roster</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                            <div className="bg-[#7c3aed] h-full w-[92%] rounded-full" />
                          </div>
                          <span className="text-[9px] text-slate-600 font-medium block pt-1">Capacity: Optimized Peak</span>
                        </div>

                        <div className="bg-white border border-slate-100/80 p-4 rounded-xl shadow-sm space-y-1">
                          <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider block">Earliest Clock-In</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-[#7c3aed] bg-violet-50 px-2 py-0.5 rounded">Shift Commenced</span>
                            <span className="text-[9px] text-slate-600 font-mono">Douala HQ</span>
                          </div>
                          <div className="flex items-center gap-1 pt-3.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            <span className="text-[9px] text-slate-700 font-medium truncate max-w-[120px]">Jean-Pierre N.</span>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Attendance & Daily Arrival Distribution Analytics */}
                      <div className="bg-violet-50/25 border-2 border-violet-600/70 rounded-xl overflow-hidden shadow-sm p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-xs font-bold text-violet-950">Peak Arrival & Shift Coverage Reports</span>
                          </div>
                          <span className="text-[9px] font-mono text-violet-700 font-bold bg-white px-2 py-0.5 rounded border border-violet-200">Live Analytics</span>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[11px] text-violet-900 leading-relaxed font-medium">
                            Hourly entry volume showing optimal roster distribution. Shift start window peaks cleanly at 07:30 AM.
                          </p>
                          
                          {/* Arrival Hour Distribution Histogram */}
                          <div className="h-28 flex items-end justify-between gap-2.5 pt-4 border-b border-violet-100 pb-2">
                            {[
                              { hour: "07:00", val: 35, label: "Early Entry" },
                              { hour: "07:30", val: 88, label: "Peak Load" },
                              { hour: "08:00", val: 45, label: "On Time" },
                              { hour: "08:30", val: 12, label: "Grace Period" },
                              { hour: "09:00", val: 4, label: "Late Entry" },
                            ].map((bar, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                                <div className="w-full relative">
                                  <motion.div 
                                    className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t shadow-xs group-hover:from-violet-500 group-hover:to-indigo-300 transition-colors"
                                    animate={{ height: `${bar.val}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    style={{ height: `${bar.val}%` }}
                                  />
                                  <div className="absolute top-[-22px] left-1/2 -translate-x-1/2 bg-violet-950 text-white text-[8px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono font-bold shadow-md z-20 pointer-events-none">
                                    {bar.label} ({bar.val}%)
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-violet-800">{bar.hour}</span>
                              </div>
                            ))}
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-3 gap-3 pt-1 text-center">
                            <div className="bg-white/75 p-2 rounded-lg border border-violet-100/80">
                              <span className="text-[18px] font-bold font-mono text-violet-950 block leading-tight">96.4%</span>
                              <span className="text-[8px] text-violet-700 font-bold uppercase tracking-wider">On-Time Index</span>
                            </div>
                            <div className="bg-white/75 p-2 rounded-lg border border-violet-200">
                              <span className="text-[18px] font-bold font-mono text-[#7c3aed] block leading-tight">07:32 AM</span>
                              <span className="text-[8px] text-[#7c3aed] font-bold uppercase tracking-wider">Avg Check-In</span>
                            </div>
                            <div className="bg-white/75 p-2 rounded-lg border border-violet-100/80">
                              <span className="text-[18px] font-bold font-mono text-indigo-600 block leading-tight">100%</span>
                              <span className="text-[8px] text-indigo-700 font-bold uppercase tracking-wider">Shift Coverage</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side Overtime Panel */}
                    <div className="space-y-6">
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                        <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest block">Overtime Automation</span>
                        
                        <div className="p-4 rounded-xl bg-violet-50/30 border border-violet-100/50 space-y-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-[#7c3aed] uppercase tracking-wider">Accrued Premium Hours</span>
                            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.2 rounded border border-violet-100">Sync Approved</span>
                          </div>

                          <div className="space-y-3">
                            <div className="space-y-1">
                              <div className="flex justify-between font-medium text-slate-800 text-[11px]">
                                <span>Double Overtime Rate (Premium multiplier)</span>
                                <span className="font-bold text-slate-900 font-mono">Verified Cycle Hours</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-violet-500 h-full w-[60%] rounded-full" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between font-medium text-slate-800 text-[11px]">
                                <span>Holiday Premium Rate (Holiday multiplier)</span>
                                <span className="font-bold text-slate-900 font-mono">Approved Holiday Hours</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full w-[25%] rounded-full" />
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-slate-200/50 my-1" />
                          
                          <div className="flex items-start gap-2.5 text-[10px] text-slate-700 leading-normal font-medium">
                            <CheckCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>Clock-in registers map automatically into the monthly payroll module to calculate compensation based on exact legal multipliers.</span>
                          </div>
                        </div>
                      </div>

                      {/* Micro visual shift calendar */}
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-2.5">
                        <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider block">Weekly Roster View</span>
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                            <span key={idx} className="text-[9px] font-mono text-slate-600 font-bold block">{day}</span>
                          ))}
                          {[...Array(7)].map((_, i) => (
                            <div key={i} className="h-6 bg-slate-50 border border-slate-100 rounded flex items-center justify-center relative">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              {i === 4 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-600 animate-pulse" />}
                            </div>
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-600 font-medium block text-center">Active roster coverage: Stable</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mockupTab === 'analytics' && (
                  <motion.div
                    key="analytics"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Analytics graphs & tables */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                            <span>Intelligence</span>
                            <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
                            <span className="text-violet-600">Compensation Curve</span>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">Corporate Compensation Analytics</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-50 text-[#7c3aed] border border-violet-100/60">
                            12-Month Projected Budget Run
                          </span>
                        </div>
                      </div>

                      {/* Continuous updating Bar Chart */}
                      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Dynamic Monthly Expenditure Runs</span>
                            <span className="text-[9px] text-slate-600 font-mono">Simulated monthly variance (Optimal Tracking)</span>
                          </div>
                        </div>

                        {/* Interactive Chart stage */}
                        <div className="relative pt-6 px-2">
                          {/* Y-Axis Guideline grids */}
                          <div className="absolute inset-x-0 bottom-10 top-0 flex flex-col justify-between pointer-events-none opacity-50">
                            <div className="border-b border-dashed border-slate-100 h-px w-full" />
                            <div className="border-b border-dashed border-slate-100 h-px w-full" />
                            <div className="border-b border-dashed border-slate-100 h-px w-full" />
                            <div className="border-b border-dashed border-slate-100 h-px w-full" />
                          </div>

                          <div className="h-36 flex items-end justify-between gap-3 relative z-10">
                            {[
                              { month: "Jan", val: chartBounce[0] },
                              { month: "Feb", val: chartBounce[1] },
                              { month: "Mar", val: chartBounce[2] },
                              { month: "Apr", val: chartBounce[3] },
                              { month: "May", val: chartBounce[4] },
                              { month: "Jun", val: chartBounce[5] },
                              { month: "Jul", val: chartBounce[6] }
                            ].map((bar, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                <div className="w-full relative">
                                  <motion.div 
                                    className="w-full bg-gradient-to-t from-[#7c3aed] to-indigo-400 rounded-t shadow-sm hover:from-violet-500 hover:to-indigo-300 transition-colors"
                                    animate={{ height: `${bar.val}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                    style={{ height: `${bar.val}%`, minHeight: '15px' }}
                                  />
                                  <div className="absolute top-[-26px] left-1/2 -translate-x-1/2 bg-[#4c1d95] text-white text-[9px] py-0.5 px-1.5 rounded opacity-100 whitespace-nowrap font-mono font-bold scale-90 shadow-md">
                                    {i % 2 === 0 ? "Audited" : "Balanced"}
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-violet-700 mt-1">{bar.month}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Double-Entry Ledger Details */}
                    <div className="bg-violet-50/25 border-2 border-violet-600/70 rounded-xl p-5 shadow-sm space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-violet-200 pb-2 bg-violet-50/40 -mx-5 -mt-5 p-5 rounded-t-xl mb-4">
                        <div className="text-left">
                          <span className="font-bold text-violet-950 block">OHADA Expenditure & Liability Breakdown</span>
                          <span className="text-[9px] text-violet-600 font-mono font-bold uppercase">Corporate Cost Projections</span>
                        </div>
                        <span className="text-[9px] font-mono bg-white text-[#7c3aed] px-2 py-0.5 rounded border border-violet-100 font-bold">SYSCOHADA v2</span>
                      </div>

                      <p className="text-[11px] text-violet-900 leading-normal font-medium">
                        Automatic journal allocations of payroll expenses into statutory ledger categories.
                      </p>

                      <div className="space-y-3.5">
                        {[
                          { label: "Personnel Salaries & Wages (A/C 661100)", pct: 68, color: "bg-violet-600" },
                          { label: "CNPS Statutory Social Debt (A/C 444100)", pct: 18, color: "bg-indigo-500" },
                          { label: "State IRPP Taxes Withheld (A/C 443100)", pct: 11, color: "bg-blue-500" },
                          { label: "Net Municipal Levies (A/C 443200)", pct: 3, color: "bg-violet-400" }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-violet-900">
                              <span>{item.label}</span>
                              <span className="font-mono text-violet-950">{item.pct}%</span>
                            </div>
                            <div className="w-full bg-violet-100/60 h-2 rounded-full overflow-hidden">
                              <motion.div 
                                className={`${item.color} h-full rounded-full`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.pct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-b border-violet-100 my-2" />

                      <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                        <div className="bg-white/80 p-2 rounded border border-violet-150">
                          <span className="text-[10px] text-violet-700 font-bold uppercase tracking-wider block">Trial Balance Status</span>
                          <span className="text-xs font-mono font-bold text-violet-900">✓ 100% Reconciled</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded border border-indigo-150">
                          <span className="text-[10px] text-indigo-700 font-bold uppercase tracking-wider block">Auditing State</span>
                          <span className="text-xs font-mono font-bold text-indigo-900">✓ Auto-Balanced</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-violet-900 font-medium leading-relaxed bg-white/60 p-2 rounded border border-violet-200/50">
                        ✓ Generates completely balanced debit/credit journals automatically mapped to standard OHADA ledger categories for immediate general ledger ingestion.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

      {/* Social Proof Logos Segment */}
      <section className="py-12 bg-white border-y border-slate-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 text-[10px] font-bold tracking-widest uppercase mb-6 font-mono">
            Direct Payroll & Payment Integration Gateways
          </p>
          
          {/* Infinite Marquee Wrapper with Fade Gradients */}
          <div className="relative w-full overflow-hidden mt-2">
            {/* Left and right elegant edge fading */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            
            <div className="flex overflow-hidden select-none">
              <div className="animate-marquee gap-14 md:gap-24 py-4 items-center shrink-0">
                {[
                  "ORANGE MONEY", "MTN MOMO", "ECOBANK", "UBA GROUP", 
                  "AFRILAND FIRST BANK", "SOCIÉTÉ GÉNÉRALE", "MASTERCARD",
                  "ORANGE MONEY", "MTN MOMO", "ECOBANK", "UBA GROUP", 
                  "AFRILAND FIRST BANK", "SOCIÉTÉ GÉNÉRALE", "MASTERCARD"
                ].map((logo, idx) => (
                  <div 
                    key={idx} 
                    className="font-display font-black text-sm md:text-base tracking-widest text-slate-400/60 hover:text-[#7c3aed] transition-colors cursor-pointer shrink-0 inline-block"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          <div className="bg-white border border-slate-100 p-8 rounded-xl shadow-sm text-center md:text-left space-y-3">
            <div className="h-10 w-10 bg-violet-50 text-[#7c3aed] rounded-lg flex items-center justify-center font-bold mx-auto md:mx-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Calculation Accuracy</h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Eliminate risk. Our robust engine computes CNPS social contributions, IRPP brackets, and communal charges with absolute local compliance.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-xl shadow-sm text-center md:text-left space-y-3">
            <div className="h-10 w-10 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center font-bold mx-auto md:mx-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Time Saved on Runs</h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              No more manual files or confusing scripts. Run your entire corporate payroll from bulk CSV uploads to signed receipts in milliseconds.
            </p>
          </div>

          <div className="bg-white border border-slate-100 p-8 rounded-xl shadow-sm text-center md:text-left space-y-3">
            <div className="h-10 w-10 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center font-bold mx-auto md:mx-0">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Compliance Reassured</h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              Fully aligned with OHADA auditing codes and specific country regulations (Cameroon, Senegal, Ivory Coast, Gabon).
            </p>
          </div>

        </div>
      </section>

      {/* Platform Features Interactive Section (Sticky Nav Storytelling) */}
      <section id="solutions" className="py-24 bg-white border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-6 mb-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900">
              An all-in-one suite designed <br className="hidden sm:inline" /> to manage modern talent.
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
              Manage your employees' lifecycle, run compliant local salaries, and synchronize corporate ledgers directly from a unified cloud environment.
            </p>
          </div>

        </div>

        {/* Sentinel element to track sticky scroll point */}
        <div id="sticky-nav-sentinel" className="h-px w-full pointer-events-none" />

        {/* Stable Wrapper to reserve space in flow and prevent any layout shift or content jumping */}
        <div className="relative w-full h-[58px] mb-16 z-30">
          <div 
            id="sticky-nav"
            className={`transition-[background-color,shadow,padding,border-color] duration-150 ${
              isNavSticky 
                ? 'fixed top-16 md:top-20 left-0 right-0 w-full bg-white border-b border-slate-100 py-2.5 shadow-sm z-30' 
                : 'absolute inset-x-0 top-0 h-[58px] max-w-4xl mx-auto w-[calc(100%-2rem)] bg-slate-50/50 border border-slate-100 rounded-2xl px-2 shadow-none flex items-center'
            }`}
          >
            <div className={`w-full transition-all duration-300 ${
              isNavSticky 
                ? 'max-w-7xl mx-auto px-6 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none items-center justify-between'
                : 'flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none items-center justify-between'
            }`}>
              {productFeatures.map((feat) => {
                const isActive = activeFeature === feat.id;
                return (
                  <button
                    key={feat.id}
                    data-active={isActive}
                    onClick={() => {
                      const el = document.getElementById(`suite-${feat.id}`);
                      if (el) {
                        isProgrammaticScrolling.current = true;
                        setActiveFeature(feat.id);
                        const headerH = window.innerWidth >= 768 ? 80 : 64;
                        const subNavH = 58;
                        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
                        window.scrollTo({
                          top: elementPosition - (headerH + subNavH + 8),
                          behavior: 'smooth'
                        });
                        setTimeout(() => {
                          isProgrammaticScrolling.current = false;
                        }, 800);
                      }
                    }}
                    className="relative px-3.5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer focus:outline-none select-none shrink-0"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="stickyActiveTabIndicator"
                        className="absolute inset-0 bg-[#7c3aed] rounded-full -z-10 shadow-sm shadow-[#7c3aed]/15"
                        transition={{ type: "spring", stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-1.5 ${isActive ? 'text-white' : 'text-slate-700 hover:text-slate-900'}`}>
                      {feat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {/* Continuous Scroll Storytelling cards */}
          <div className="space-y-16">
            {productFeatures.map((feat, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={feat.id}
                  id={`suite-${feat.id}`}
                  className="scroll-mt-36 p-6 md:p-10 bg-slate-50/50 border border-slate-100 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center hover:shadow-[0_12px_40px_rgba(0,0,0,0.015)] transition-all duration-350"
                >
                  {/* Text side */}
                  <div className={`md:col-span-5 space-y-5 ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                    <h3 className="text-2xl font-display font-black tracking-tight text-slate-900 leading-tight">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-700 font-bold">
                      {feat.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                    <div className="pt-2">
                      <button 
                        onClick={() => setIsDemoModalOpen(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7c3aed] hover:text-[#6d28d9] transition-colors cursor-pointer"
                      >
                        See in Action <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Graphic/Interactive side */}
                  <div className={`md:col-span-7 bg-violet-950 border border-violet-900/60 rounded-2xl p-5 shadow-sm min-h-[300px] flex flex-col justify-center ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                    
                    {/* Payroll View */}
                    {feat.id === "payroll" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded bg-violet-900/40 text-violet-300 flex items-center justify-center font-bold text-[10px]">P</div>
                            <span className="text-xs font-bold text-white">OHADA Statutory Tax Engine</span>
                          </div>
                          <span className="text-[10px] text-violet-300 font-mono font-bold bg-violet-900/50 px-2 py-0.5 rounded border border-violet-850/50">AUTO-COMPLIANT</span>
                        </div>
                        <div className="space-y-2.5">
                          {[
                            { title: "Junior Staff", grossTier: "Standard Base", cnpsTier: "Statutory Match", irppTier: "Standard Exempt", netTier: "Tier A Verified" },
                            { title: "Senior Officer", grossTier: "Elevated Base", cnpsTier: "Statutory Match", irppTier: "Tier Rate Approved", netTier: "Tier B Verified" },
                            { title: "Department Head", grossTier: "Executive Base", cnpsTier: "Statutory Match (Capped)", irppTier: "Surtax Rate Approved", netTier: "Tier C Verified" }
                          ].map((item, idx) => {
                            return (
                              <div key={idx} className="bg-violet-900/45 p-2.5 rounded-xl flex justify-between items-center text-xs border border-violet-800/40">
                                <div>
                                  <span className="font-bold text-white block">{item.title}</span>
                                  <div className="flex items-center gap-2 text-[10px] text-violet-300 mt-0.5">
                                    <span>Gross: {item.grossTier}</span>
                                    <span>•</span>
                                    <span>CNPS: {item.cnpsTier}</span>
                                    <span>•</span>
                                    <span>IRPP: {item.irppTier}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-violet-300 font-medium block">Net Disbursed</span>
                                  <span className="font-mono font-extrabold text-violet-200 bg-violet-850 px-2 py-0.5 rounded border border-violet-700/60">{item.netTier}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-[10px] text-violet-300 bg-violet-900/30 p-2.5 rounded border border-violet-800/30 font-semibold leading-normal">
                          💡 Calculated by matching official national rules for IRPP brackets, CAC surtax, and CNPS statutory caps.
                        </div>
                      </div>
                    )}

                    {/* HR Directory View */}
                    {feat.id === "hr" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
                          <span className="text-xs font-bold text-white">Digital Personnel Files</span>
                          <span className="text-[9px] font-mono text-violet-300">Contracts active</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { name: "Marie-Louise Ndongo", role: "Sales Specialist", type: "CDI", start: "Recent Cycle", pct: "Full Time" },
                            { name: "Guy-Alain Bedimo", role: "Network Architect", type: "CDD (Temp)", start: "Active Cycle", pct: "Part Time" }
                          ].map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-violet-900/45 hover:bg-violet-900/60 rounded border border-violet-800/40 text-xs">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-violet-800 text-violet-200 flex items-center justify-center font-bold text-xs">{emp.name[0]}</div>
                                <div>
                                  <span className="font-bold text-white block">{emp.name}</span>
                                  <span className="text-[10px] text-violet-300">{emp.role} • Joined {emp.start}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] bg-violet-950/40 border border-violet-800 px-2 py-0.5 rounded font-bold text-violet-300">{emp.type}</span>
                                <span className="font-mono font-bold text-violet-200">{emp.pct}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Salary Advances View */}
                    {feat.id === "finance" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-3">
                          <span className="text-xs font-bold text-white">Earned Wage Liquidity Terminal</span>
                          <span className="text-[9px] text-violet-300 font-bold bg-violet-900/50 px-2 py-0.5 rounded font-mono border border-violet-850/50">ORANGE MONEY / MOMO SYNC</span>
                        </div>
                        <div className="space-y-2 bg-violet-900/45 p-3.5 rounded-xl border border-violet-800/40 text-xs">
                          <div className="flex justify-between items-center border-b border-violet-800/50 pb-1.5 font-bold text-[10px] text-violet-300 uppercase tracking-wider">
                            <span>Accrued Period</span>
                            <span>Eligible Advance</span>
                            <span>Disbursed</span>
                          </div>
                          {[
                            { period: "Initial Cycle Accrued", eligible: "Standard Limit Authorized", disbursed: "Instant Mobile Pay" },
                            { period: "Mid Cycle Accrued", eligible: "Elevated Limit Authorized", disbursed: "Instant Mobile Pay" },
                            { period: "End Cycle Accrued", eligible: "Maximum Limit Authorized", disbursed: "Instant Mobile Pay" }
                          ].map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1 text-violet-100">
                              <span className="font-medium text-[11px]">{item.period}</span>
                              <span className="font-mono font-bold text-violet-100 text-[11px] bg-violet-950/40 border border-violet-800 px-1.5 py-0.5 rounded">{item.eligible}</span>
                              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/45 border border-indigo-900/50 px-1.5 py-0.5 rounded font-bold">✓ {item.disbursed}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-[10px] text-violet-300 bg-violet-900/30 p-2.5 rounded border border-violet-800/30 font-semibold leading-normal">
                          💡 Employees draw down interest-free funds automatically reconciled with month-end payroll deduction.
                        </div>
                      </div>
                    )}

                    {/* General Ledger View */}
                    {feat.id === "accounting" && (
                      <div className="space-y-4 border border-violet-800/60 rounded-xl p-4 bg-violet-900/40 shadow-sm">
                        <div className="flex items-center justify-between border-b border-violet-800/50 pb-2">
                          <span className="text-xs font-bold text-white">OHADA Ledger Balance Map</span>
                          <span className="text-[10px] text-violet-300 font-mono font-bold uppercase">SYSCOHADA Standard</span>
                        </div>
                        <p className="text-[10px] text-violet-200 leading-normal">
                          Statutory double-entry distribution mapped automatically to OHADA categories.
                        </p>
                        <div className="space-y-2.5">
                          {[
                            { code: "661100", label: "Personnel Wages", val: 68, color: "bg-violet-500" },
                            { code: "443100", label: "State IRPP Taxes", val: 11, color: "bg-indigo-400" },
                            { code: "444100", label: "CNPS Social Debt", val: 18, color: "bg-violet-400" },
                            { code: "443200", label: "Communal Levies", val: 3, color: "bg-violet-600" }
                          ].map((item, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-bold text-violet-100">
                                <span className="font-mono text-violet-300">{item.code} • {item.label}</span>
                                <span className="font-mono text-violet-200">{item.val}%</span>
                              </div>
                              <div className="w-full bg-violet-950/50 h-1.5 rounded-full overflow-hidden">
                                <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px] bg-violet-950/40 p-2 rounded border border-violet-800/50 text-white font-bold mt-2">
                          <span>Automatic Trial Balance Status</span>
                          <span className="text-[#a78bfa] font-mono">✓ 100% Balanced</span>
                        </div>
                      </div>
                    )}

                    {/* Shift Schedule view */}
                    {feat.id === "time" && (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-2">
                          <span className="font-bold text-white">Workforce Attendance Audit</span>
                          <span className="text-[9px] bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded font-bold font-mono border border-violet-850/50">Roster active</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { name: "Alain Ngando", shift: "Standard Morning Shift", clockIn: "Early Entry", status: "On-Time", badgeColor: "bg-violet-950/40 text-violet-200 border border-violet-800" },
                            { name: "Sylvie Fokou", shift: "Standard Morning Shift", clockIn: "Late Entry", status: "Late Entry (Grace Period)", badgeColor: "bg-violet-950/20 text-violet-300 border border-violet-900" }
                          ].map((item, i) => (
                            <div key={i} className="p-3 bg-violet-900/45 border border-violet-800/40 rounded flex items-center justify-between">
                              <div>
                                <span className="font-bold text-white block">{item.name}</span>
                                <span className="text-[10px] text-violet-300">{item.shift}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-violet-200 block">{item.clockIn}</span>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${item.badgeColor}`}>{item.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analytics View */}
                    {feat.id === "analytics" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-2">
                          <span className="text-xs font-bold text-white">Monthly Compensation Run Metrics</span>
                          <span className="text-[10px] text-violet-300 font-mono">12-Month Curve</span>
                        </div>
                        <div className="h-32 flex items-end justify-between gap-2.5 pt-4">
                          {[
                            { month: "Jan", val: 40 },
                            { month: "Feb", val: 48 },
                            { month: "Mar", val: 56 },
                            { month: "Apr", val: 64 },
                            { month: "May", val: 60 },
                            { month: "Jun", val: 78 },
                            { month: "Jul", val: 85 }
                          ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                              <div className="w-full bg-violet-400/40 rounded-t hover:bg-violet-300/70 transition-colors relative group" style={{ height: `${bar.val}%` }}>
                                <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono z-10 pointer-events-none">
                                  {i % 2 === 0 ? "Audited" : "Balanced"}
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-violet-300">{bar.month}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Document Vault View */}
                    {feat.id === "docs" && (
                      <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-2">
                          <span className="font-bold text-white">Regulatory Contract Storage</span>
                          <span className="text-[9px] bg-violet-900/50 text-violet-300 px-2 py-0.5 rounded font-bold border border-violet-850/50">AES-256 SIGNED</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { title: "Employment_Agreement_JN_signed.pdf", size: "Standard File", date: "Current Period" },
                            { title: "Statutory_CNPS_Declaration_Q2.pdf", size: "Standard File", date: "Current Period" }
                          ].map((doc, idx) => (
                            <div key={idx} className="p-3 bg-violet-900/45 hover:bg-violet-900/60 rounded border border-violet-800/40 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <FileText className="h-4.5 w-4.5 text-violet-300" />
                                <div>
                                  <span className="font-bold text-white block truncate max-w-[200px]">{doc.title}</span>
                                  <span className="text-[10px] text-violet-300">{doc.size} • Uploaded {doc.date}</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono text-violet-200 bg-violet-950/40 border border-violet-800 px-2 py-0.5 rounded font-bold">VERIFIED</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Security Permissions View */}
                    {feat.id === "security" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-violet-900/50 pb-2">
                          <span className="text-xs font-bold text-white">Role-Based Access Matrix</span>
                          <span className="text-[9px] text-violet-300 font-bold bg-violet-900/50 px-2 py-0.5 rounded border border-violet-850/50">Isolated Tenant</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          {[
                            { role: "Executive Owner", desc: "Full root access & multi-company settings", auth: "All nodes" },
                            { role: "HR Manager", desc: "Process monthly payroll & contract records", auth: "Payroll only" }
                          ].map((item, i) => (
                            <div key={i} className="p-3 bg-violet-900/45 border border-violet-800/40 rounded flex items-center justify-between">
                              <div>
                                <span className="font-bold text-white block">{item.role}</span>
                                <span className="text-[10px] text-violet-300">{item.desc}</span>
                              </div>
                              <span className="text-[10px] bg-violet-700 text-white px-2 py-0.5 rounded-full font-bold">{item.auth}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Compliance Detailed Highlights Section */}
      <section id="compliance" className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-slate-900 leading-tight">
              Flawless OHADA auditing <br /> and local labor compliance.
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm font-semibold leading-relaxed">
              Managing payroll inside the CEMAC and OHADA region requires navigating unique legal calculations. Jefara was constructed specifically to automate these regional complexities effortlessly.
            </p>
            <div className="space-y-3 pt-2">
              {[
                "Statutory CNPS employer contributions calculated with custom caps.",
                "Impôt sur le Revenu des Personnes Physiques (IRPP) tax brackets automated.",
                "Custom allowances (logement, transport) processed inside compliant scopes.",
                "Electronic double-signature validation work streams for final audits."
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-750 font-medium">
                  <CheckCircle2 className="h-4.5 w-4.5 text-violet-500 shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-xl p-8 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-violet-100/20 to-transparent blur-xl pointer-events-none" />
            
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Regulatory Verified</h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Our database systems and calculator scripts are audited regularly by regional financial attorneys to secure total alignment with OHADA changes.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-violet-50 text-[#7c3aed] flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Direct Bank Filing</h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Download pre-compiled corporate bank transfer templates. Compatible with Afriland, UBA, SG, BGFI, and Ecobank direct batch networks.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <Percent className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Automated Taxes</h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Generate localized compliance summaries for CNPS, Crise, and local municipal councils automatically. Reduce auditing fatigue from days to seconds.
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-lg space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                <FileCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Cryptographic Slips</h4>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Every payroll run distributes cryptographically signed PDF payslips directly to employee accounts with secure QR verifications.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Dedicated Financial Services Section */}
      <section id="financial" className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
        {/* Subtle glow assets - light-themed */}
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight text-slate-900">
                Payroll-Linked <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] to-[#5b21b6]">Financial Services.</span>
              </h2>
              <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                Empower your workforce with on-demand liquidity, credit, and savings programs built directly into their payroll. Jefara bridges the gap between labor and instant financial access, boosting retention and reducing absenteeism.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Salary Advances",
                    desc: "Allow staff to access up to 50% of their accrued earnings instantly before payday, disbursed straight to Mobile Money."
                  },
                  {
                    title: "Employee Loans",
                    desc: "Offer structured, low-interest emergency credit with pre-calculated repayment limits protecting employee take-home pay."
                  },
                  {
                    title: "Group Insurance & Micro-Savings",
                    desc: "Partner with local providers to offer health coverage and automatic salary deduction savings directly from the dashboard."
                  },
                  {
                    title: "Payroll-Linked Repayment",
                    desc: "Repayments are completely automated at source during payroll runs. Zero collections required, zero default risk."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-violet-50 border border-violet-100 text-[#7c3aed] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-[#7c3aed]/15"
                >
                  Partner With Jefara
                </button>
                <a
                  href="#solutions"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors py-3"
                >
                  Explore Platform <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Right Interactive Simulator Column */}
            <div className="lg:col-span-7 bg-violet-950 border border-violet-900/60 rounded-3xl p-6 md:p-8 shadow-sm relative">
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-violet-300">JEFARA CORE API</span>
              </div>

              {/* Sub-product Selector Tabs */}
              <div className="flex border-b border-violet-900/60 pb-4 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
                {[
                  { id: 'advance' as const, label: 'Salary Advance' },
                  { id: 'loan' as const, label: 'Employee Loan' },
                  { id: 'insurance' as const, label: 'Micro-Insurance' },
                  { id: 'savings' as const, label: 'Savings Programs' }
                ].map((t) => {
                  const isActive = financialTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setFinancialTab(t.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/20"
                          : "text-violet-300 hover:text-white bg-violet-900/40 hover:bg-violet-900/60 border border-violet-800/40"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Screen */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={financialTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  
                  {/* SALARY ADVANCE SCREEN */}
                  {financialTab === 'advance' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-violet-400 font-bold block">DISBURSEMENT TERMINAL</span>
                          <h3 className="text-base font-bold text-white mt-0.5">Accrued Wage On-Demand</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-violet-200 bg-violet-900/50 px-2 py-0.5 rounded border border-violet-800/50">
                          MTN / ORANGE DISBURSE
                        </span>
                      </div>

                      <div className="bg-violet-900/40 p-4 rounded-xl border border-violet-800/40 space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-violet-300">Accrued (Earned) Salary This Month:</span>
                          <span className="font-mono font-bold text-white">Standard Employee Accrued</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pb-2 border-b border-violet-800/40">
                          <span className="text-violet-300">Max Allowed Advance:</span>
                          <span className="font-mono font-bold text-white">Statutory Threshold Limit</span>
                        </div>
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider block">Available Pre-approved Options</span>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                              { label: "Emergency", amt: 30000, amtLabel: "Tier A Approved", feeLabel: "Nominal" },
                              { label: "Standard", amt: 80000, amtLabel: "Tier B Approved", feeLabel: "Nominal" },
                              { label: "Max Limit", amt: 140000, amtLabel: "Tier C Approved", feeLabel: "Nominal" }
                            ].map((tier, idx) => (
                              <button 
                                key={idx} 
                                type="button"
                                onClick={() => setFinancialAdvance(tier.amt)}
                                className={`p-2.5 rounded-xl text-center flex flex-col justify-between transition-all cursor-pointer ${financialAdvance === tier.amt ? 'bg-violet-800 border border-violet-600 text-white' : 'bg-violet-950/40 hover:bg-violet-900/60 border border-violet-800/40 text-violet-300'}`}
                              >
                                <span className={`text-[9px] font-bold block ${financialAdvance === tier.amt ? 'text-violet-200' : 'text-violet-400'}`}>{tier.label}</span>
                                <span className="font-mono font-bold text-white mt-1 block">{tier.amtLabel}</span>
                                <span className="text-[9px] text-violet-400 mt-1 block font-mono">Fee: {tier.feeLabel}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-violet-900/40 p-3 rounded-lg border border-violet-800/40 text-center shadow-sm">
                          <span className="text-[9px] text-violet-300 uppercase font-mono block">Processing Fee</span>
                          <span className="font-mono text-xs font-bold text-white">Standard Flat Fee</span>
                        </div>
                        <div className="bg-violet-900/40 p-3 rounded-lg border border-violet-800/40 text-center shadow-sm">
                          <span className="text-[9px] text-violet-300 uppercase font-mono block">Repayment Date</span>
                          <span className="font-mono text-xs font-bold text-violet-200">Next Payday</span>
                        </div>
                      </div>

                      <div className="bg-violet-900/50 border border-violet-800/60 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Wallet className="h-5 w-5 text-violet-300" />
                          <div className="text-left">
                            <span className="text-[10px] text-violet-300 block font-semibold">Immediate MoMo Cash Out</span>
                            <span className="text-[11px] font-bold text-violet-200">Approved Advance Disbursed</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsDemoModalOpen(true)}
                          className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Send Instantly
                        </button>
                      </div>
                    </div>
                  )}

                  {/* EMPLOYEE LOAN SCREEN */}
                  {financialTab === 'loan' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-violet-400 font-bold block">AMORTIZATION SIMULATOR</span>
                          <h3 className="text-base font-bold text-white mt-0.5">Low-Cost Workplace Credit</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-violet-200 bg-violet-900/50 px-2 py-0.5 rounded border border-violet-800/50">
                          PAYROLL DEDUCTED
                        </span>
                      </div>

                      <div className="bg-violet-900/40 p-4 rounded-xl border border-violet-800/40 space-y-3 shadow-sm">
                        <span className="text-[10px] font-mono text-violet-300 font-bold uppercase tracking-wider block font-semibold">Standard Corporate Credit Tiers</span>
                        <div className="space-y-2">
                          {[
                            { name: "Micro-Credit Assistance", principalLabel: "Tier A Principal", termLabel: "Short Term Cycle", monthlyLabel: "Installment Tier 1" },
                            { name: "Equipment Purchase Support", principalLabel: "Tier B Principal", termLabel: "Medium Term Cycle", monthlyLabel: "Installment Tier 2" },
                            { name: "Relocation Assistance", principalLabel: "Tier C Principal", termLabel: "Medium Term Cycle", monthlyLabel: "Installment Tier 3" }
                          ].map((loan, idx) => {
                            const isSelected = (financialLoan === 500000 && loan.name === "Micro-Credit Assistance") || (financialLoan === 1000000 && loan.name === "Equipment Purchase Support") || (financialLoan === 2000000 && loan.name === "Relocation Assistance");
                            return (
                              <button 
                                key={idx} 
                                type="button"
                                onClick={() => { setFinancialLoan(loan.name === "Micro-Credit Assistance" ? 500000 : loan.name === "Equipment Purchase Support" ? 1000000 : 2000000); }}
                                className={`w-full p-3 rounded-xl border flex justify-between items-center text-xs transition-colors text-left ${isSelected ? 'bg-violet-800 border-violet-500' : 'bg-violet-950/40 border-violet-850/60 hover:bg-violet-900/60'}`}
                              >
                                <div>
                                  <span className="font-bold text-white block">{loan.name}</span>
                                  <div className="flex items-center gap-2 text-[10px] text-violet-300 mt-0.5 font-mono">
                                    <span>Principal: {loan.principalLabel}</span>
                                    <span>•</span>
                                    <span>Term: {loan.termLabel}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-violet-300 block font-medium">Monthly Installment</span>
                                  <span className="font-mono font-extrabold text-violet-200">{loan.monthlyLabel}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-[10px] text-violet-300 leading-relaxed bg-violet-900/30 p-3 rounded-lg border border-violet-800/40 shadow-sm">
                        💡 repayment installments are deducted seamlessly at the end of every month. No manual bank runs, completely stress-free collection.
                      </div>
                    </div>
                  )}

                  {/* MICRO INSURANCE SCREEN */}
                  {financialTab === 'insurance' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-violet-400 font-bold block">CORPORATE PACKS</span>
                          <h3 className="text-base font-bold text-white mt-0.5">Workforce Micro-Insurance Plans</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-violet-300 uppercase tracking-widest">
                          PARTNER NETWORKS
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-violet-900/40 p-4 rounded-xl border border-violet-800/40 space-y-3 flex flex-col justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-violet-300 uppercase tracking-widest block">POPULAR</span>
                            <h4 className="text-xs font-bold text-white mt-2">Health & Family Cover</h4>
                            <p className="text-[10px] text-violet-300 mt-1 leading-relaxed">
                              Provides 80% reimbursement for consultation, emergency room visits, and pharmacy medications across partnered regional clinics.
                            </p>
                          </div>
                          <div className="flex justify-between items-center border-t border-violet-800/40 pt-3 text-xs">
                            <span className="text-violet-300">Premium / Employee</span>
                            <span className="font-mono font-bold text-violet-200">Standard Monthly Contribution</span>
                          </div>
                        </div>

                        <div className="bg-violet-900/40 p-4 rounded-xl border border-violet-800/40 space-y-3 flex flex-col justify-between shadow-sm">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest block">ESSENTIAL</span>
                            <h4 className="text-xs font-bold text-white mt-2">Accidental & Critical Care</h4>
                            <p className="text-[10px] text-violet-300 mt-1 leading-relaxed">
                              Instant financial cushion covering workplace injuries, transport accidents, and unexpected intensive treatment costs.
                            </p>
                          </div>
                          <div className="flex justify-between items-center border-t border-violet-800/40 pt-3 text-xs">
                            <span className="text-violet-300">Premium / Employee</span>
                            <span className="font-mono font-bold text-violet-200">Essential Monthly Contribution</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-violet-900/40 p-3.5 rounded-xl border border-violet-800/40 flex justify-between items-center text-xs shadow-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-violet-300" />
                          <span className="text-white">Zero-Paperwork Onboarding</span>
                        </div>
                        <span className="text-[10px] text-violet-300">Billed directly into payroll</span>
                      </div>
                    </div>
                  )}

                  {/* SAVINGS PROGRAMS SCREEN */}
                  {financialTab === 'savings' && (
                    <div className="space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-violet-400 font-bold block">SAVINGS MATCHING</span>
                          <h3 className="text-base font-bold text-white mt-0.5">Automated Salary-Linked Savings</h3>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-violet-200 bg-violet-900/50 px-2 py-0.5 rounded border border-violet-800/50">
                          100% CAPITAL PROTECTED
                        </span>
                      </div>

                      <div className="bg-violet-900/40 p-4 rounded-xl border border-violet-800/40 space-y-3 shadow-sm">
                        <span className="text-[10px] font-mono text-violet-300 font-bold uppercase tracking-wider block font-semibold">Pre-configured Corporate Savings Tiers</span>
                        <div className="space-y-2">
                          {[
                            { plan: "Bronze (Starter)", deduction: 3, deductionLabel: "Bronze Plan Deduction", matchingLabel: "Standard Match", text: "Ideal for fresh graduates starting their career." },
                            { plan: "Silver (Standard)", deduction: 8, deductionLabel: "Silver Plan Deduction", matchingLabel: "Elevated Match", text: "Most popular matching strategy across enterprises." },
                            { plan: "Gold (Premier)", deduction: 15, deductionLabel: "Gold Plan Deduction", matchingLabel: "Maximum Match", text: "High retention plan for executive management." }
                          ].map((tier, idx) => (
                            <button 
                              key={idx} 
                              type="button"
                              onClick={() => setFinancialSavingsPercent(tier.deduction)}
                              className={`w-full p-3 rounded-xl border flex justify-between items-center text-xs transition-colors text-left ${financialSavingsPercent === tier.deduction ? 'bg-violet-800 border-violet-500' : 'bg-violet-950/40 border-violet-850/60 hover:bg-violet-900/60'}`}
                            >
                              <div>
                                <span className="font-bold text-white block">{tier.plan}</span>
                                <p className="text-[10px] text-violet-300 mt-0.5 leading-snug">{tier.text}</p>
                              </div>
                              <div className="text-right whitespace-nowrap pl-4 font-mono">
                                <span className="font-bold text-white block">{tier.deductionLabel}</span>
                                <span className="text-[10px] text-violet-200 bg-violet-950/40 border border-violet-800 px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block">{tier.matchingLabel}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-violet-900/40 p-4 rounded-xl border border-violet-800/40 space-y-2 shadow-sm">
                        <div className="flex justify-between text-xs font-bold text-white">
                          <span>* Guaranteed APY Interest Matching</span>
                          <span className="text-violet-200 bg-violet-950/40 border border-violet-800 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">Optimal Growth Yield</span>
                        </div>
                        <p className="text-[10px] text-violet-300 leading-normal">
                          By matching custom company policies, employers can automatically top-up or match employee savings balances, reinforcing long-term career loyalty.
                        </p>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </div>

          </div>
        </div>
      </section>

      {/* Expandable Accordion FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center space-y-4 mb-14">
          <h2 className="text-3xl font-display font-black tracking-tight text-slate-900">
            Answers to your compliance queries.
          </h2>
          <p className="text-slate-750 text-xs sm:text-sm font-semibold">
            Have queries regarding calculations, bulk migrations, or database privacy? Read below.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = faqOpenIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white border border-slate-100 rounded-lg overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                  className="w-full px-5 py-4 flex items-center justify-between font-bold text-left text-slate-800 text-sm hover:bg-slate-50 transition-colors focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-700 leading-relaxed font-medium border-t border-slate-50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Block */}
      <section className="py-20 max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-8 sm:p-12 md:p-16 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-40 w-40 bg-[#7c3aed]/5 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 h-40 w-40 bg-violet-500/5 blur-2xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            Ready to completely automate <br /> your corporate payroll flow?
          </h2>
          <p className="text-slate-700 text-xs sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
            Create an isolated secure account, seed setup data to inspect the dashboard, or connect with our accounting specialists to transition your records seamlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs px-8 py-3.5 rounded-lg shadow-sm shadow-[#7c3aed]/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              Book a Demo
            </button>
            <button 
              onClick={onSignIn}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-8 py-3.5 rounded-lg border border-slate-200 transition-all active:scale-[0.98] cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </section>

      {/* Elegant Saas Footer */}
      <footer className="border-t border-slate-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center shadow-sm">
                <Logo size={16} className="text-white" />
              </div>
              <span className="font-display font-extrabold text-base tracking-tight text-slate-900">Jefara</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs">
              Jefara is the leading premium HR and Payroll platform designed natively for Central and West African enterprises operating within OHADA legal matrices.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="space-y-3.5">
            <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Platform</h5>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Automated Payroll</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Employee Directory</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Salary Advances</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">General Ledger</span>
            </div>
          </div>

          {/* Links Col 2 */}
          <div className="space-y-3.5">
            <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Compliance</h5>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
              <span className="hover:text-slate-900 transition-colors cursor-pointer">OHADA Standards</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">CNPS Declarations</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">IRPP Bracket Calculations</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Labor Law Auditing</span>
            </div>
          </div>

          {/* Links Col 3 */}
          <div className="space-y-3.5">
            <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Company</h5>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
              <span className="hover:text-slate-900 transition-colors cursor-pointer">About Us</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Security Systems</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Contact Support</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer" onClick={onSignIn}>Partner Portal</span>
            </div>
          </div>

        </div>

        {/* Footnote */}
        <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-semibold">
          <span>© 2026 Jefara SAS. All rights reserved. Built for OHADA Compliance.</span>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 transition-colors cursor-pointer">Security Audits</span>
          </div>
        </div>
      </footer>
        </>
      ) : (
        <ProductTourView onBack={() => setShowProductTour(false)} currentLang={currentLang} />
      )}

      {/* Book a Demo Modal */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetDemoForm}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Card content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-slate-100 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative z-10 space-y-5"
            >
              
              <button 
                onClick={resetDemoForm}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="text-center space-y-1.5">
                <div className="h-10 w-10 bg-violet-50 text-[#7c3aed] rounded-lg flex items-center justify-center mx-auto">
                  <Logo size={22} className="text-[#7c3aed]" />
                </div>
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Book Your Demo</h3>
                <p className="text-xs text-slate-700 font-bold">Connect with our payroll specialists to design your compliance workspace.</p>
              </div>

              {redirecting ? (
                <div className="py-8 text-center space-y-4 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="h-12 w-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
                    <Sparkle className="h-5 w-5 text-violet-500 absolute animate-pulse" />
                  </div>
                  <div className="space-y-1.5 max-w-xs mx-auto">
                    <h4 className="font-bold text-slate-900 text-sm">Lead Capture Verified!</h4>
                    <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                      Connecting you to the secure calendar to lock in your scheduled slot...
                    </p>
                  </div>
                </div>
              ) : demoSubmitted ? (
                <div className="py-6 text-center space-y-4">
                  <div className="h-12 w-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">Request Registered!</h4>
                    <p className="text-xs text-slate-700 font-semibold px-2 leading-relaxed">
                      Thank you. A Jefara integration advisor will reach out to <strong>{demoEmail}</strong> within 12 hours to schedule your corporate workspace onboarding.
                    </p>
                  </div>
                  <button 
                    onClick={resetDemoForm}
                    className="w-full bg-[#7c3aed] text-white font-bold py-2.5 rounded-lg text-xs hover:bg-[#6d28d9] transition-all cursor-pointer"
                  >
                    Return to Platform
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookDemoSubmit} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      placeholder="Name"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Corporate Email</label>
                    <input 
                      type="email" 
                      required
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Company Name</label>
                      <input 
                        type="text" 
                        required
                        value={demoCompany}
                        onChange={(e) => setDemoCompany(e.target.value)}
                        placeholder="Company"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Phone Coordinate</label>
                      <input 
                        type="tel" 
                        required
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        placeholder="Phone"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">Total Workforce Size</label>
                    <select 
                      value={demoSize}
                      onChange={(e) => setDemoSize(e.target.value)}
                      className="w-full"
                    >
                      <option value="1-10">Under 10 Employees</option>
                      <option value="10-50">10 to 50 Employees</option>
                      <option value="50-250">50 to 250 Employees</option>
                      <option value="250-1000">250 to 1,000 Employees</option>
                      <option value="1000+">1,000+ Employees (Enterprise Group)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={submittingDemo}
                    className="w-full bg-[#7c3aed] text-white font-bold py-3 rounded-lg text-xs hover:bg-[#6d28d9] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm shadow-[#7c3aed]/15"
                  >
                    {submittingDemo ? "Registering..." : "Confirm Meeting Slot"}
                  </button>

                  <div className="text-[10px] text-slate-400 text-center font-medium leading-normal">
                    🔒 Protected by isolated bank-grade data security protocols. We do not sell or share corporate contact vectors.
                  </div>

                </form>
              )}

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

interface ProductTourViewProps {
  onBack: () => void;
  currentLang: 'EN' | 'FR';
}

function ProductTourView({ onBack, currentLang }: ProductTourViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(15);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHd, setIsHd] = useState(true);

  const slides = [
    {
      title_en: "SYSCOHADA Compliant Payroll",
      title_fr: "Paie conforme au SYSCOHADA",
      desc_en: "Automated calculations of complex regional tax structures including CNPS, IRPP brackets, housing allocations, and local communal taxes.",
      desc_fr: "Calculs automatisés des structures fiscales régionales complexes, y compris la CNPS, les tranches d'IRPP, l'indemnité de logement et la CAC.",
      icon: Receipt,
      bg: "from-[#f5f3ff] to-[#edd9ff]",
      component: () => (
          <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase">OHADA LEDGER GENERATOR</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">AUTO-RECONCILED</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-slate-600">Gross Salary (Salaire Brut):</span>
              <span className="font-bold text-slate-800">Standard Accrual Base</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-600">CNPS Employee Contribution:</span>
              <span className="font-bold text-red-500">Statutorily Retained</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-slate-600">IRPP Tax Bracket Contribution:</span>
              <span className="font-bold text-red-500">Statutorily Retained</span>
            </div>
            <div className="flex justify-between font-mono border-t border-slate-100 pt-2 font-bold">
              <span className="text-slate-700">Net Salary Payable:</span>
              <span className="text-[#7c3aed]">Disbursed Net Base</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title_en: "Cryptographic Contract Signatures",
      title_fr: "Signatures de Contrats Cryptographiques",
      desc_en: "Issue and execute regional employment agreements backed by digital signatures, timestamps, and secure local archiving.",
      desc_fr: "Émettez et exécutez des contrats de travail régionaux appuyés par des signatures numériques, des horodatages et un archivage local sécurisé.",
      icon: FileText,
      bg: "from-[#ecfdf5] to-[#d1fae5]",
      component: () => (
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase">SECURE VAULT SEAL</span>
            <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">SHA-256 ENCRYPTED</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px]">✓</div>
              <div>
                <p className="font-bold text-slate-800">Employer Seal Applied</p>
                <p className="text-[9px] text-slate-600">Jefara SAS Auth Server</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[10px]">✓</div>
              <div>
                <p className="font-bold text-slate-800">Employee Signature Verified</p>
                <p className="text-[9px] text-slate-600">Biometric PIN matching active</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title_en: "Instant Mobile Financial Advances",
      title_fr: "Avances Financières Mobiles Instantanées",
      desc_en: "Give your workforce direct, interest-free access to accrued salaries delivered via MTN Mobile Money or Orange Money directly inside the portal.",
      desc_fr: "Offrez à vos collaborateurs un accès direct et sans intérêt aux salaires accumulés, versés via MTN Mobile Money ou Orange Money directement depuis le portail.",
      icon: Wallet,
      bg: "from-[#fffbeb] to-[#fef3c7]",
      component: () => (
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase">MOBILE DISBURSEMENT GATEWAY</span>
            <span className="text-[9px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded">MTN / ORANGE READY</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 p-2 rounded text-slate-700 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-800">Transfer Request:</span> Authorized salary advance to Orange Money Wallet. Approved instantly based on verified accrued working days.
            </div>
            <div className="flex justify-between font-mono pt-1 text-[10px] font-bold text-indigo-600">
              <span>● DISBURSED SUCCESS</span>
              <span>FULLY SECURE</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title_en: "One-Click Compliance Filing",
      title_fr: "Déclarations de Conformité en un Clic",
      desc_en: "Generate exportable, fully filled official forms for local tax authorities and labor inspectors with pre-mapped structural schemas.",
      desc_fr: "Générez des formulaires officiels exportables et entièrement remplis pour les administrations fiscales locales et les inspecteurs du travail.",
      icon: CheckCircle2,
      bg: "from-[#f0f9ff] to-[#e0f2fe]",
      component: () => (
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-[10px] font-mono text-slate-600 font-bold uppercase">TAX DISPATCH STATION</span>
            <span className="text-[9px] bg-violet-50 text-violet-600 font-bold px-1.5 py-0.5 rounded">OHADA COMPLIANCE TEMPLATE</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
              <span className="text-slate-700">Assembling DISA (Déclaration Individuelle des Salariés)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
              <span className="text-slate-700">CNPS monthly remittance forms ready</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveSlide((prevSlide) => (prevSlide + 1) % slides.length);
            return 0;
          }
          return prev + 1;
        });
      }, 70);
    }
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  const active = slides[activeSlide];
  const ActiveIcon = active.icon;
  const slideTitle = currentLang === 'EN' ? active.title_en : active.title_fr;
  const slideDesc = currentLang === 'EN' ? active.desc_en : active.desc_fr;

  return (
    <div className="pt-28 pb-20 max-w-5xl mx-auto px-6">
      {/* Product Tour Heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold text-[#7c3aed] hover:text-[#6d28d9] transition-colors mb-2 cursor-pointer bg-transparent border-none p-0"
          >
            ← {currentLang === 'EN' ? 'Back to home' : "Retour à l'accueil"}
          </button>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-slate-900">
            {currentLang === 'EN' ? 'Jefara Presentation Walkthrough' : 'Présentation guidée de Jefara'}
          </h1>
          <p className="text-slate-700 text-xs sm:text-sm font-semibold mt-1">
            {currentLang === 'EN' ? "Experience how Jefara SAS transforms enterprise operations within the OHADA legal framework." : "Découvrez comment Jefara SAS transforme les opérations d'entreprise dans le cadre juridique OHADA."}
          </p>
        </div>
        <button 
          onClick={onBack}
          className="self-start md:self-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer"
        >
          {currentLang === 'EN' ? 'Close Tour' : 'Fermer la visite'}
        </button>
      </div>

      {/* Main Interactive Screen Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Mock Player (Left/Center col span 2) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden aspect-video flex flex-col justify-between p-4 sm:p-6 relative text-white">
          
          {/* Top Indicators inside video */}
          <div className="flex items-center justify-between z-10">
            <span className="text-[10px] font-mono tracking-widest bg-white/10 backdrop-blur-md px-2 py-1 rounded font-bold text-slate-300">
              JEFARA PRESENTATION WALKTHROUGH
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-slate-400">SIMULATED Walkthrough</span>
            </div>
          </div>

          {/* Animated Slide Canvas representation */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md text-center space-y-6"
              >
                {/* Visual Icon Badge */}
                <div className={`h-14 w-14 bg-gradient-to-tr ${active.bg} text-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto shadow-md`}>
                  <ActiveIcon className="h-7 w-7" />
                </div>
                
                {/* Dynamic mini-app visual element */}
                <div className="max-w-xs mx-auto text-slate-900">
                  {active.component()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Player Overlay Controls */}
          <div className="space-y-3 z-10 mt-auto bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2 rounded-xl">
            
            {/* Scrubber Progress Bar */}
            <div className="relative h-1 w-full bg-white/20 rounded-full overflow-hidden cursor-pointer">
              <div 
                className="absolute top-0 left-0 h-full bg-[#7c3aed] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <span className="flex items-center gap-1 font-mono text-[10px]">❚❚ PAUSE</span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[10px]">▶ PLAY</span>
                  )}
                </button>
                <div className="text-[10px] font-mono text-slate-400">
                  {`0:${activeSlide.toString().padStart(2, '0')}`} / 0:04
                </div>
              </div>

              {/* Subtitles Overlay */}
              <div className="max-w-[50%] text-center text-[10px] text-slate-200 line-clamp-1 italic px-2 bg-black/40 rounded py-0.5">
                {slideTitle}
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition-colors cursor-pointer text-[10px] font-mono"
                >
                  {isMuted ? "🔇 MUTED" : "🔊 AUDIO"}
                </button>
                <button 
                  onClick={() => setIsHd(!isHd)}
                  className={`hover:text-white transition-colors cursor-pointer text-[9px] font-bold border px-1 rounded ${isHd ? 'border-[#7c3aed] text-[#7c3aed]' : 'border-slate-700/60 text-slate-400'}`}
                >
                  HD
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Text descriptions sidebar (Right col 1) */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-mono text-[10px] font-bold text-[#7c3aed] uppercase tracking-wider">
              {currentLang === 'EN' ? 'CHAPTER' : 'CHAPITRE'} {activeSlide + 1} OF {slides.length}
            </h3>
            
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {slideTitle}
            </h2>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {slideDesc}
            </p>

            {/* Quick Navigation Dots */}
            <div className="flex gap-2 pt-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSlide(idx);
                    setProgress(0);
                  }}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${activeSlide === idx ? 'w-6 bg-[#7c3aed]' : 'w-2.5 bg-slate-200 hover:bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50/50 to-indigo-50/30 p-5 rounded-2xl border border-violet-100/50 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">
              {currentLang === 'EN' ? 'Want to test Jefara live?' : 'Vous souhaitez tester Jefara en direct ?'}
            </h4>
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {currentLang === 'EN' ? 'Sign in to access your secure enterprise workspace playground.' : 'Connectez-vous pour accéder à votre espace de travail de test sécurisé.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
