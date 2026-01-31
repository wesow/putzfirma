import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Euro, Package, Hash, Loader2, Layers, 
  AlertTriangle, ChevronLeft, X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function CreateInventoryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    stock: 0,
    minStock: 5,
    costPrice: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('Artikel wird angelegt...');
    try {
      await api.post('/inventory', {
        ...formData,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        costPrice: parseFloat(formData.costPrice.replace(',', '.'))
      });
      toast.success('Artikel erfolgreich erstellt', { id: tid });
      navigate('/dashboard/inventory');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Fehler beim Speichern', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION (FULL WIDTH) --- */}
      <div className="header-section">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/inventory')} 
            className="btn-secondary !p-2"
            title="Zurück zur Übersicht"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Neuen Artikel erfassen</h1>
            <p className="page-subtitle">Lagerbestand und Warnschwellen für das Sortiment definieren.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                Inventur-Modus
            </span>
        </div>
      </div>

      {/* --- FORM SECTION (FULL WIDTH GRID) --- */}
      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        <div className="content-grid lg:grid-cols-12 gap-4 w-full">
          
          {/* LINKS: BASIS DATEN (7 Spalten) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="form-card h-full">
              <div className="form-section-title">
                <Layers size={14} /> 1. Produkt-Informationen
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="label-caps">Vollständige Artikelbezeichnung *</label>
                  <div className="relative group">
                    <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required 
                      className="input-standard pl-10 font-bold text-sm" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="z.B. Microfasertuch Blau 40x40cm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="label-caps">SKU / Interne Referenz</label>
                    <div className="relative">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        className="input-standard pl-10 font-mono text-[11px]" 
                        value={formData.sku} 
                        onChange={e => setFormData({...formData, sku: e.target.value})} 
                        placeholder="REF-001-BL" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="label-caps text-blue-600">Einkaufspreis Netto pro Einheit</label>
                    <div className="relative">
                      <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="text"
                        className="input-standard pl-10 font-black text-blue-700" 
                        value={formData.costPrice} 
                        onChange={e => setFormData({...formData, costPrice: e.target.value})} 
                        placeholder="0,00" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2">
                   <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                     * Pflichtfelder müssen ausgefüllt werden. Der Einkaufspreis wird für die Berechnung des gesamten Lagerwertes im Finanz-Dashboard herangezogen.
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTS: BESTAND & WARNUNGEN (5 Spalten) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="form-card h-full border-l-2 border-l-blue-600">
              <div className="form-section-title">
                <AlertTriangle size={14} /> 2. Lagerbestand & Schwellenwerte
              </div>
              
              <div className="space-y-6 pt-2">
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                   <label className="label-caps !text-blue-600">Aktueller Lagerbestand</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        className="input-standard !bg-white font-black text-center text-lg py-2" 
                        value={formData.stock} 
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Einheiten</span>
                   </div>
                </div>

                <div className="p-4 bg-red-50/30 rounded-xl border border-red-100">
                   <label className="label-caps !text-red-600">Mindestbestand (Meldeschwelle)</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        className="input-standard !bg-white font-black text-center text-lg py-2 border-red-200 focus:border-red-500 focus:ring-red-500/10" 
                        value={formData.minStock} 
                        onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} 
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Einheiten</span>
                   </div>
                   <p className="text-[10px] text-red-400 mt-3 font-semibold flex items-center gap-1.5 uppercase">
                     <AlertTriangle size={12} /> Automatischer Warnhinweis bei Unterschreitung
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FLOATING ACTION FOOTER --- */}
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[450px] z-50">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/inventory')} 
              className="flex-1 px-4 py-2.5 rounded-xl text-slate-500 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-[2] py-2.5 shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <><Save size={16} /> Artikel im System anlegen</>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}