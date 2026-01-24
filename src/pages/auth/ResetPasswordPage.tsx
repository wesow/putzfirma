import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck,  Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('IDLE');
    setMessage('');

    if (!token) {
      setStatus('ERROR');
      setMessage('Kein Token gefunden. Bitte klicke erneut auf den Link in der E-Mail.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('ERROR');
      setMessage('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { 
        token, 
        newPassword: password 
      });

      setStatus('SUCCESS');
      setMessage('Passwort erfolgreich geändert! Du wirst in Kürze zum Login weitergeleitet.');
      
      // Automatische Weiterleitung nach 3 Sekunden
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err: any) {
      setStatus('ERROR');
      setMessage(err.response?.data?.message || 'Fehler beim Zurücksetzen.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FALL: KEIN TOKEN ---
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Ungültiger Link</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.
          </p>
          <Link 
            to="/forgot-password" 
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl shadow-lg shadow-blue-100 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95"
          >
            Neuen Link anfordern
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 animate-in fade-in zoom-in duration-500">
        
        {/* ICON HEADER */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-sm border border-blue-100">
            <ShieldCheck size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2 text-slate-800 tracking-tight">
          Neues Passwort
        </h2>
        
        <p className="text-slate-500 text-center mb-8 leading-relaxed">
          Wähle ein sicheres Passwort für deinen CleanOps Account.
        </p>

        {/* FEEDBACK MESSAGES */}
        {status === 'SUCCESS' && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 flex items-start gap-3 animate-in slide-in-from-top-2">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <p className="font-medium">{message}</p>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NEUES PASSWORT */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
              Neues Passwort
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* WIEDERHOLUNG */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
              Passwort bestätigen
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck size={18} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || status === 'SUCCESS'}
            className="w-full flex justify-center items-center py-3.5 px-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Wird gespeichert...</span>
              </>
            ) : (
              'Passwort ändern'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </div>
    </div>
  );
}