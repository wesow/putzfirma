import { AlertCircle, CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
      // WICHTIG: 'res' Variable entfernt, da sie nicht genutzt wurde (Fix für Build-Fehler)
      await api.post('/auth/reset-password', { 
        token, 
        newPassword: password 
      });

      setStatus('SUCCESS');
      setMessage('Passwort erfolgreich geändert! Du wirst zum Login weitergeleitet.');
      
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (err: any) {
      setStatus('ERROR');
      setMessage(err.response?.data?.message || 'Fehler beim Zurücksetzen.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FALL: KEIN TOKEN (Kompakte Fehler-Ansicht) ---
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="form-card text-center shadow-xl shadow-slate-200/50 border-t-4 border-t-red-500">
                <div className="mx-auto w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4">
                    <AlertCircle size={24} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Ungültiger Link</h2>
                <p className="text-[12px] text-slate-500 mb-6 leading-relaxed">
                    Der Link zum Zurücksetzen des Passworts ist ungültig oder bereits abgelaufen.
                </p>
                <Link 
                    to="/forgot-password" 
                    className="btn-primary w-full justify-center py-2.5 font-bold uppercase tracking-widest text-[11px]"
                >
                    Neuen Link anfordern
                </Link>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        
        {/* HEADER AREA */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Neues Passwort</h1>
          <p className="text-[12px] text-slate-500 font-medium mt-1 italic">Sichere Anmeldung für GlanzOps</p>
        </div>

        <div className="form-card shadow-xl shadow-slate-200/50">
          
          {/* FEEDBACK MESSAGES */}
          {status === 'SUCCESS' && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3 animate-in slide-in-from-top-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-emerald-800 leading-normal uppercase tracking-tight">{message}</p>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-red-800 leading-normal uppercase tracking-tight">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NEUES PASSWORT */}
            <div className="space-y-1.5 text-left">
              <label className="label-caps">
                Neues Passwort
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-standard pl-10 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* WIEDERHOLUNG */}
            <div className="space-y-1.5 text-left">
              <label className="label-caps">
                Passwort bestätigen
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <ShieldCheck size={16} />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="input-standard pl-10 font-medium"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || status === 'SUCCESS'}
              className="btn-primary w-full py-2.5 justify-center shadow-lg shadow-blue-500/20 font-bold uppercase tracking-widest text-[11px] mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                'Passwort speichern'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <Link 
              to="/login" 
              className="text-[11px] font-black text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors"
            >
              Vorgang abbrechen
            </Link>
          </div>
        </div>

        {/* FOOTER INFO */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          Sicherheitsstandard &bull; Verschlüsselte Übertragung
        </p>
      </div>
    </div>
  );
}