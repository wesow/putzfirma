import { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  Play, 
  RefreshCw, 
  X, 
  Loader2, 
  Camera, 
  UploadCloud,
  ExternalLink,
  ImagePlus // NEU: Icon für reinen Upload
} from 'lucide-react'; 
import api from '../../lib/api';

const API_BASE_URL = 'http://localhost:3000'; 

interface Employee { id: string; firstName: string; lastName: string; }

interface JobProof {
    id: string;
    url: string;
    type: string;
}

interface Job {
  id: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  customer: { companyName: string | null; firstName: string; lastName: string; };
  service: { name: string };
  address: { street: string; city: string };
  assignments: { employee: Employee }[];
  actualDurationMinutes: number | null;
  proofs: JobProof[];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  // NEU: Welcher Modus? 'COMPLETE' (Abschluss) oder 'UPLOAD' (Nur Foto)
  const [modalMode, setModalMode] = useState<'COMPLETE' | 'UPLOAD'>('COMPLETE');
  
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [durationInput, setDurationInput] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = localStorage.getItem('role');
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const promises = [api.get('/jobs')];
      if (isAdmin) promises.push(api.get('/employees'));

      const [jobsRes, employeesRes] = await Promise.all(promises);

      const sortedJobs = jobsRes.data.sort((a: Job, b: Job) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );

      setJobs(sortedJobs);
      if (employeesRes) setEmployees(employeesRes.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateJobs = async () => { 
      setIsGenerating(true);
      try { 
        await api.post('/jobs/generate'); 
        await fetchData(); 
        alert("Jobs erfolgreich generiert!"); 
      } catch(e: any) { 
        console.error(e);
        alert(e.response?.data?.message || "Fehler beim Generieren."); 
      } finally {
        setIsGenerating(false);
      }
  };

  const handleStatusChange = async (id: string, s: string) => { 
     if(!confirm("Möchtest du den Status wirklich ändern?")) return;
     try { 
       await api.patch(`/jobs/${id}/status`, { status: s }); 
       fetchData(); 
     } catch(e) { 
       alert("Fehler beim Status-Update"); 
     }
  };

  const handleAssignEmployee = async (jid: string, eid: string) => {
     try { 
       await api.post(`/jobs/${jid}/assign`, { employeeId: eid }); 
       fetchData(); 
     } catch(e) { 
       alert("Fehler bei der Zuweisung"); 
     }
  };

  // --- MODAL LOGIK ---

  // 1. Abschluss-Dialog öffnen
  const openCompletionModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setModalMode('COMPLETE'); // Modus: Abschließen
    setDurationInput(''); 
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  // 2. Nur Upload-Dialog öffnen (NEU)
  const openUploadModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setModalMode('UPLOAD'); // Modus: Nur Foto
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!selectedJobId) return;
    
    // Validierung je nach Modus
    if (modalMode === 'COMPLETE' && !durationInput) {
        return alert("Bitte Zeit eintragen!");
    }
    if (modalMode === 'UPLOAD' && !selectedFile) {
        return alert("Bitte ein Foto auswählen!");
    }

    setIsSubmitting(true);

