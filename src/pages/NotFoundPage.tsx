import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-slate-100">
        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Seite nicht gefunden</h2>
        <p className="text-slate-500 mb-8">
          Ups! Die Seite, die du suchst, existiert nicht oder wurde verschoben.
        </p>
        <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
            <Home size={20} /> Zurück zum Dashboard
        </button>
      </div>
    </div>
  );
}