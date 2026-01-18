import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import api from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { accessToken, role, firstName, lastName } = response.data;

      // 1. Token & Rolle speichern
      localStorage.setItem('token', accessToken);
      localStorage.setItem('role', role);

      // 2. NEU: Namen speichern (für die Begrüßung im Dashboard)
      // Wir prüfen kurz, ob Daten da sind, sonst Fallback
      localStorage.setItem('firstName', firstName || 'Benutzer');
      localStorage.setItem('lastName', lastName || '');

      // 3. Weiterleitung
      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      setError('Login fehlgeschlagen. Bitte prüfe Email & Passwort.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg animate-in fade-in zoom-in duration-300">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">CleanOps</h1>
          <p className="text-slate-500 mt-2">Bitte melde dich an</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Adresse</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="name@firma.de"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              Passwort vergessen?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
          >
            {loading ? 'Lade...' : 'Einloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}