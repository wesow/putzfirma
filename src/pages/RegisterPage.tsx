import { AlertCircle, ArrowRight, CheckCircle, Loader2, Lock, User, Sparkles, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api'; 
import { registerWithInvite } from '../services/auth.service';

const InputField = ({ label, icon: Icon, name, type = "text", placeholder, register, validation, errors }: any) => (
  <div className="space-y-1.5 text-left">
    <label className="label-caps !ml-0">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        {...register(name, validation)}
        autoComplete={type === "password" ? "new-password" : "off"} 
        className={`input-standard pl-12 py-3.5 font-bold ${
          errors[name] ? 'border-red-300 focus:ring-red-200' : ''
        }`}
        placeholder={placeholder}
      />
    </div>
    {errors[name] && (
      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1 block">
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
    const toastId = toast.loading("Account wird im System konfiguriert...");
    
    try {
      await registerWithInvite({
        token: token!,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      toast.success('Konto erfolgreich aktiviert!', { id: toastId });
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
        <Loader2 className="animate-spin text-blue-600 mb-4" size={44} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Validierung läuft...</p>
      </div>
    );
  }

  // FEHLER-ZUSTAND: UNGÜLTIGER TOKEN
  if (!token || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 font-sans bg-dot-pattern">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl shadow-slate-200 border border-white text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto bg-red-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-red-100">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Sicherheits-Fehler</h2>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium">
            Dieser Aktivierungslink ist ungültig, abgelaufen oder wurde bereits verarbeitet.
          </p>
          <Link 
            to="/login" 
            className="btn-primary w-full !py-5 justify-center shadow-xl shadow-blue-500/20 uppercase tracking-[0.2em] font-black text-[10px]"
          >
            Zur Anmeldung <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // REGISTRIERUNGS-FORMULAR
  return (
    <div className="min-h-screen flex flex-col justify-center py-16 px-6 bg-slate-50 font-sans bg-dot-pattern overflow-hidden">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="inline-flex justify-center mb-10 bg-blue-600 p-4 rounded-[2rem] shadow-2xl shadow-blue-600/30 animate-bounce-slow">
          <ShieldCheck className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Identität verifizieren</h2>
        <p className="text-slate-500 font-medium text-lg">
          Willkommen bei GlanzOps. Erstellen Sie Ihr Profil für <br/>
          <span className="text-blue-600 font-black decoration-blue-200 underline underline-offset-4">{inviteData?.email}</span>
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-12 px-10 shadow-2xl shadow-slate-200 rounded-[3rem] border border-white animate-in slide-in-from-bottom-10 duration-700 relative">
          
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={80} className="text-blue-600" />
          </div>

          <form className="space-y-8 relative z-10" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="grid grid-cols-2 gap-6">
              <InputField 
                label="Vorname" 
                icon={User} 
                name="firstName" 
                placeholder="z.B. Max" 
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
                required: 'Bitte wählen Sie ein Passwort', 
                minLength: { value: 8, message: 'Mindestens 8 Zeichen' } 
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
                validate: (val: string) => val === password || 'Passwörter nicht identisch' 
              }} 
            />

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full !py-5 justify-center shadow-2xl shadow-blue-600/30 uppercase tracking-[0.2em] font-black text-[11px]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>Konto jetzt aktivieren</>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-12 text-center border-t border-slate-50 pt-8">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
              GlanzOps Security &bull; Encrypted Session
            </p>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            Probleme beim Login? <Link to="/support" className="text-blue-500 hover:text-blue-600 ml-1">Support kontaktieren</Link>
        </p>
      </div>
    </div>
  );
}