    try {
        // 1. Foto hochladen (falls ausgewählt)
        if (selectedFile) {
          const formData = new FormData();
          formData.append('image', selectedFile);
          await api.post(`/jobs/${selectedJobId}/proof`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }

        // 2. Status Update (NUR wenn Modus = COMPLETE)
        if (modalMode === 'COMPLETE') {
            await api.patch(`/jobs/${selectedJobId}`, {
                status: 'COMPLETED',
                actualDurationMinutes: Number(durationInput)
            });
        }
        
        setIsModalOpen(false);
        fetchData(); 
    } catch (error) {
        console.error(error);
        alert("Fehler beim Speichern.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={14}/> Erledigt</span>;
      case 'CANCELLED': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold"><XCircle size={14}/> Storniert</span>;
      default: return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold"><Clock size={14}/> Geplant</span>;
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isAdmin ? 'Auftragsübersicht' : 'Meine Aufträge'}
          </h1>
          <p className="text-slate-500">
            {isAdmin ? 'Planung & Zuweisung' : 'Deine anstehenden Einsätze'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white" title="Aktualisieren">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {isAdmin && (
            <button 
                onClick={handleGenerateJobs} 
                disabled={isGenerating}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors ${
                    isGenerating 
                    ? 'bg-slate-400 cursor-not-allowed text-white' 
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {isGenerating ? 'Generiere...' : 'Jobs generieren'}
            </button>
          )}
        </div>
      </div>

      {/* LISTE */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">Lade Daten...</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-md transition-shadow">
              
              {/* LINKER TEIL */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-slate-800">
                    {job.customer.companyName || `${job.customer.firstName} ${job.customer.lastName}`}
                  </span>
                  {getStatusBadge(job.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(job.scheduledDate).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {job.address?.street}, {job.address?.city}
                  </div>
                  {job.status === 'COMPLETED' && job.actualDurationMinutes && (
                      <div className="flex items-center gap-1.5 text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        <Clock className="h-4 w-4" /> {job.actualDurationMinutes} Min.
                      </div>
                  )}
                </div>

                {/* BEWEISFOTOS ANZEIGEN */}
                {job.proofs && job.proofs.length > 0 && (
                   <div className="mt-2 pt-2 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Fotos & Dokumentation:</p>
                      <div className="flex gap-2 flex-wrap">
                        {job.proofs.map(proof => (
                            <a 
                                key={proof.id} 
                                href={`${API_BASE_URL}/${proof.url}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="group relative block w-16 h-16 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition-colors"
                            >
                                <img 
                                    src={`${API_BASE_URL}/${proof.url}`} 
                                    alt="Beweis" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                                    <ExternalLink className="text-white opacity-0 group-hover:opacity-100 w-4 h-4 drop-shadow-md" />
                                </div>
                            </a>
                        ))}
                      </div>
                   </div>
                )}
              </div>

              {/* MITTE: ZUWEISUNG */}
              <div className="w-full lg:w-auto flex flex-col gap-2 min-w-[200px]">
                <div className="flex flex-wrap gap-2">
                  {job.assignments.map((assignment, index) => (
                    <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                      {assignment.employee.firstName}
                    </span>
                  ))}
                  {isAdmin && job.status === 'SCHEDULED' && (
                    <select 
                      className="text-sm bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer hover:bg-white transition" 
                      onChange={(e) => handleAssignEmployee(job.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>+</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* RECHTS: AKTIONEN */}
              <div className="flex items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 mt-2 lg:mt-0 w-full lg:w-auto justify-end">
                {job.status === 'SCHEDULED' && (
                  <>
                     {/* 1. BUTTON: NUR UPLOAD (NEU) */}
                    <button 
                      onClick={() => openUploadModal(job.id)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors"
                      title="Foto hinzufügen (ohne Abschluss)"
                    >
                      <ImagePlus size={20} />
                    </button>

                     {/* 2. BUTTON: STORNIEREN */}
                    <button 
                      onClick={() => handleStatusChange(job.id, 'CANCELLED')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
                      title="Stornieren"
                    >
                      <XCircle size={20} />
                    </button>

                     {/* 3. BUTTON: ERLEDIGT MELDEN */}
                    <button 
                      onClick={() => openCompletionModal(job.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                    >
                      <CheckCircle size={16} /> Erledigt
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Keine Aufträge gefunden.</p>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL (FÜR BEIDES) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {modalMode === 'COMPLETE' ? 'Job abschließen' : 'Foto hinzufügen'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            {modalMode === 'COMPLETE' ? 'Beweis und Zeit erfassen' : 'Dokumentation (z.B. Vorher-Bild)'}
                        </p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-white hover:text-slate-600 p-2 rounded-full transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* FOTO UPLOAD */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                           <Camera size={16} className="text-blue-500"/> 
                           {modalMode === 'COMPLETE' ? 'Beweisfoto (Optional)' : 'Foto auswählen'}
                        </label>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                relative group cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all min-h-[160px]
                                ${previewUrl ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                            `}
                        >
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                className="hidden" 
                            />
                            
                            {previewUrl ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img src={previewUrl} alt="Vorschau" className="max-h-[200px] w-auto rounded-lg shadow-sm object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <p className="text-white font-medium flex items-center gap-2"><RefreshCw size={16}/> Ändern</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Hier klicken</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ZEIT NUR WENN COMPLETE MODUS */}
                    {modalMode === 'COMPLETE' && (
                        <>
                            <div className="border-t border-slate-100"></div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clock size={16} className="text-blue-500"/> Arbeitszeit
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        value={durationInput}
                                        onChange={(e) => setDurationInput(e.target.value)}
                                        className="w-full pl-4 pr-16 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-2xl font-bold text-slate-800 transition-all placeholder:text-slate-300"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium bg-white px-1">Minuten</span>
                                </div>
                            </div>
                        </>
                    )}

                </div>

                <div className="p-5 border-t border-slate-100 bg-slate-50">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`
                            w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                            ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}
                        `}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="animate-spin" /> Speichere...</>
                        ) : (
                            modalMode === 'COMPLETE' 
                                ? <><CheckCircle size={20} /> Abschluss speichern</>
                                : <><UploadCloud size={20} /> Foto hochladen</>
                        )}
                    </button>
                </div>

            </div>
        </div>
      )}

    </div>
  );
}