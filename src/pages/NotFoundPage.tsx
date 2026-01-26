import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost, Sparkles, ShieldAlert } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 bg-dot-pattern p-6 font-sans overflow-hidden">
      
      {/* BRANDING OBEN */}
      <div className="flex flex-col items-center gap-2 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
          <div className="p-2.5 bg-slate-200 rounded-xl shadow-inner">
            <Sparkles size={22} className="text-slate-500" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-600">GlanzOps</span>
        </div>
      </div>

      {/* MAIN ERROR CARD */}
      <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl shadow-slate-200/60 text-center max-w-lg border border-white relative overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* LIGHTING EFFECTS */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10">
          <div className="w-28 h-28 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-blue-600/30 -rotate-3 hover:rotate-0 transition-transform duration-500 group">
            <Ghost size={56} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black text-slate-900 mb-4 tracking-tighter leading-none">404</h1>
          <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Leere Fläche detektiert.</h2>
          
          <p className="text-slate-500 mb-12 leading-relaxed font-medium text-lg px-4">
            Die von Ihnen angeforderte Systemressource konnte nicht lokalisiert werden. Möglicherweise wurde sie verschoben oder vollständig poliert.
          </p>
          
          <div className="flex flex-col gap-4">
            <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary w-full !py-5 shadow-2xl shadow-blue-500/20 uppercase tracking-[0.2em] font-black text-[10px]"
            >
                <Home size={18} /> Zur Zentrale zurückkehren
            </button>
            
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] py-4 transition-all"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1.5 transition-transform" /> 
                Vorheriger Sektor
            </button>
          </div>
        </div>
      </div>

      {/* SYSTEM LOG FOOTER */}
      <div className="mt-12 flex items-center gap-3 animate-in fade-in duration-1000 delay-300">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          GlanzOps Protocol • Error Stack: Page_Not_Found
        </p>
      </div>
    </div>
  );
}