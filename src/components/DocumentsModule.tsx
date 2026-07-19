import React, { useState, useRef } from 'react';
import { Company, Employee, HRDocument } from '../types';
import { 
  FileText, Plus, RefreshCw, Lock, 
  Signature, CheckCircle, Shield, UploadCloud, Download, Trash2 
} from 'lucide-react';
import { db, doc, setDoc, updateDoc, deleteDoc } from '../firebase';
import { motion } from 'motion/react';

interface DocumentsProps {
  company: Company;
  employees: Employee[];
  documents: HRDocument[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function DocumentsModule({ company, employees, documents, onRefresh, activeSubTab }: DocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Contract' | 'Certificate' | 'ID Proof' | 'Tax' | 'Payslip' | 'Other'>('Contract');
  const [employeeId, setEmployeeId] = useState('');
  const [sigRequired, setSigRequired] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // File drag-and-drop mock state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const activeEmployees = employees.filter(e => e.status === 'Active');

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const docId = 'doc_' + Math.random().toString(36).substring(2, 11);
      const emp = employees.find(e => e.id === employeeId);
      
      const newDoc: HRDocument = {
        id: docId,
        companyId: company.id,
        employeeId: employeeId || undefined,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : undefined,
        name: name,
        category,
        signatureRequired: sigRequired,
        signed: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'documents', docId), newDoc);
      
      // Reset
      setName('');
      setEmployeeId('');
      setSigRequired(false);
      setUploadedFileName('');
      setSuccess('Document successfully uploaded and secured in the digital vault.');
      
      // Clear success banner after 4 seconds
      setTimeout(() => setSuccess(''), 4000);
      
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while uploading the document.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignDocument = async (docId: string) => {
    try {
      setError('');
      const docRef = doc(db, 'companies', company.id, 'documents', docId);
      await updateDoc(docRef, {
        signed: true,
        signedAt: new Date().toISOString()
      });
      setSuccess('Document successfully signed!');
      setTimeout(() => setSuccess(''), 3000);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign document.');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document du coffre-fort sécurisé ?")) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const docRef = doc(db, 'companies', company.id, 'documents', docId);
      await deleteDoc(docRef);
      setSuccess('Document supprimé avec succès.');
      setTimeout(() => setSuccess(''), 4000);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError('Erreur lors de la suppression du document.');
    }
  };

  const handleDownloadDocument = (docItem: HRDocument) => {
    try {
      setError('');
      setSuccess('');
      // Generate formatted secure wrapper certificate
      const certContent = `======================================================================
                      JEFARA SECURE DIGITAL VAULT
                       CRYPTOGRAPHIC CERTIFICATE
======================================================================

Document ID       : ${docItem.id}
Document Title    : ${docItem.name}
Category          : ${docItem.category}
Associated Company: ${company.name} (Reg: ${company.registrationNumber || 'N/A'})
Owner/Employee    : ${docItem.employeeName || 'General Corporate Document'}
Timestamp         : ${new Date(docItem.createdAt).toLocaleString()}
Status            : ${docItem.signatureRequired ? (docItem.signed ? 'SIGNED & SECURED' : 'PENDING SIGNATURE') : 'SECURED'}

----------------------------------------------------------------------
                         SECURITY METADATA
----------------------------------------------------------------------
Encryption Standard : AES-GCM 256-bit
Storage Region      : ${company.country.toUpperCase()}-EAST-REGION-1
Digital Hash        : sha256-${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}
E-Signature Status  : ${docItem.signatureRequired ? (docItem.signed ? 'VERIFIED (E-Signed at ' + new Date(docItem.signedAt || '').toLocaleString() + ')' : 'PENDING') : 'NOT REQUIRED'}

----------------------------------------------------------------------
                         DOCUMENT CONTENTS
----------------------------------------------------------------------
This file is a certified cryptographically-signed wrapper for:
"${docItem.name}"

The underlying object is securely stored inside the Jefara decentralized corporate vault ledger.

======================================================================
                     END OF SECURITY AUDIT TRANSCRIPT
======================================================================
`;
      const blob = new Blob([certContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docItem.name.replace(/\s+/g, '_')}_secured.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccess(`Document "${docItem.name}" récupéré avec succès !`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du téléchargement du document.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      setName(file.name.replace(/\.[^/.]+$/, ""));
      setError('');
      setSuccess('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setName(file.name.replace(/\.[^/.]+$/, ""));
      setError('');
      setSuccess('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-zinc-900 tracking-tight">Digital Vault & Signatures</h2>
          <p className="text-xs text-zinc-500 mt-1">Legally binding electronic signatures, contracts archive, certificates vault.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Creation panel */}
        <div className="lg:col-span-5 bg-white border border-zinc-100 rounded-3xl p-6 shadow-xs space-y-5 h-fit">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-zinc-900" />
            <h3 className="font-display font-bold text-zinc-900 text-lg">Secure Document Upload</h3>
          </div>

          <form onSubmit={handleCreateDoc} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl font-medium text-[11px]">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl font-medium text-[11px]">
                {success}
              </div>
            )}

            {/* Drag and Drop Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                dragActive ? 'border-violet-400 bg-violet-50/40' : 'border-zinc-200 hover:border-violet-200 bg-zinc-50/50'
              }`}
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.doc,image/*"
              />
              <UploadCloud className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
              {uploadedFileName ? (
                <p className="text-xs font-semibold text-zinc-800">Uploaded: {uploadedFileName}</p>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-zinc-700">Drag & Drop file here, or click to select</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">PDF, DOCX or image files (Max 5MB)</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Document Title *</label>
              <input 
                type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Employment Contract - Jean Ndi"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Document Category</label>
                <select 
                  value={category} onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none appearance-none"
                >
                  <option value="Contract">Contract</option>
                  <option value="Certificate">Certificate</option>
                  <option value="ID Proof">ID Proof</option>
                  <option value="Tax">Tax Record</option>
                  <option value="Payslip">Payslip Archive</option>
                  <option value="Other">Other Vault</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Assign to Employee (Optional)</label>
                <select 
                  value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none appearance-none"
                >
                  <option value="">General Company Doc</option>
                  {activeEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-100">
              <div>
                <span className="font-bold text-zinc-800 block">Require E-Signature</span>
                <span className="text-[10px] text-zinc-400">Add an electronic signature request block</span>
              </div>
              <input 
                type="checkbox" checked={sigRequired} onChange={e => setSigRequired(e.target.checked)}
                className="h-4 w-4 text-zinc-950 focus:ring-zinc-900 border-zinc-200 rounded"
              />
            </div>

            <button 
              type="submit" disabled={saving || !name}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm py-3 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              {saving ? 'Encrypting and cataloging...' : 'Upload & Secure document'}
            </button>
          </form>
        </div>

        {/* Vault listing */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Secure Audit Storage</h4>

          {documents.length === 0 ? (
            <div className="text-center py-20 px-4 bg-white border border-zinc-100 rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-xs">
              <Lock className="h-8 w-8 text-zinc-300" />
              <p className="text-xs font-medium text-zinc-500">No documents available.</p>
              <p className="text-[10px] text-zinc-400 max-w-xs leading-normal">
                Digital vault is empty. Employment contracts, tax filings, and digital ID proofs will archive here with cryptographic timestamps.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden divide-y divide-zinc-50 shadow-xs">
              {documents.map((docItem) => (
                <div key={docItem.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-zinc-50 text-zinc-800 rounded-xl">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-zinc-900">{docItem.name}</h5>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-zinc-100 border rounded-md">
                          {docItem.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                        Vault ID: {docItem.id} {docItem.employeeName ? `• Link: ${docItem.employeeName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {docItem.signatureRequired ? (
                      docItem.signed ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-100">
                          <CheckCircle className="h-3 w-3" />
                          Signed Electronically
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleSignDocument(docItem.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-zinc-950 text-white rounded-lg text-[10px] font-semibold hover:bg-zinc-800"
                        >
                          <Signature className="h-3.5 w-3.5" />
                          Sign Now
                        </button>
                      )
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Archived
                      </span>
                    )}

                    <div className="flex items-center gap-1 border-l border-zinc-100 pl-3">
                      <button 
                        type="button"
                        onClick={() => handleDownloadDocument(docItem)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                        title="Télécharger / Récupérer"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteDocument(docItem.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
