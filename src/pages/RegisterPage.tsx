import { AlertCircle, ArrowRight, CheckCircle, Loader2, Lock, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { registerWithInvite } from '../services/auth.service';

// Kompaktere Input-Komponente
const InputField = ({ label, icon: Icon, name, type = "text", placeholder, register, validation, errors }: any) => (
  <div className="space-y-1 text-left">
    <label className="label-caps !ml-0">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={16} />
      </div>
      <input
        type={type}
        {...register(name, validation)}
        autoComplete={type === "password" ? "new-password" : "off"} 
        // Nutzung der globalen input-standard Klasse, etwas angepasst für Icon
        className={`input-standard pl-10 !py-2.5 ${
          errors[name] ? 'border-red-300 focus:ring-red-200' : ''
        }`}
        placeholder={placeholder}
      />
    </div>
    {errors[name] && (
      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-1 block">
        {errors[name].message}
      </span>
    )}
  </div>
);

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }
      try {
        const response = await api.get(`/auth/invitations/${token}`); 
        setInviteData(response.data);
        setIsValid(true);
      } catch (error: any) {
        setIsValid(false);
      } finally {
        setIsVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const toastId = toast.loading("Account wird konfiguriert...");
    
    try {
      await registerWithInvite({
        token: token!,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      toast.success('Erfolgreich aktiviert!', { id: toastId });
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registrierung fehlgeschlagen.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 bg-dot-pattern">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validierung läuft...</p>
      </div>
    );
  }

  // FEHLER-ZUSTAND: UNGÜLTIGER TOKEN
  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans bg-dot-pattern">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-white text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wide">Sicherheits-Fehler</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium text-[13px]">
            Dieser Aktivierungslink ist ungültig, abgelaufen oder wurde bereits verarbeitet.
          </p>
          <Link 
            to="/login" 
            className="btn-primary w-full justify-center shadow-lg"
          >
            Zur Anmeldung <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  // REGISTRIERUNGS-FORMULAR
  return (
    <div className="min-h-screen flex flex-col justify-center py-10 px-4 bg-slate-50 font-sans bg-dot-pattern overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex justify-center mb-6 bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Identität verifizieren</h2>
        <p className="text-slate-500 font-medium text-sm">
          Erstellen Sie Ihr Profil für <br/>
          <span className="text-blue-600 font-bold">{inviteData?.email}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-8 shadow-xl shadow-slate-200/60 rounded-2xl border border-white animate-in slide-in-from-bottom-8 duration-500 relative">
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Sparkles size={60} className="text-blue-600" />
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="grid grid-cols-2 gap-4">
              <InputField 
                label="Vorname" 
                icon={User} 
                name="firstName" 
                placeholder="Max" 
                register={register} 
                errors={errors} 
                validation={{ required: 'Erforderlich' }} 
              />
              <InputField 
                label="Nachname" 
                icon={User} 
                name="lastName" 
                placeholder="Mustermann" 
                register={register} 
                errors={errors} 
                validation={{ required: 'Erforderlich' }} 
              />
            </div>

            <InputField 
              label="System-Passwort festlegen" 
              icon={Lock} 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              register={register} 
              errors={errors} 
              validation={{ 
                required: 'Passwort erforderlich', 
                minLength: { value: 8, message: 'Min. 8 Zeichen' } 
              }} 
            />

            <InputField 
              label="Passwort bestätigen" 
              icon={CheckCircle} 
              name="confirmPassword" 
              type="password" 
              placeholder="••••••••" 
              register={register} 
              errors={errors} 
              validation={{ 
                validate: (val: string) => val === password || 'Passwörter stimmen nicht übere' 
              }} 
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full justify-center shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <>Konto aktivieren</>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-50 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              GlanzOps Security &bull; Encrypted Session
            </p>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-center text-[11px] text-slate-400 font-bold uppercase tracking-wide">
            Probleme? <Link to="/support" className="text-blue-600 hover:text-blue-700 ml-1 transition-colors">Support kontaktieren</Link>
        </p>
      </div>
    </div>
  );
}