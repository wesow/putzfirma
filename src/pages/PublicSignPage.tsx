import { CheckCircle, Eraser, Info, Loader2, PenTool, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import api from '../lib/api';

export default function PublicSignPage() {
    const { token } = useParams();
    const sigCanvas = useRef<any>({});
    
    const [contract, setContract] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Vertragsdaten laden (ohne Auth)
        api.get(`/contracts/public/${token}`)
           .then(res => setContract(res.data))
           .catch(() => toast.error("Dieser Link ist ungültig oder bereits abgelaufen."))
           .finally(() => setLoading(false));
    }, [token]);

    const handleSign = async () => {
        if (sigCanvas.current.isEmpty()) return toast.error("Bitte zeichnen Sie Ihre Unterschrift in das Feld.");
        
        setIsSubmitting(true);
        const img = sigCanvas.current.getCanvas().toDataURL('image/png');
        
        try {
            await api.post(`/contracts/public/${token}/sign`, { signatureImage: img });
            setSuccess(true);
            toast.success("Vertrag erfolgreich unterzeichnet");
        } catch (e) {
            toast.error("Fehler beim Speichern der Unterschrift.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Dokument wird geladen...</span>
        </div>
    );

    if (!contract) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                <Info size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Link nicht mehr gültig</h1>
            <p className="text-slate-500 text-sm max-w-xs">Dieser Link ist abgelaufen oder die Unterschrift wurde bereits geleistet.</p>
        </div>
    );

    if (success) return (
        <div className="h-screen flex flex-col items-center justify-center bg-emerald-50 p-6 text-center animate-in fade-in duration-700">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
                <CheckCircle size={40} />
            </div>
            <h1 className="text-3xl font-black text-emerald-900 mb-2 tracking-tight">Vielen Dank!</h1>
            <p className="text-emerald-700 font-medium max-w-sm">Der Vertrag wurde rechtskräftig unterzeichnet. Sie können dieses Fenster nun schließen.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
                
                {/* BRANDING & HEADER */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight text-center">Vertrag digital unterzeichnen</h1>
                    <p className="text-[12px] text-slate-500 font-medium mt-1">ID: {contract.contractNumber || token?.substring(0, 8)}</p>
                </div>

                <div className="form-card shadow-2xl shadow-slate-200/60 overflow-hidden">
                    {/* DETAILS BOX */}
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <label className="label-caps !ml-0 mb-3 block">Vertragsdetails</label>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase">Auftraggeber</span>
                                <span className="text-sm font-bold text-slate-800">{contract.customerName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-400 uppercase">Leistung</span>
                                <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase italic">
                                    {contract.serviceName}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter italic">Turnus: {contract.interval}</span>
                                <span className="text-base font-black text-slate-900">{Number(contract.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* SIGNATURE AREA */}
                    <div className="p-6">
                        <label className="label-caps !ml-0 mb-3 flex items-center gap-2">
                            <PenTool size={12} className="text-blue-500" /> Unterschrift leisten
                        </label>
                        
                        <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-white group hover:border-blue-300 transition-colors overflow-hidden">
                            <SignatureCanvas 
                                ref={sigCanvas} 
                                penColor="black"
                                canvasProps={{ 
                                    className: 'w-full h-48 cursor-crosshair'
                                }} 
                            />
                            <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Hier unterschreiben</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
                            <button 
                                onClick={() => sigCanvas.current.clear()} 
                                className="sm:col-span-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-bold text-[11px] uppercase tracking-wider border border-transparent hover:border-red-100"
                            >
                                <Eraser size={14} /> Leeren
                            </button>
                            
                            <button 
                                onClick={handleSign} 
                                disabled={isSubmitting}
                                className="sm:col-span-3 btn-primary !py-3 justify-center shadow-lg shadow-blue-500/20 font-black uppercase tracking-[0.1em] text-[11px]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>Rechtsverbindlich unterzeichnen</>
                                )}
                            </button>
                        </div>

                        <div className="mt-6 flex gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <ShieldCheck size={20} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-blue-800 leading-normal font-medium">
                                Mit der Unterzeichnung akzeptieren Sie die vereinbarten Konditionen. 
                                Diese digitale Signatur ist gemäß eIDAS-Verordnung rechtsgültig.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    &copy; 2026 GlanzOps Security &bull; SSL Verschlüsselt
                </p>
            </div>
        </div>
    );
}