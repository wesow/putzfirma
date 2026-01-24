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
      // Nutzt dein konsistentes api-Modul
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 animate-in fade-in zoom-in duration-500">
        
        {/* ICON HEADER */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 shadow-sm border border-blue-100">
            <KeyRound size={32} />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center mb-2 text-slate-800 tracking-tight">
          Passwort vergessen?
        </h2>
        
        <p className="text-slate-500 text-center mb-8 leading-relaxed">
          Keine Sorge! Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
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
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
              E-Mail Adresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700"
                placeholder="name@firma.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || status === 'SUCCESS'}
            className="w-full flex justify-center items-center py-3.5 px-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Wird gesendet...</span>
              </>
            ) : (
              'Link anfordern'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-500 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}