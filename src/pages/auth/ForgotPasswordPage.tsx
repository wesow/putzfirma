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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="auth-card">
        
        {/* ICON HEADER */}
        <div className="flex justify-center mb-6">
          <div className="stat-icon-wrapper icon-info w-14 h-14 rounded-2xl border border-blue-100">
            <KeyRound size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800 tracking-tight">
          Passwort vergessen?
        </h2>
        
        <p className="page-subtitle text-center mb-8 leading-relaxed">
          Keine Sorge! Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
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
          <div className="form-group">
            <label htmlFor="email" className="label-caps">
              E-Mail Adresse
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                className="input-standard pl-11"
                placeholder="name@firma.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}