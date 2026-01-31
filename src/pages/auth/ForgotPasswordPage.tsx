import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('IDLE');
    setMessage('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('SUCCESS');
      setMessage(res.data.message || 'Falls die E-Mail existiert, wurde ein Link gesendet.');
    } catch (error: any) {
      setStatus('ERROR');
      setMessage(error.response?.data?.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        
        {/* LOGO ODER BRANDING AREA */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <KeyRound className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Passwort vergessen</h1>
          <p className="text-[12px] text-slate-500 font-medium mt-1">Sicherheit & Kontozugriff</p>
        </div>

        <div className="form-card shadow-xl shadow-slate-200/50">
          <p className="text-[12px] text-slate-500 text-center mb-6 leading-relaxed">
            Keine Sorge! Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
          </p>

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
            <div className="space-y-1.5">
              <label htmlFor="email" className="label-caps">
                E-Mail Adresse
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="input-standard pl-10 font-medium"
                  placeholder="name@firma.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || status === 'SUCCESS'}
              className="btn-primary w-full py-2.5 justify-center shadow-lg shadow-blue-500/20 font-bold uppercase tracking-widest text-[11px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Wird gesendet...</span>
                </>
              ) : (
                'Link anfordern'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <Link 
              to="/login" 
              className="text-[11px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Zurück zum Login
            </Link>
          </div>
        </div>

        {/* FOOTER INFO */}
        <p className="mt-8 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          &copy; 2026 Dein Unternehmen &bull; Support kontaktieren
        </p>
      </div>
    </div>
  );
}