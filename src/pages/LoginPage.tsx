import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { login as apiLogin } from '../services/auth.service';
import { useAuth } from '../context/AuthContext'; 
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login: authContextLogin } = useAuth(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Bitte alle Felder ausfüllen.");
    
    setLoading(true);
    setError('');

    try {
      const response = await apiLogin(email, password);
      authContextLogin(response); 
      toast.success(`Willkommen zurück, ${response.user.firstName}!`);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Zugangsdaten ungültig oder Server offline.';
      setError(msg);
      toast.error(msg);
      setPassword(''); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* LEFT SECTION: LOGIN FORM */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-20 xl:px-32 animate-in fade-in slide-in-from-left-6 duration-700">
        <div className="mx-auto w-full max-w-sm">
          
          {/* Logo & Header */}
          <div className="mb-12 text-left">
            <div className="flex items-center gap-3 text-blue-600 mb-10 group cursor-default">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 group-hover:rotate-12 transition-transform duration-500">
                    <ShieldCheck size={28} />
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tighter text-slate-900 block leading-none">GlanzOps</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Enterprise</span>
                </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Anmelden
            </h2>
            <p className="mt-4 text-slate-500 font-medium leading-relaxed text-[13px]">
              Zentrale Verwaltungsebene. Bitte identifizieren Sie sich für den Systemzugriff.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-xl bg-red-50 p-4 text-[12px] text-red-600 border border-red-100 flex items-center animate-shake shadow-sm shadow-red-100/50">
              <AlertCircle className="h-4 w-4 mr-3 shrink-0" />
              <span className="font-bold uppercase tracking-tight">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5 text-left">
              <label className="label-caps !ml-0">System-Identität (E-Mail)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-standard pl-12 py-3.5 font-bold focus:ring-4 focus:ring-blue-500/5"
                  placeholder="personal@glanzops.de"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="label-caps !ml-0">Sicherheits-Key</label>
                <Link 
                  to="/forgot-password" 
                  className="text-[9px] font-black text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors px-1 py-1 rounded-md"
                >
                  Passwort vergessen?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-standard pl-12 py-3.5 font-bold focus:ring-4 focus:ring-blue-500/5"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 shadow-2xl shadow-blue-500/20 mt-4 group"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <span className="tracking-[0.2em] font-black text-[10px]">LOGIN BESTÄTIGEN</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-20 text-center border-t border-slate-50 pt-10">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">
              &copy; {new Date().getFullYear()} GlanzOps &bull; Infrastructure Management
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: BRANDING & TECHNOLOGY */}
      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden">
        <div className="absolute inset-0 h-full w-full bg-slate-950 bg-auth-gradient">
          
          {/* Dynamic Background Effects */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600 rounded-full opacity-20 blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full opacity-10 blur-[180px]"></div>
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-dot-pattern"></div>

          <div className="relative z-10 flex flex-col justify-center h-full px-24 text-left text-white max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] mb-8 w-fit">
               System Status: Active
            </div>
            <h2 className="text-6xl font-black leading-[1] mb-12 tracking-tighter">
              Operations <br/>
              <span className="text-blue-500">Perfected.</span>
            </h2>
            
            <div className="space-y-10">
              {[
                { title: 'Zentralisierte Steuerung', desc: 'Maximale Kontrolle über alle Objekte und Teams in Echtzeit.' },
                { title: 'Digitale Transparenz', desc: 'Lückenlose Dokumentation durch intelligente Live-Protokolle.' },
                { title: 'Automatisierte Finanzen', desc: 'Effizientes Invoicing und Payroll-Management per Mausklick.' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <div className="mt-1 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
                    <CheckCircle2 size={24} className="text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-xl text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-slate-400 text-base font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}