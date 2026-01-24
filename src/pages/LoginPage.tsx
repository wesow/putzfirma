import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Building2, Loader2 } from 'lucide-react';
import { login } from '../services/auth.service';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      // Personalisierte Begrüßung
      toast.success(`Willkommen zurück, ${response.user.firstName || 'User'}!`);
      
      // Kurze Verzögerung für den "Erfolgseffekt"
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Zugangsdaten ungültig.';
      setError(msg);
      toast.error(msg);
      setPassword(''); // Passwort zurücksetzen
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* --- LINKER BEREICH: FORMULAR --- */}
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          {/* Logo / Brand Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-blue-600 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 size={28} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">CleanOps</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Willkommen zurück
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Bitte melden Sie sich an, um auf das Dashboard zuzugreifen.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-start animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                Email Adresse
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium disabled:opacity-60"
                  placeholder="name@firma.de"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase">
                  Passwort
                </label>
                <div className="text-sm">
                  <Link 
                    to="/forgot-password" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Vergessen?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center rounded-xl bg-blue-600 px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <Loader2 className="animate-spin h-5 w-5" />
                   <span>Anmeldung läuft...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <span>Einloggen</span>
                   <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Footer Note (Optional, z.B. für Impressum Link) */}
          <div className="mt-10 text-center text-xs text-slate-400">
             &copy; {new Date().getFullYear()} CleanOps Enterprise
          </div>

        </div>
      </div>

      {/* --- RECHTER BEREICH: VISUALS (Nur Desktop) --- */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 h-full w-full bg-slate-900 overflow-hidden">
            
            {/* Background Blobs (Pure CSS, keine externe Config nötig) */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col justify-center h-full px-16 text-white">
                <div className="max-w-xl">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-sm font-medium backdrop-blur-md">
                        <CheckCircle2 size={16} className="text-green-400" />
                        <span>Enterprise Solution v2.0</span>
                    </div>
                    
                    <h2 className="text-5xl font-bold mb-6 leading-tight">
                        Effizientes Management für <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">moderne Gebäudedienste.</span>
                    </h2>
                    
                    <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-lg">
                        Verwalten Sie Aufträge, Mitarbeiter, Rechnungen und Kunden an einem zentralen Ort. 
                        Automatisierte Prozesse für mehr Zeit im Kerngeschäft.
                    </p>
                    
                    <ul className="space-y-5 text-slate-200 font-medium">
                        {['Automatische Rechnungsstellung', 'Digitale Zeiterfassung per App', 'Echtzeit Dashboard & Analysen'].map((item, i) => (
                            <li key={i} className="flex items-center gap-4">
                                <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}