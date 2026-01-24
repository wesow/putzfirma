import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <AlertTriangle size={40} />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Seite nicht gefunden</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Ups! Die Seite, die du suchst, existiert nicht, wurde verschoben oder du hast keine Berechtigung.
        </p>
        
        <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
        >
            <Home size={20} /> Zurück zum Dashboard
        </button>
      </div>
    </div>
  );
}