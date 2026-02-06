import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    Clock,
    FileText,
    Loader2,
    MapPin,
    Repeat,
    Save,
    Search,
    ShieldCheck,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

// --- TYPEN ---
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string | null;
  addresses: { id: string; street: string; city: string; zipCode: string }[];
}

interface Service {
  id: string;
  name: string;
  priceNet: number;
}

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Data States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    addressId: '', 
    serviceId: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    interval: 'WEEKLY',
    endDate: ''
  });

  // --- 1. DATEN LADEN ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, servRes] = await Promise.all([
          api.get('/customers'),
          api.get('/services')
        ]);
        setCustomers(custRes.data);
        setServices(servRes.data);
      } catch (e) {
        toast.error("Stammdaten konnten nicht geladen werden.");
      } finally {
        setDataLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. ADRESSEN FILTERN ---
  useEffect(() => {
    if (formData.customerId) {
        const cust = customers.find(c => c.id === formData.customerId);
        setCustomerAddresses(cust?.addresses || []);
        setFormData(prev => ({...prev, addressId: ''}));
    } else {
        setCustomerAddresses([]);
    }
  }, [formData.customerId, customers]);

  // --- 3. SPEICHERN ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.addressId) return toast.error("Bitte eine Objekt-Adresse wählen.");

    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
        return toast.error("Laufzeit-Ende darf nicht vor dem Start liegen.");
    }

    setLoading(true);
    const toastId = toast.loading('Vertrag wird angelegt...');
    
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      
      let endDateTime = null;
      if (formData.endDate && formData.interval !== 'ONCE') {
          endDateTime = new Date(formData.endDate);
          endDateTime.setHours(23, 59, 59);
      }

      await api.post('/contracts', {
        customerId: formData.customerId,
        serviceId: formData.serviceId,
        addressId: formData.addressId,
        startDate: startDateTime.toISOString(),
        interval: formData.interval,
        endDate: endDateTime ? endDateTime.toISOString() : null,
        quantity: 1
      });

      toast.success(formData.interval === 'ONCE' ? 'Einmal-Auftrag erstellt!' : 'Dauerauftrag aktiviert!', { id: toastId });
      navigate('/dashboard/contracts');

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Fehler beim Speichern.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Filter Logik
  const filteredCustomers = customers.filter(c => {
      const search = customerSearch.toLowerCase();
      return (
          c.lastName.toLowerCase().includes(search) ||
          c.firstName.toLowerCase().includes(search) ||
          (c.companyName && c.companyName.toLowerCase().includes(search))
      );
  });

  if (dataLoading) return <div className="page-container flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  const isOneTime = formData.interval === 'ONCE';

  return (
    <div className="page-container pb-safe">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/contracts')} 
            className="btn-secondary !p-1.5"
            title="Zurück"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="page-title text-base">Service planen</h1>
            <p className="page-subtitle">Wiederkehrende Zyklen oder Einzelaufträge.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* --- LINKS: KUNDE & SERVICE --- */}
            <div className="lg:col-span-7 space-y-4">
                
                {/* 1. KUNDENWAHL */}
                <div className="form-card">
                    <div className="form-section-title">
                        <User size={14} className="text-blue-500" /> 1. Kunde & Objekt
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="label-caps !ml-0">Vertragspartner *</label>
                            
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2">
                                <div className="relative mb-2">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <input 
                                        type="text"
                                        placeholder="Kunden suchen..."
                                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 text-xs font-bold focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                    />
                                </div>
                                <div className="relative group">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <select
                                        required
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                                        className="input-standard pl-10 appearance-none cursor-pointer bg-white font-bold !py-2"
                                    >
                                        <option value="">-- Bitte wählen ({filteredCustomers.length}) --</option>
                                        {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="label-caps !ml-0">Leistungsort (Adresse) *</label>
                            <div className="relative group">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <select 
                                    required
                                    className={`input-standard pl-10 appearance-none cursor-pointer font-bold ${!formData.customerId ? 'bg-slate-50 text-slate-400 opacity-50' : ''}`}
                                    value={formData.addressId}
                                    onChange={(e) => setFormData({...formData, addressId: e.target.value})}
                                    disabled={!formData.customerId || customerAddresses.length === 0}
                                >
                                    <option value="">
                                        {formData.customerId 
                                            ? (customerAddresses.length > 0 ? "-- Objekt wählen --" : "-- Keine Adresse hinterlegt --") 
                                            : "-- Zuerst Kunde wählen --"
                                        }
                                    </option>
                                    {customerAddresses.map(a => <option key={a.id} value={a.id}>{a.street}, {a.zipCode} {a.city}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. SERVICE */}
                <div className="form-card">
                    <div className="form-section-title">
                        <FileText size={14} className="text-blue-500" /> 2. Dienstleistung
                    </div>
                    <div className="space-y-1.5">
                        <label className="label-caps !ml-0">Service-Paket aus Katalog *</label>
                        <div className="relative group">
                            <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <select 
                                required
                                className="input-standard pl-10 appearance-none cursor-pointer font-bold"
                                value={formData.serviceId}
                                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                            >
                                <option value="">-- Leistung wählen --</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({Number(s.priceNet || 0).toFixed(2)} €)</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RECHTS: ZEITPLAN --- */}
            <div className="lg:col-span-5 space-y-4">
                
                <div className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                    isOneTime 
                    ? 'bg-slate-900 border-slate-950 text-white shadow-lg' 
                    : 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/20'
                }`}>
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                            {isOneTime ? <CheckCircle2 size={18} /> : <Repeat size={18} />}
                        </div>
                        <div>
                            <h4 className="font-black text-[11px] uppercase tracking-widest mb-1">{isOneTime ? 'Einmal-Auftrag' : 'Dauer-Vertrag'}</h4>
                            <p className="text-[10px] leading-tight opacity-80 font-medium">
                                {isOneTime 
                                    ? "Es wird genau ein Termin im Kalender erstellt." 
                                    : "Das System generiert automatisch Folgetermine."
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="form-card border-t-[3px] border-t-slate-900">
                    <div className="form-section-title">
                        <Calendar size={14} /> 3. Zeitplanung
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="label-caps !ml-0">Wiederholung</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: 'ONCE', label: 'Einmalig' },
                                    { id: 'WEEKLY', label: 'Wöchentlich' },
                                    { id: 'BIWEEKLY', label: '14-tägig' },
                                    { id: 'MONTHLY', label: 'Monatlich' },
                                ].map(opt => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setFormData({...formData, interval: opt.id, endDate: opt.id === 'ONCE' ? '' : formData.endDate})}
                                        className={`cursor-pointer p-2.5 rounded-lg border-2 text-center transition-all ${
                                            formData.interval === opt.id 
                                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                            : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="text-[9px] font-black uppercase tracking-widest">{opt.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="label-caps !ml-0">{isOneTime ? 'Datum' : 'Startdatum'}</label>
                                <div className="relative group">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input required type="date" className="input-standard pl-10 font-bold" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="label-caps !ml-0">Uhrzeit</label>
                                <div className="relative group">
                                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input required type="time" className="input-standard pl-10 font-bold" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div className={`space-y-1.5 transition-all duration-300 ${isOneTime ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                            <label className="label-caps !ml-0">Befristung (Optional)</label>
                            <div className="relative group">
                                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="date" 
                                    className="input-standard pl-10 border-dashed" 
                                    value={formData.endDate} 
                                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                    disabled={isOneTime}
                                />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter pl-1">Unbefristet, falls leer.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- FLOATING ACTION FOOTER (Mobile-Safe) --- */}
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 md:left-auto md:w-auto z-30">
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl border border-slate-200 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard/contracts')} 
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
                    <><Save size={16} /> {isOneTime ? 'Jetzt planen' : 'Vertrag aktivieren'}</>
                )}
              </button>
            </div>
        </div>

      </form>
    </div>
  );
}