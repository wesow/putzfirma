import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function PublicSignPage() {
    const { token } = useParams();
    const sigCanvas = useRef<any>({});
    
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Vertragsdaten laden (ohne Login!)
        api.get(`/contracts/public/${token}`)
           .then(res => setContract(res.data))
           .catch(() => toast.error("Link ungültig oder abgelaufen"))
           .finally(() => setLoading(false));
    }, [token]);

    const handleSign = async () => {
        if (sigCanvas.current.isEmpty()) return toast.error("Bitte unterschreiben");
        
        const img = sigCanvas.current.getCanvas().toDataURL('image/png');
        
        try {
            await api.post(`/contracts/public/${token}/sign`, { signatureImage: img });
            setSuccess(true);
        } catch (e) {
            toast.error("Fehler beim Speichern");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
    if (!contract) return <div className="h-screen flex items-center justify-center text-red-500 font-bold">Link ungültig.</div>;
    if (success) return (
        <div className="h-screen flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 p-6 text-center">
            <CheckCircle size={64} className="mb-4"/>
            <h1 className="text-3xl font-black mb-2">Vielen Dank!</h1>
            <p>Der Vertrag wurde erfolgreich unterschrieben und ist nun aktiv.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-[2rem] shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                    <ShieldCheck size={32} />
                </div>
                
                <h1 className="text-2xl font-black text-slate-900 mb-2">Vertrag unterzeichnen</h1>
                <p className="text-slate-500 text-sm mb-8">Für <strong>{contract.customerName}</strong></p>

                <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6 border border-slate-100">
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Leistung</span>
                        <span className="font-bold text-slate-800">{contract.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Turnus</span>
                        <span className="font-bold text-slate-800">{contract.interval}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Preis</span>
                        <span className="font-bold text-slate-800">{Number(contract.price).toFixed(2)} €</span>
                    </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white mb-6 overflow-hidden">
                    <SignatureCanvas 
                        ref={sigCanvas} 
                        penColor="black"
                        canvasProps={{ width: 400, height: 200, className: 'cursor-crosshair w-full' }} 
                    />
                    <p className="text-[9px] text-slate-300 uppercase font-black py-1">Hier unterschreiben</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => sigCanvas.current.clear()} className="btn-secondary flex-1">Neu</button>
                    <button onClick={handleSign} className="btn-primary flex-1 shadow-xl shadow-blue-200">
                        Jetzt rechtskräftig unterschreiben
                    </button>
                </div>
            </div>
        </div>
    );
}