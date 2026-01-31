import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 bg-dot-pattern p-4 font-sans overflow-hidden">
      
      {/* BRANDING */}
      <div className="flex flex-col items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-2 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
          <div className="p-2 bg-slate-200 rounded-lg shadow-inner">
            <Sparkles size={18} className="text-slate-500" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-600">GlanzOps</span>
        </div>
      </div>

      {/* MAIN ERROR CARD */}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-slate-200/60 text-center max-w-md w-full border border-white relative overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* LIGHTING EFFECTS */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-50/50 rounded-full blur-[60px]"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-50/50 rounded-full blur-[60px]"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20 -rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <Ghost size={40} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
          </div>
          
          <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tighter leading-none">404</h1>
          <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Leere Fläche detektiert.</h2>
          
          <p className="text-slate-500 mb-8 leading-relaxed font-medium text-[13px] px-2">
            Die angeforderte Ressource konnte nicht lokalisiert werden. Möglicherweise wurde sie verschoben oder vollständig poliert.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full justify-center py-3 uppercase tracking-widest font-bold text-[11px] shadow-lg"
            >
                <Home size={14} className="mr-2" /> Zur Zentrale
            </button>
            
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest py-2 transition-all"
            >
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
                Zurück zum Sektor
            </button>
          </div>
        </div>
      </div>

      {/* SYSTEM LOG FOOTER */}
      <div className="mt-8 flex items-center gap-2 animate-in fade-in duration-1000 delay-300">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Error Stack: Page_Not_Found
        </p>
      </div>
    </div>
  );
}