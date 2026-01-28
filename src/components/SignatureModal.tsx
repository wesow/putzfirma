import { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Eraser, CheckCircle, Loader2, PenTool } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

interface Props {
    contractId: string;
    customerName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function SignatureModal({ contractId, customerName, onClose, onSuccess }: Props) {
    const sigCanvas = useRef<any>({});
    const [isSaving, setIsSaving] = useState(false);

    const clear = () => sigCanvas.current.clear();

    const save = async () => {
        if (sigCanvas.current.isEmpty()) {
            return toast.error("Bitte zuerst unterschreiben.");
        }

        setIsSaving(true);
        // Das Bild als Base64 String holen
        // Wir nutzen 'getCanvas()' statt 'getTrimmedCanvas()', um den Vite-Fehler zu umgehen
const signatureImage = sigCanvas.current.getCanvas().toDataURL('image/png');

        try {
            await api.post(`/contracts/${contractId}/sign`, { signatureImage });
            toast.success("Vertrag rechtskräftig unterschrieben!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Speichern fehlgeschlagen.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content !max-w-lg animate-in zoom-in-95">
                <div className="modal-header bg-slate-900 text-white">
                    <div className="flex items-center gap-3">
                        <PenTool size={20} />
                        <div>
                            <h3 className="font-bold text-lg leading-none">Vertrag unterzeichnen</h3>
                            <p className="text-[10px] opacity-70 mt-1">Kunde: {customerName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:text-red-400 transition"><X /></button>
                </div>

                <div className="modal-body p-6 text-center space-y-4">
                    <p className="text-sm text-slate-500 font-medium">
                        Bitte unterschreiben Sie in dem Feld unten:
                    </p>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 hover:border-blue-400 transition-colors relative">
                        <SignatureCanvas 
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{
                                width: 450, 
                                height: 200, 
                                className: 'cursor-crosshair active:cursor-none'
                            }} 
                        />
                        <div className="absolute bottom-2 right-2 text-[9px] text-slate-300 pointer-events-none uppercase tracking-widest font-black">
                            Digitale Signatur
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={clear} className="btn-secondary flex-1" disabled={isSaving}>
                            <Eraser size={16} /> Neu
                        </button>
                        <button onClick={save} className="btn-primary flex-1 shadow-xl shadow-blue-500/20" disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Unterschreiben</>}
                        </button>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 mt-2">
                        Mit der Unterschrift akzeptieren Sie die AGB und den Leistungsumfang.
                    </p>
                </div>
            </div>
        </div>
    );
}