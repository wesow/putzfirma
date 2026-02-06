import {
  AlertTriangle,
  ChevronLeft,
  Euro,
  Hash,
  Layers,
  Loader2,
  Package,
  Save
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
    <div className="page-container pb-safe">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/inventory')} 
            className="btn-secondary !p-1.5"
            title="Zurück"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="page-title text-base">Neuer Artikel</h1>
            <p className="page-subtitle">Sortiment und Bestandsregeln definieren.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                Inventur-Modus
            </span>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-40">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LINKS: BASIS DATEN */}
          <div className="lg:col-span-7 space-y-4">
            <div className="form-card h-full">
              <div className="form-section-title">
                <Layers size={14} className="text-blue-500" /> 1. Produkt-Details
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="label-caps !ml-0">Artikelbezeichnung *</label>
                  <div className="relative group">
                    <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                      required 
                      className="input-standard pl-10 font-bold" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="z.B. Microfasertuch Blau" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="label-caps !ml-0">SKU / Referenz</label>
                    <div className="relative group">
                      <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        className="input-standard pl-10 font-mono text-[11px] font-bold" 
                        value={formData.sku} 
                        onChange={e => setFormData({...formData, sku: e.target.value})} 
                        placeholder="REF-001" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="label-caps !ml-0 text-blue-600">Einkaufspreis Netto (€)</label>
                    <div className="relative group">
                      <Euro size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input 
                        type="text"
                        className="input-standard pl-10 font-black text-emerald-700" 
                        value={formData.costPrice} 
                        onChange={e => setFormData({...formData, costPrice: e.target.value})} 
                        placeholder="0,00" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTS: BESTAND */}
          <div className="lg:col-span-5 space-y-4">
            <div className="form-card h-full border-l-[3px] border-l-blue-600">
              <div className="form-section-title">
                <AlertTriangle size={14} className="text-blue-600" /> 2. Bestandsführung
              </div>
              
              <div className="space-y-5 pt-2">
                <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100">
                   <label className="label-caps !text-blue-700 !ml-0 mb-2 block">Anfangsbestand</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        className="input-standard !bg-white font-black text-center text-lg !py-2.5 shadow-sm" 
                        value={formData.stock} 
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})} 
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Einheiten</span>
                   </div>
                </div>

                <div className="p-4 bg-red-50/30 rounded-xl border border-red-100">
                   <label className="label-caps !text-red-700 !ml-0 mb-2 block">Meldebestand</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        className="input-standard !bg-white font-black text-center text-lg !py-2.5 border-red-100 focus:ring-red-500/10 shadow-sm" 
                        value={formData.minStock} 
                        onChange={e => setFormData({...formData, minStock: Number(e.target.value)})} 
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">Einheiten</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FIXED FOOTER MIT KORREKTEM Z-INDEX & ABSTAND --- */}
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 pointer-events-auto animate-in slide-in-from-bottom-2">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/inventory')} 
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              Abbrechen
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary flex-[2] md:flex-none py-2.5 px-8 shadow-lg shadow-blue-600/20 min-w-[160px] text-[11px] uppercase tracking-widest font-black"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <><Save size={16} /> Speichern</>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}