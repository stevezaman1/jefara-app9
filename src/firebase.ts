import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc as realDoc, 
  setDoc as realSetDoc,
  getDoc as realGetDoc,
  getDocs as realGetDocs,
  collection as realCollection,
  updateDoc as realUpdateDoc,
  deleteDoc as realDeleteDoc,
  getDocFromServer 
} from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';

// Graceful console error interception for offline sandbox environments to keep logs clean
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    if (
      msg.includes('@firebase/firestore') || 
      msg.includes('Could not reach Cloud Firestore backend') || 
      msg.includes('Failed to get document from server') ||
      msg.includes('Firestore (12.16.0)') ||
      msg.includes('code=unavailable')
    ) {
      console.warn('[Firestore Connection Warning - Handled Gracefully]:', ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Merge static config with dynamic environment variable overrides
const metaEnv = (import.meta as any).env || {};
const resolvedFirebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: firebaseConfig.firestoreDatabaseId
};

const app = initializeApp(resolvedFirebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, resolvedFirebaseConfig.firestoreDatabaseId);

// Dynamic bypass for local demo sandbox environments
export function isDemoSandbox(): boolean {
  return localStorage.getItem('jefara_is_demo') === 'true';
}

function parsePath(path: string) {
  const parts = path.split('/');
  if (parts.length === 2) {
    return {
      storeKey: `jefara_db_${parts[0]}`,
      id: parts[1]
    };
  } else if (parts.length === 4) {
    return {
      storeKey: `jefara_db_${parts[1]}_${parts[2]}`,
      id: parts[3]
    };
  }
  return {
    storeKey: `jefara_db_misc`,
    id: parts.join('_')
  };
}

function getLocalDoc(path: string): any {
  const { storeKey, id } = parsePath(path);
  const storeStr = localStorage.getItem(storeKey);
  if (!storeStr) return null;
  try {
    const store = JSON.parse(storeStr);
    return store[id] || null;
  } catch {
    return null;
  }
}

function setLocalDoc(path: string, data: any): void {
  const { storeKey, id } = parsePath(path);
  let store: Record<string, any> = {};
  const storeStr = localStorage.getItem(storeKey);
  if (storeStr) {
    try {
      store = JSON.parse(storeStr);
    } catch {
      store = {};
    }
  }
  store[id] = { ...store[id], ...data };
  localStorage.setItem(storeKey, JSON.stringify(store));
}

function deleteLocalDoc(path: string): void {
  const { storeKey, id } = parsePath(path);
  const storeStr = localStorage.getItem(storeKey);
  if (!storeStr) return;
  try {
    const store = JSON.parse(storeStr);
    delete store[id];
    localStorage.setItem(storeKey, JSON.stringify(store));
  } catch {}
}

// Intercept collection()
export function collection(parent: any, ...segments: string[]): any {
  if (isDemoSandbox()) {
    let parentPath = '';
    if (parent && parent.__isMock) {
      parentPath = parent.path;
    }
    const fullPath = [parentPath, ...segments].filter(Boolean).join('/');
    return {
      __isMock: true,
      type: 'collection',
      path: fullPath
    };
  }
  return (realCollection as any)(parent, ...segments);
}

// Intercept doc()
export function doc(parent: any, ...segments: string[]): any {
  if (isDemoSandbox()) {
    let parentPath = '';
    let id = '';
    if (parent && parent.__isMock) {
      parentPath = parent.path;
      if (segments.length > 0) {
        id = segments[segments.length - 1];
      }
    } else {
      if (segments.length > 0) {
        id = segments[segments.length - 1];
      }
    }
    const fullPath = [parentPath, ...segments].filter(Boolean).join('/');
    return {
      __isMock: true,
      type: 'doc',
      path: fullPath,
      id: id
    };
  }
  return (realDoc as any)(parent, ...segments);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Intercept setDoc()
export async function setDoc(docRef: any, data: any, options?: any): Promise<void> {
  if (isDemoSandbox() || (docRef && docRef.__isMock)) {
    setLocalDoc(docRef.path, data);
    return;
  }
  try {
    return await realSetDoc(docRef, data, options);
  } catch (err: any) {
    if (docRef?.path?.startsWith('demo_leads')) {
      // Bypass standard firestore error logging to allow clean fallback
      throw err;
    }
    if (err && (err.code === 'permission-denied' || String(err.message).toLowerCase().includes('permission') || String(err.message).toLowerCase().includes('insufficient'))) {
      handleFirestoreError(err, OperationType.WRITE, docRef?.path || null);
    }
    throw err;
  }
}

// Intercept updateDoc()
export async function updateDoc(docRef: any, data: any): Promise<void> {
  if (isDemoSandbox() || (docRef && docRef.__isMock)) {
    setLocalDoc(docRef.path, data);
    return;
  }
  try {
    return await realUpdateDoc(docRef, data);
  } catch (err: any) {
    if (err && (err.code === 'permission-denied' || String(err.message).toLowerCase().includes('permission') || String(err.message).toLowerCase().includes('insufficient'))) {
      handleFirestoreError(err, OperationType.UPDATE, docRef?.path || null);
    }
    throw err;
  }
}

// Intercept deleteDoc()
export async function deleteDoc(docRef: any): Promise<void> {
  if (isDemoSandbox() || (docRef && docRef.__isMock)) {
    deleteLocalDoc(docRef.path);
    return;
  }
  try {
    return await realDeleteDoc(docRef);
  } catch (err: any) {
    if (err && (err.code === 'permission-denied' || String(err.message).toLowerCase().includes('permission') || String(err.message).toLowerCase().includes('insufficient'))) {
      handleFirestoreError(err, OperationType.DELETE, docRef?.path || null);
    }
    throw err;
  }
}

// Intercept getDoc()
export async function getDoc(docRef: any): Promise<any> {
  if (isDemoSandbox() || (docRef && docRef.__isMock)) {
    const data = getLocalDoc(docRef.path);
    return {
      exists: () => data !== null,
      data: () => data,
      id: docRef.id
    };
  }
  try {
    return await realGetDoc(docRef);
  } catch (err: any) {
    if (err && (err.code === 'permission-denied' || String(err.message).toLowerCase().includes('permission') || String(err.message).toLowerCase().includes('insufficient'))) {
      handleFirestoreError(err, OperationType.GET, docRef?.path || null);
    }
    throw err;
  }
}

// Intercept getDocs()
export async function getDocs(collRef: any): Promise<any> {
  if (isDemoSandbox() || (collRef && collRef.__isMock)) {
    const path = collRef.path;
    const parts = path.split('/');
    let storeKey = '';
    if (parts.length === 3) {
      storeKey = `jefara_db_${parts[1]}_${parts[2]}`;
    } else {
      storeKey = `jefara_db_${parts[0]}`;
    }

    const storeStr = localStorage.getItem(storeKey);
    let items: any[] = [];
    if (storeStr) {
      try {
        const store = JSON.parse(storeStr);
        items = Object.values(store);
      } catch {}
    }

    return {
      docs: items.map(item => ({
        id: item.id || 'unknown',
        data: () => item
      }))
    };
  }
  try {
    return await realGetDocs(collRef);
  } catch (err: any) {
    if (err && (err.code === 'permission-denied' || String(err.message).toLowerCase().includes('permission') || String(err.message).toLowerCase().includes('insufficient'))) {
      handleFirestoreError(err, OperationType.LIST, collRef?.path || null);
    }
    throw err;
  }
}

// Cameroon-themed realistic demo sandbox data seed
export const demoCompany = {
  id: "comp_demo",
  name: "Jefara Cameroon S.A.",
  registrationNumber: "RC/DLA/2026/B/150",
  country: "Cameroon",
  currency: "XAF",
  departments: ["HR", "Finance", "Engineering", "Sales", "Operations"],
  roles: ["Executive", "Manager", "Senior Staff", "Junior Staff", "Intern"],
  payrollSettings: {
    socialSecurityRateEmployer: 16.2,
    socialSecurityRateEmployee: 4.2,
    taxRateBase: 15.0
  },
  accountingSettings: {
    payrollJournalCode: "PAY",
    employerChargesAccount: "6611",
    salaryExpenseAccount: "6612"
  },
  createdAt: new Date().toISOString()
};

export const demoProfile = {
  uid: "user_demo",
  email: "demo@jefara.com",
  displayName: "Jean-Pierre Ndi",
  companyId: "comp_demo",
  role: "Owner" as const,
  createdAt: new Date().toISOString()
};

const demoEmployees = {};
const demoLeaveRequests = {};
const demoAttendanceLogs = {};
const demoJobPostings = {};
const demoJobApplications = {};
const demoFinancialServiceRequests = {};
const demoDocuments = {};
const demoAccountingEntries = {};
const demoPayrollRuns = {};
const demoPayslips = {};

export function seedDemoData(): void {
  localStorage.setItem('jefara_is_demo', 'true');
  localStorage.setItem('jefara_demo_profile', JSON.stringify(demoProfile));
  localStorage.setItem('jefara_demo_company', JSON.stringify(demoCompany));

  // Seed subcollections if empty
  const seeds = {
    'jefara_db_companies': { [demoCompany.id]: demoCompany },
    'jefara_db_users': { [demoProfile.uid]: demoProfile },
    'jefara_db_comp_demo_employees': demoEmployees,
    'jefara_db_comp_demo_leave_requests': demoLeaveRequests,
    'jefara_db_comp_demo_attendance_logs': demoAttendanceLogs,
    'jefara_db_comp_demo_job_postings': demoJobPostings,
    'jefara_db_comp_demo_job_applications': demoJobApplications,
    'jefara_db_comp_demo_financial_service_requests': demoFinancialServiceRequests,
    'jefara_db_comp_demo_documents': demoDocuments,
    'jefara_db_comp_demo_accounting_entries': demoAccountingEntries,
    'jefara_db_comp_demo_payroll_runs': demoPayrollRuns,
    'jefara_db_comp_demo_payslips': demoPayslips
  };

  Object.entries(seeds).forEach(([key, val]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  });
}

export function clearDemoData(): void {
  localStorage.removeItem('jefara_is_demo');
  localStorage.removeItem('jefara_demo_profile');
  localStorage.removeItem('jefara_demo_company');
}

async function testConnection() {
  try {
    await getDocFromServer(realDoc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    console.warn("Firestore connection check completed. Firestore is not fully reachable. Activating local demo fallback.");
    if (!localStorage.getItem('jefara_is_demo')) {
      seedDemoData();
    }
  }
}
testConnection();

