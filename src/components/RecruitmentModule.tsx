import React, { useState } from 'react';
import { Company, JobPosting, JobApplication } from '../types';
import { 
  Plus, Search, RefreshCw, Briefcase, Users, 
  ChevronRight, Calendar, Mail, FileText, CheckCircle2,
  MapPin, PlusCircle, UserPlus, Filter, ClipboardList
} from 'lucide-react';
import { db, doc, setDoc, updateDoc } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface RecruitmentProps {
  company: Company;
  jobPostings: JobPosting[];
  jobApplications: JobApplication[];
  onRefresh: () => void;
  activeSubTab?: string;
}

export default function RecruitmentModule({ company, jobPostings, jobApplications, onRefresh, activeSubTab }: RecruitmentProps) {
  const [subTab, setSubTab] = useState<'jobs' | 'post' | 'candidates'>('jobs');

  React.useEffect(() => {
    if (activeSubTab === 'recruitment-candidates' || activeSubTab === 'recruitment-interviews') {
      setSubTab('candidates');
    } else if (activeSubTab === 'recruitment-onboarding') {
      setSubTab('post');
    } else {
      setSubTab('jobs');
    }
  }, [activeSubTab]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Job creation form
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(company.departments[0] || 'Operations');
  const [location, setLocation] = useState('Douala, Cameroon');
  const [description, setDescription] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [postingSaving, setPostingSaving] = useState(false);

  // Candidate application form
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [notes, setNotes] = useState('');
  const [appSaving, setAppSaving] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setPostingSaving(true);
    try {
      const jobId = 'job_' + Math.random().toString(36).substring(2, 11);
      const newJob: JobPosting = {
        id: jobId,
        companyId: company.id,
        title,
        department,
        location,
        description,
        salaryRange,
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'job_postings', jobId), newJob);
      
      // Reset
      setTitle('');
      setDescription('');
      setSalaryRange('');
      setSubTab('jobs');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setPostingSaving(false);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !candidateName || !candidateEmail) return;

    setAppSaving(true);
    try {
      const appId = 'app_' + Math.random().toString(36).substring(2, 11);
      const newApplication: JobApplication = {
        id: appId,
        companyId: company.id,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        candidateName,
        candidateEmail,
        candidatePhone,
        status: 'Applied',
        notes,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'companies', company.id, 'job_applications', appId), newApplication);
      
      // Reset
      setCandidateName('');
      setCandidateEmail('');
      setCandidatePhone('');
      setNotes('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setAppSaving(false);
    }
  };

  const handleUpdateCandidateStatus = async (appId: string, nextStatus: JobApplication['status']) => {
    try {
      const docRef = doc(db, 'companies', company.id, 'job_applications', appId);
      await updateDoc(docRef, { status: nextStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered job applications
  const filteredApplications = jobApplications.filter(app => {
    const matchesJob = selectedJob ? app.jobId === selectedJob.id : true;
    const matchesSearch = app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' ? true : app.status === selectedStatus;
    return matchesJob && matchesSearch && matchesStatus;
  });

  // Filtered postings
  const filteredPostings = jobPostings.filter(job => {
    const matchesDept = selectedDept === 'All' ? true : job.department === selectedDept;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {subTab === 'jobs' && (
        <div className="space-y-6">
          
          {/* TOP PIPELINE INDICATOR BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-violet-50/60 border border-violet-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-violet-700 font-bold block uppercase tracking-wider">Postes Actifs</span>
                <span className="text-xl font-bold text-violet-950 font-display mt-0.5">{jobPostings.length} Opportunités</span>
              </div>
              <div className="h-10 w-10 bg-violet-600 text-white rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">Total Candidatures</span>
                <span className="text-xl font-bold text-emerald-950 font-display mt-0.5">{jobApplications.length} Profils</span>
              </div>
              <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="p-4 bg-zinc-50/60 border border-zinc-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">En Cours d'Entretien</span>
                <span className="text-xl font-bold text-zinc-900 font-display mt-0.5">
                  {jobApplications.filter(a => a.status === 'Interview' || a.status === 'Screening').length} candidats
                </span>
              </div>
              <div className="h-10 w-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT PANEL: JOB VACANCIES AS STRUCTURAL TABLE */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-50 pb-3">
                <div>
                  <h4 className="font-display font-bold text-zinc-950 text-sm">Registre des Postes</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Cliquez sur une ligne pour lister les candidatures correspondantes.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select 
                    value={selectedDept} onChange={e => setSelectedDept(e.target.value)}
                    className="bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs text-zinc-700 focus:outline-none"
                  >
                    <option value="All">Tous pôle</option>
                    {company.departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              {filteredPostings.length === 0 ? (
                <div className="text-center py-20 px-4 bg-white border border-zinc-150 rounded-[32px] flex flex-col items-center justify-center space-y-4 shadow-sm">
                  <div className="h-10 w-10 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-400">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-display font-semibold text-zinc-800 text-xs">Aucun poste ouvert</h5>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Publiez une première offre pour activer les flux de candidatures.</p>
                  </div>
                  <button 
                    onClick={() => setSubTab('post')}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Publier un poste
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-zinc-100 rounded-[32px] overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <th className="py-2.5 px-3">Titre de l'Offre</th>
                        <th className="py-2.5 px-3">Département</th>
                        <th className="py-2.5 px-3">Rémunération</th>
                        <th className="py-2.5 px-3 text-right">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-zinc-700 font-medium">
                      {filteredPostings.map((job) => (
                        <tr 
                          key={job.id} 
                          onClick={() => setSelectedJob(job)}
                          className={`hover:bg-zinc-50/50 cursor-pointer transition-colors ${selectedJob?.id === job.id ? 'bg-violet-50/40 border-l-[3.5px] border-violet-600' : ''}`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-semibold text-zinc-950">{job.title}</div>
                            <div className="text-[9px] text-zinc-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5" /> {job.location}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-zinc-500">{job.department}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">{job.salaryRange || 'Non spécifié'}</td>
                          <td className="py-3 px-3 text-right">
                            <ChevronRight className="h-4 w-4 text-zinc-400 inline-block" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: SELECTED JOB SPECIFICATIONS AND APPLICANTS TABULAR LEDGER */}
            <div className="lg:col-span-6 space-y-6">
              {selectedJob ? (
                <div className="bg-white border border-zinc-100 rounded-[32px] p-6 shadow-sm space-y-6">
                  {/* Job Specifications header */}
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold tracking-widest block mb-1">
                      {selectedJob.department}
                    </span>
                    <h3 className="font-display font-extrabold text-lg text-zinc-950 tracking-tight mt-2">{selectedJob.title}</h3>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed bg-zinc-50 rounded-2xl p-3 border border-zinc-100">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Applicants Table */}
                  <div className="pt-4 border-t border-zinc-50 space-y-4">
                    <h4 className="font-display font-bold text-zinc-900 text-sm">Candidats Associés</h4>

                    {filteredApplications.length === 0 ? (
                      <div className="p-6 border border-dashed rounded-2xl text-center text-zinc-400 text-xs">
                        Aucune candidature enregistrée pour cette opportunité.
                      </div>
                    ) : (
                      <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-zinc-100/40 border-b border-zinc-150 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                              <th className="py-2.5 px-3">Nom du Candidat</th>
                              <th className="py-2.5 px-3">Coordonnées</th>
                              <th className="py-2.5 px-3">Statut Pipeline</th>
                              <th className="py-2.5 px-3 text-right">Progression</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 font-medium">
                            {filteredApplications.map((app) => (
                              <tr key={app.id} className="hover:bg-zinc-50/50">
                                <td className="py-3 px-3">
                                  <span className="font-bold text-zinc-950">{app.candidateName}</span>
                                  {app.notes && <p className="text-[9px] text-zinc-400 italic max-w-40 truncate mt-0.5">"{app.notes}"</p>}
                                </td>
                                <td className="py-3 px-3 text-[10px] text-zinc-500">
                                  <div>{app.candidateEmail}</div>
                                  <div className="font-mono">{app.candidatePhone || 'N/A'}</div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                    app.status === 'Hired' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    app.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                                    app.status === 'Interview' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {app.status === 'Applied' ? 'Postulé' : app.status === 'Screening' ? 'Filtre' : app.status === 'Interview' ? 'Entretien' : app.status === 'Offered' ? 'Offre' : app.status === 'Hired' ? 'Recruté' : 'Refusé'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {/* Quick status progress selectors dropdown */}
                                  <select 
                                    value={app.status} onChange={e => handleUpdateCandidateStatus(app.id, e.target.value as any)}
                                    className="bg-white border border-zinc-200 text-[10px] rounded px-1 py-0.5 cursor-pointer font-bold focus:outline-none"
                                  >
                                    <option value="Applied">Reçu</option>
                                    <option value="Screening">Filtre</option>
                                    <option value="Interview">Oral</option>
                                    <option value="Offered">Proposition</option>
                                    <option value="Hired">Signé</option>
                                    <option value="Rejected">Écarté</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Quick Manual Applicant Add Form */}
                    <form onSubmit={handleCreateCandidate} className="bg-zinc-50 p-4 border border-zinc-150 rounded-2xl space-y-3.5">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-display">Ajouter manuellement un candidat</span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" required placeholder="Nom complet *" value={candidateName} onChange={e => setCandidateName(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-xs"
                        />
                        <input 
                          type="email" required placeholder="Email *" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-xs"
                        />
                        <input 
                          type="text" placeholder="Téléphone (Optionnel)" value={candidatePhone} onChange={e => setCandidatePhone(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-xs col-span-2"
                        />
                        <textarea 
                          placeholder="Notes d'évaluation, diplôme..." value={notes} onChange={e => setNotes(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-xs col-span-2"
                          rows={2}
                        />
                      </div>

                      <button 
                        type="submit" disabled={appSaving}
                        className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl py-2 font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {appSaving ? 'Transmission...' : 'Ajouter le profil'}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 border border-zinc-150 border-dashed rounded-[32px] p-8 text-center text-zinc-400 h-full flex flex-col items-center justify-center">
                  <Briefcase className="h-8 w-8 text-zinc-300 mb-2" />
                  <p className="text-xs font-semibold text-zinc-800">Sélectionnez une offre pour lister ses candidats</p>
                  <p className="text-[10px] text-zinc-400 max-w-xs mt-1 leading-normal">
                    L'évaluation, les contacts et les statuts d'évolution du recrutement apparaîtront en direct sur ce panneau latéral.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {subTab === 'post' && (
        <form onSubmit={handleCreateJob} className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-sm max-w-xl space-y-6">
          <div>
            <h3 className="font-display font-bold text-zinc-900 text-lg">Publier une Opportunité</h3>
            <p className="text-xs text-zinc-500 mt-1">Saisir les exigences du poste et la grille de salaire pour alimenter le registre.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-display">Intitule du Poste *</label>
              <input 
                type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ex : Responsable Logistique et Transport"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-display">Département d'Affectation</label>
              <select 
                value={department} onChange={e => setDepartment(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all appearance-none"
              >
                {company.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-display">Lieu de Travail</label>
              <input 
                type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Douala, Cameroun"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-display">Fourchette Salariale Budgetisée (Optionnelle)</label>
              <input 
                type="text" value={salaryRange} onChange={e => setSalaryRange(e.target.value)}
                placeholder="Ex : 500 000 - 800 000 FCFA"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5 font-display">Fiche de Poste & Compétences Requises *</label>
              <textarea 
                required value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Définissez les tâches quotidiennes, les certifications ou diplômes attendus..."
                rows={4}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-zinc-100 text-xs">
            <button 
              type="button" onClick={() => setSubTab('jobs')}
              className="px-4 py-2.5 border border-zinc-200 rounded-xl font-semibold hover:bg-zinc-50 text-zinc-700 cursor-pointer"
            >
              Annuler
            </button>
            <button 
              type="submit" disabled={postingSaving}
              className="bg-zinc-950 hover:bg-zinc-900 text-white font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {postingSaving ? 'Publication en cours...' : 'Publier l\'Offre'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
