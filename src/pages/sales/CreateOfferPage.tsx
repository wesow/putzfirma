import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, ArrowLeft, Euro, Briefcase, Tag, Loader2, ListTodo, 
  Plus, Sparkles, Layers, Trash2, User, MapPin, Clock, Repeat,
  ChevronLeft, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

export default function CreateOfferPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [availableAddresses, setAvailableAddresses] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    addressId: '',
    description: '',
    price: '',
    quantity: '1',
    interval: 'WEEKLY',
    preferredTime: '08:00'
  });
  
  const [checklist, setChecklist] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resCust, resServ] = await Promise.all([
          api.get('/customers'),
          api.get('/services')
        ]);
        setCustomers(resCust.data);
        setServices(resServ.data);
      } catch (e) {
        toast.error("Stammdaten konnten nicht geladen werden.");
      }
    };
    loadData();
  }, []);

  // Adressen laden, wenn Kunde gewählt wird
  useEffect(() => {
    if (formData.customerId) {
      const cust = customers.find(c => c.id === formData.customerId);
      setAvailableAddresses(cust?.addresses || []);
    }
  }, [formData.customerId, customers]);

  // Template Logik: Importiert Preis, Beschreibung UND Checkliste
  const applyServiceTemplate = (serviceId: string) => {
    const s = services.find(srv => srv.id === serviceId);
    if (!s) return;

    setFormData(prev => ({
      ...prev,
      description: s.name,
      price: s.priceNet.toString()
    }));

    // Checkliste importieren (Parsen falls String)
    let importedChecklist = [];
    try {
      importedChecklist = typeof s.checklist === 'string' 
        ? JSON.parse(s.checklist) 
        : (s.checklist || []);
    } catch (e) {
      importedChecklist = [];
    }
    
    setChecklist(importedChecklist);
    toast.success("Leistungsdaten & Checkliste importiert", { icon: '✨' });
  };

  const addChecklistItem = () => {
    if (!newItem.trim()) return;
    setChecklist([...checklist, newItem.trim()]);
    setNewItem('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.description) return toast.error("Pflichtfelder fehlen");

    setLoading(true);
    const tid = toast.loading('Angebot wird generiert...');
    try {
      await api.post('/offers', {
        customerId: formData.customerId,
        addressId: formData.addressId || undefined,
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        interval: formData.interval,
        preferredTime: formData.preferredTime,
        // Checkliste wird als Teil der Metadaten oder Items gesendet
        checklist: checklist, 
        items: [{
          description: formData.description,
          quantity: parseFloat(formData.quantity),
          unit: 'Psch',
          unitPrice: parseFloat(formData.price.replace(',', '.'))
        }]
      });
      toast.success('Angebot erfolgreich erstellt', { id: tid });
      navigate('/dashboard/offers');
    } catch (err) {
      toast.error('Fehler beim Speichern', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      
      {/* --- HEADER --- */}
      <div className="header-section">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/offers')} className="btn-secondary !p-2">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="page-title text-base">Neues Angebot erstellen</h1>
            <p className="page-subtitle">Kalkulation und operative Planung für den Kunden.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        {/* --- TEMPLATE SELECTOR --- */}
        <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/20 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <Sparkles size={20} className="text-blue-200" />
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider">Katalog-Import</h4>
              <p className="text-[10px] text-blue-100 font-medium">Leistung wählen, um Preis & Checkliste zu laden</p>
            </div>
          </div>
          <select 
            className="input-standard !w-full lg:!w-72 !bg-white/10 !border-white/20 !text-white font-bold cursor-pointer"
            onChange={(e) => applyServiceTemplate(e.target.value)}
            defaultValue=""
          >
            <option value="" className="text-slate-900">Leistung aus Katalog wählen...</option>
            {services.map(s => (
              <option key={s.id} value={s.id} className="text-slate-900">{s.name}</option>
            ))}
          </select>
        </div>

        <div className="content-grid lg:grid-cols-12 gap-4">

          {/* --- LINKS: KUNDE & KALKULATION --- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="form-card">
              <div className="form-section-title"><User size={14} /> 1. Empfänger & Objekt</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-caps">Kunde *</label>
                  <select 
                    className="input-standard font-bold" 
                    value={formData.customerId} 
                    onChange={e => setFormData({...formData, customerId: e.target.value})}
                    required
                  >
                    <option value="">Kunde wählen...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-caps">Einsatzort / Adresse</label>
                  <select 
                    className="input-standard" 
                    value={formData.addressId} 
                    onChange={e => setFormData({...formData, addressId: e.target.value})}
                    disabled={!formData.customerId}
                  >
                    <option value="">Hauptadresse (Rechnung)</option>
                    {availableAddresses.map(a => <option key={a.id} value={a.id}>{a.street}, {a.city}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="form-section-title"><Euro size={14} /> 2. Leistung & Preis</div>
              <div className="space-y-4">
                <div>
                  <label className="label-caps">Angebotstext (Leistung) *</label>
                  <input 
                    className="input-standard font-bold" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="z.B. Glasreinigung inklusive Rahmen"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="label-caps">Menge</label>
                    <input 
                      type="number" 
                      className="input-standard font-bold text-center" 
                      value={formData.quantity} 
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-caps text-blue-600">Einzelpreis Netto (€)</label>
                    <div className="relative">
                      <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input 
                        type="number" 
                        step="0.01" 
                        className="input-standard pl-9 font-black text-blue-700" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-card">
              <div className="form-section-title"><Clock size={14} /> 3. Turnus & Planung</div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'].map(int => (
                  <button 
                    key={int} 
                    type="button" 
                    onClick={() => setFormData({...formData, interval: int})}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${formData.interval === int ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                  >
                    {int === 'ONCE' ? 'Einmalig' : int === 'WEEKLY' ? 'Wöchentlich' : int === 'BIWEEKLY' ? '14-tägig' : 'Monatlich'}
                  </button>
                ))}
              </div>
              <div>
                <label className="label-caps">Gewünschte Startzeit</label>
                <div className="relative w-32">
                  <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="time" className="input-standard pl-8 font-bold" value={formData.preferredTime} onChange={e => setFormData({...formData, preferredTime: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          {/* --- RECHTS: OPTIONALE CHECKLISTE --- */}
          <div className="lg:col-span-5">
            <div className="form-card h-full border-l-2 border-l-blue-500 flex flex-col">
              <div className="form-section-title flex justify-between items-center w-full">
                <div className="flex items-center gap-2"><ListTodo size={14} /> 4. Leistungsverzeichnis</div>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded italic">Optional</span>
              </div>
              
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                Diese Punkte werden dem Kunden im Angebot angezeigt und dem Mitarbeiter später als Aufgabe zugewiesen.
              </p>

              <div className="flex gap-2 mb-4">
                <input 
                  placeholder="Aufgabe hinzufügen..." 
                  className="input-standard flex-1" 
                  value={newItem} 
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                />
                <button type="button" onClick={addChecklistItem} className="btn-primary !p-2 shrink-0"><Plus size={18}/></button>
              </div>

              <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar max-h-[500px] pr-1">
                {checklist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-50 rounded-xl bg-slate-50/30">
                    <Info size={20} className="text-slate-200 mb-2" />
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest text-center">Keine spezifischen<br/>Aufgaben gelistet</p>
                  </div>
                ) : (
                  checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400 shrink-0">{idx + 1}</div>
                        <span className="text-xs font-semibold text-slate-700 truncate">{item}</span>
                      </div>
                      <button type="button" onClick={() => setChecklist(checklist.filter((_, i) => i !== idx))} className="p-1 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- FIXED FOOTER --- */}
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[450px] z-50">
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xl flex items-center gap-2">
            <button type="button" onClick={() => navigate('/dashboard/offers')} className="flex-1 px-4 py-2.5 rounded-xl text-slate-500 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors">Abbrechen</button>
            <button type="submit" disabled={loading} className="btn-primary flex-[2] py-2.5 shadow-lg shadow-blue-600/20">
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Angebot finalisieren</>}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}