import { AlertTriangle, CheckCircle2, Loader2, PenTool } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import api from '../../lib/api';

export default function PublicSignPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [contractData, setContractData] = useState<any>(null);
  const [sigPad, setSigPad] = useState<SignatureCanvas | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Öffentliche Daten laden (ohne Auth!)
    api.get(`/contracts/public/${token}`)
      .then(res => setContractData(res.data))
      .catch(() => setError('Dieser Link ist ungültig oder abgelaufen.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!sigPad || sigPad.isEmpty()) return alert("Bitte unterschreiben Sie zuerst.");
    
    setIsSubmitting(true);
    const signatureImage = sigPad.getTrimmedCanvas().toDataURL('image/png');

    try {
      await api.post(`/contracts/public/${token}/sign`, { signatureImage });
      setSuccess(true);
    } catch (e) {
      alert("Fehler beim Speichern. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
            <AlertTriangle size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Link ungültig</h1>
        <p className="text-slate-500 max-w-md">{error}</p>
    </div>
  );

  if (success) return (
    <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-emerald-50">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-xl shadow-emerald-200">
            <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Vielen Dank!</h1>
        <p className="text-slate-600 max-w-md">Der Vertrag wurde erfolgreich unterschrieben und ist nun aktiv. Wir freuen uns auf die Zusammenarbeit.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 flex items-center justify-center">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="bg-slate-900 text-white p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <PenTool size={24} />
                </div>
                <h1 className="text-lg font-bold uppercase tracking-widest">Vertrag signieren</h1>
                <p className="text-sm text-slate-400 mt-1">Bitte bestätigen Sie den Auftrag.</p>
            </div>

            <div className="p-6 space-y-6">
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kunde</div>
                        <div className="font-bold text-slate-800">{contractData.customerName}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Leistung</div>
                        <div className="font-bold text-blue-600">{contractData.serviceName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{contractData.serviceDescription}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start</div>
                            <div className="font-bold text-slate-700">{new Date(contractData.startDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Zyklus</div>
                            <div className="font-bold text-slate-700">{contractData.interval}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ihre Unterschrift</div>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 relative h-40 group hover:border-blue-400 transition-colors">
                        <SignatureCanvas 
                            penColor="black"
                            canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                            ref={(ref) => setSigPad(ref)}
                        />
                        <div className="absolute top-2 right-2 opacity-50 pointer-events-none text-[9px] uppercase font-bold text-slate-400">Hier zeichnen</div>
                    </div>
                    <button onClick={() => sigPad?.clear()} className="text-xs text-slate-400 font-bold hover:text-red-500 underline decoration-dotted">Neu zeichnen</button>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-primary w-full !bg-blue-600 !py-4 shadow-xl shadow-blue-500/20 text-xs font-black uppercase tracking-widest"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Vertrag rechtskräftig schließen'}
                </button>
            </div>
        </div>
    </div>
  );
}