import { Clock, Link as LinkIcon, Loader2, Mail, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  token: string;
}

export default function InviteStatusCard() {
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const res = await api.get('/auth/invitations/pending');
      setInvites(res.data);
    } catch (error) {
      console.error("Fehler beim Laden der Einladungen");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Registrierungslink kopiert!", {
      icon: '🔗',
      style: { borderRadius: '12px', background: '#333', color: '#fff' }
    });
  };

  const deleteInvite = async (id: string) => {
    if (!window.confirm("Möchten Sie diese Einladung wirklich stornieren? Der Link wird sofort ungültig.")) return;
    try {
      await api.delete(`/auth/invitations/${id}`);
      setInvites(invites.filter(i => i.id !== id));
      toast.success("Einladung storniert.");
    } catch (e) {
      toast.error("Stornierung fehlgeschlagen.");
    }
  };

  if (loading) return (
    <div className="flex justify-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm mb-8">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );
  
  if (invites.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* HEADER UNIT */}
      <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/30">
        <div className="text-left">
            <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-base">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                    <Send size={18} />
                </div>
                Ausstehende Onboardings
            </h3>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 ml-11">
              Warten auf Account-Aktivierung durch Mitarbeiter
            </p>
        </div>
        <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-200 ml-11 sm:ml-0">
          {invites.length} OFFEN
        </span>
      </div>

      {/* LIST UNIT */}
      <div className="divide-y divide-slate-50">
        {invites.map((invite) => {
          const isExpired = new Date(invite.expiresAt) < new Date();
          return (
            <div key={invite.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-blue-50/30 transition-all group">
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${isExpired ? 'bg-red-50 text-red-500' : 'bg-white border border-slate-100 text-blue-500'}`}>
                  <Mail size={24} className={isExpired ? "" : "group-hover:scale-110 transition-transform"} />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="font-black text-slate-800 text-base truncate">{invite.email}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                      {invite.role}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight ${isExpired ? 'text-red-500' : 'text-slate-400'}`}>
                      <Clock size={14} className={isExpired ? "animate-pulse" : ""} />
                      {isExpired ? 'LINK ABGELAUFEN' : `GÜLTIG BIS: ${new Date(invite.expiresAt).toLocaleDateString('de-DE')}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => copyLink(invite.token)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 bg-white border border-slate-200 px-6 py-3 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                >
                  <LinkIcon size={14} /> Link kopieren
                </button>
                <button 
                  onClick={() => deleteInvite(invite.id)}
                  className="p-3 text-slate-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                  title="Einladung stornieren"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER INFO */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Sicherheitsprotokoll: Einladungen sind maximal 7 Tage gültig
          </p>
      </div>
    </div>
  );
}