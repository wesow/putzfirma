import {
    AlertCircle,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    ExternalLink,
    Loader2,
    MapPin,
    Play,
    StopCircle,
    Timer,
    User
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// WICHTIG: Pfade anpassen falls nötig
import api from '../lib/api';
import type { Job } from '../types';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [timer, setTimer] = useState<string>('00:00:00');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Für Foto-Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTodayData();
  }, []);

  // --------------------------------------------------------
  // 1. DATEN LADEN & LOGIK (Welcher Job ist dran?)
  // --------------------------------------------------------
  const fetchTodayData = async () => {
    try {
      setLoading(true);
      // Wir holen die Jobs vom neuen Endpunkt
      const res = await api.get<Job[]>('/jobs/my-today'); 
      const jobs = res.data;
      setTodayJobs(jobs);

      // Intelligente Auswahl: Welcher Job wird groß angezeigt?
      // 1. Priorität: Ein Job, der bereits läuft (IN_PROGRESS)
      const running = jobs.find((j) => j.status === 'IN_PROGRESS');
      
      // 2. Priorität: Der nächste geplante Job (SCHEDULED)
      const next = jobs.find((j) => j.status === 'SCHEDULED');
      
      // Fallback: Einfach der erste Job (oder null)
      setActiveJob(running || next || jobs[0] || null);

    } catch (e) {
      console.error("Fehler beim Laden", e);
      toast.error("Konnte Jobs nicht laden. Bist du eingeloggt?");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------
  // 2. LIVE TIMER
  // --------------------------------------------------------
  useEffect(() => {
    let interval: number;
    // Timer läuft nur, wenn Job läuft UND eine Startzeit existiert
    if (activeJob?.status === 'IN_PROGRESS' && activeJob.startedAt) {
      interval = window.setInterval(() => {
        const start = new Date(activeJob.startedAt!).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);
        
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        setTimer(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  // --------------------------------------------------------
  // 3. ACTIONS (Start / Stop / Foto)
  // --------------------------------------------------------
  const handleStartWork = async () => {
    if (!activeJob?.assignmentId) return toast.error("Fehler: Keine Zuweisung gefunden.");
    
    setIsProcessing(true);
    try {
      // Neuer Endpunkt: /api/time/start
      await api.post('/time/start', { assignmentId: activeJob.assignmentId });
      toast.success("Zeit gestartet! Viel Erfolg.");
      fetchTodayData(); 
    } catch (e) {
      toast.error("Start fehlgeschlagen.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteWork = async () => {
    if (!activeJob?.assignmentId) return;
    
    setIsProcessing(true);
    try {
      // Neuer Endpunkt: /api/time/stop
      await api.post('/time/stop', { assignmentId: activeJob.assignmentId });
      toast.success("Job erledigt! Gute Arbeit.");
      fetchTodayData();
    } catch (e) {
      toast.error("Fehler beim Beenden.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeJob) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file); // 'image' entspricht fieldname in Multer

    setUploading(true);
    try {
      await api.post(`/jobs/${activeJob.id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Foto hochgeladen!");
    } catch (error) {
      toast.error("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  if (loading) return (
    <div className="page-container flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="page-container pb-safe">
      
      {/* 1. WILLKOMMENS BEREICH */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-xl font-black text-slate-900 leading-tight">Hallo Team! 👋</h1>
        <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest mt-1">
          {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
      </div>

      {/* 2. AKTIVE EINSATZ-KARTE */}
      <div className="space-y-4">
        <div className="label-caps !ml-1">Aktueller Einsatz</div>
        
        {!activeJob ? (
          <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-slate-300" size={32} />
            </div>
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Keine Jobs mehr</h3>
            <p className="text-[10px] text-slate-400 mt-2">Alles erledigt für heute!</p>
          </div>
        ) : (
          <div className={`relative bg-white rounded-3xl border-2 transition-all duration-300 shadow-xl shadow-slate-200/50 overflow-hidden ${
            activeJob.status === 'IN_PROGRESS' ? 'border-emerald-500' : 
            activeJob.status === 'COMPLETED' ? 'border-slate-200 opacity-75' : 'border-blue-500'
          }`}>
            
            <div className={`px-5 py-3 flex justify-between items-center ${
              activeJob.status === 'IN_PROGRESS' ? 'bg-emerald-500' : 
              activeJob.status === 'COMPLETED' ? 'bg-slate-500' : 'bg-blue-500'
            }`}>
              <div className="flex items-center gap-2 text-white">
                <Timer size={16} className={activeJob.status === 'IN_PROGRESS' ? 'animate-pulse' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {activeJob.status === 'IN_PROGRESS' ? 'Einsatz läuft' : 
                   activeJob.status === 'COMPLETED' ? 'Erledigt' : 'Nächster Termin'}
                </span>
              </div>
              <span className="text-white/80 font-black text-[10px] uppercase">
                Start: {new Date(activeJob.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                  <User size={24} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-900 truncate leading-tight">
                    {activeJob.customer.companyName || `${activeJob.customer.firstName} ${activeJob.customer.lastName}`}
                  </h2>
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-[11px] uppercase tracking-tight mt-1">
                    <CheckCircle2 size={12} /> {activeJob.service.name}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeJob.address.street}, ${activeJob.address.city}`)}`)}
                className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 active:scale-[0.98] transition-all"
              >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <MapPin size={18} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-700">{activeJob.address.street}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase">{activeJob.address.city}</p>
                </div>
                <ExternalLink size={14} className="ml-auto text-slate-300" />
              </button>

              {activeJob.status === 'IN_PROGRESS' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">{timer}</div>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Live Tracking</span>
                  </div>
                  <button 
                    onClick={handleCompleteWork}
                    disabled={isProcessing}
                    className="btn-primary w-full !bg-slate-900 !py-4 shadow-xl shadow-slate-900/20 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <StopCircle size={20} />}
                    Einsatz beenden
                  </button>
                </div>
              ) : activeJob.status === 'SCHEDULED' ? (
                <button 
                  onClick={handleStartWork}
                  disabled={isProcessing}
                  className="btn-primary w-full !bg-blue-600 !py-4 shadow-xl shadow-blue-500/20 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                  Jetzt starten
                </button>
              ) : (
                <div className="text-center py-4 text-emerald-600 font-bold bg-emerald-50 rounded-xl border border-emerald-100">
                   ✅ Abgeschlossen
                </div>
              )}

              {/* FOTO UPLOAD (Nur wenn Job läuft oder fertig ist) */}
              {(activeJob.status === 'IN_PROGRESS' || activeJob.status === 'COMPLETED') && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" // Öffnet Kamera am Handy
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handlePhotoUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={16}/> : <Camera size={16} />}
                    Beweisfoto hinzufügen
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* 3. LISTE ALLER JOBS HEUTE (Falls man wechseln muss) */}
      {todayJobs.length > 1 && (
        <div className="mt-8">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4 pl-1">Alle Jobs heute</h3>
          <div className="space-y-3">
            {todayJobs.map(job => (
              <div 
                key={job.id} 
                onClick={() => setActiveJob(job)}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all active:scale-95 ${
                  activeJob?.id === job.id ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-100'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-800 text-sm">{job.customer.companyName || job.customer.lastName}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{job.service.name}</div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  job.status === 'COMPLETED' ? 'bg-emerald-400' : 
                  job.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'
                }`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUICK ACTIONS GRID */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <button 
          onClick={() => navigate('/dashboard/calendar')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all"
        >
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Calendar size={20}/></div>
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Wochenplan</span>
        </button>
        <button 
          onClick={() => navigate('/dashboard/absences')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all"
        >
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><AlertCircle size={20}/></div>
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Krank/Urlaub</span>
        </button>
      </div>

      <div className="mt-8 p-4 bg-slate-900/5 rounded-2xl flex items-start gap-3 border border-slate-200/50">
        <Clock size={16} className="text-slate-400 mt-0.5" />
        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
          <strong>Hinweis:</strong> Deine Arbeitszeiten werden GoBD-konform aufgezeichnet und fließen direkt in deine Lohnabrechnung ein.
        </p>
      </div>
    </div>
  );
}