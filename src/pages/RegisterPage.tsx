import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { registerWithInvite } from '../services/auth.service';
import { UserPlus, ArrowRight, CheckCircle, Lock, User, Mail, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token'); 
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  // --- FALL 1: KEIN TOKEN (Zugriff verweigert) ---
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center animate-in fade-in zoom-in duration-300 border border-slate-100">
          <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Keine Einladung gefunden</h2>
          <p className="text-slate-600 mb-8 leading-relaxed text-sm">
            Die Registrierung ist nur über einen gültigen Einladungslink möglich. <br/>
            Bitte wende dich an deinen Administrator.
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl shadow-lg shadow-slate-200 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-95"
          >
            Zurück zum Login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // --- FALL 2: TOKEN VORHANDEN (Formular) ---
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const toastId = toast.loading("Erstelle Account...");
    
    try {
      await registerWithInvite({
        token: token,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      toast.success('Willkommen! Du wirst eingeloggt...', { id: toastId });
      
      // Kurze Verzögerung für UX
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Registrierung fehlgeschlagen.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper für Input-Felder (Optional, hier inline ok da keine State-Probleme bei react-hook-form)
  const InputField = ({ label, icon: Icon, name, type = "text", placeholder, validation = {} }: any) => (
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">{label}</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Icon size={18} />
            </div>
            <input
                type={type}
                {...register(name, validation)}
                className={`block w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700 ${errors[name] ? 'border-red-300 focus:ring-red-200' : 'border-slate-200'}`}
                placeholder={placeholder}
            />
        </div>
        {errors[name] && <span className="text-xs text-red-500 mt-1 ml-1 font-medium block">{errors[name]?.message as string}</span>}
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex justify-center mb-6 bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Einladung annehmen</h2>
        <p className="mt-2 text-sm text-slate-500">Willkommen bei CleanOps! Vervollständige dein Profil.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="grid grid-cols-2 gap-4">
                <InputField label="Vorname" icon={User} name="firstName" placeholder="Max" validation={{ required: 'Pflichtfeld' }} />
                <InputField label="Nachname" icon={User} name="lastName" placeholder="Mustermann" validation={{ required: 'Pflichtfeld' }} />
            </div>

            <InputField 
                label="Neues Passwort" 
                icon={Lock} 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                validation={{ required: 'Pflichtfeld', minLength: { value: 8, message: 'Mind. 8 Zeichen' } }} 
            />

            <InputField 
                label="Bestätigen" 
                icon={CheckCircle} 
                name="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                validation={{ validate: (val: string) => val === password || 'Passwörter stimmen nicht überein' }} 
            />

            <div className="pt-2">
                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-100 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Account erstellen'}
                </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Bereits registriert?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">Zum Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}