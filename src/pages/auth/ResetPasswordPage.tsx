import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  // --- FALL: KEIN TOKEN (Fehler-Ansicht) ---
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="auth-card text-center">
          <div className="mx-auto stat-icon-wrapper icon-critical w-16 h-16 rounded-full mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-3 font-sans">Ungültiger Link</h2>
          <p className="page-subtitle mb-8 leading-relaxed">
            Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.
          </p>
          <Link 
            to="/forgot-password" 
            className="btn-primary w-full justify-center"
          >
            Neuen Link anfordern
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="auth-card">
        
        {/* ICON HEADER */}
        <div className="flex justify-center mb-6">
          <div className="stat-icon-wrapper icon-info w-14 h-14 rounded-2xl border border-blue-100">
            <ShieldCheck size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800 tracking-tight">
          Neues Passwort
        </h2>
        
        <p className="page-subtitle text-center mb-8 leading-relaxed">
          Wähle ein sicheres Passwort für deinen <strong>GlanzOps</strong> Account.
        </p>

        {/* FEEDBACK MESSAGES */}
        {status === 'SUCCESS' && (
          <div className="alert-success mb-6">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <p className="font-semibold">{message}</p>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="alert-error mb-6">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="font-semibold">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NEUES PASSWORT */}
          <div className="form-group">
            <label className="label-caps">
              Neues Passwort
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                className="input-standard pl-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* WIEDERHOLUNG */}
          <div className="form-group">
            <label className="label-caps">
              Passwort bestätigen
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck size={18} />
              </div>
              <input
                type="password"
                required
                minLength={8}
                className="input-standard pl-11"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || status === 'SUCCESS'}
            className="btn-primary w-full py-3 justify-center text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Wird gespeichert...</span>
              </>
            ) : (
              'Passwort speichern'
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