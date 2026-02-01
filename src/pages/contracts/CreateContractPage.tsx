import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Loader2,
  MapPin,
  PauseCircle,
  Repeat,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
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

  if (dataLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>;

  const isOneTime = formData.interval === 'ONCE';

  return (
    <div className="page-container">
      
      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/contracts')} 
            className="btn-secondary !p-2"
            title="Zurück"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="page-title text-base">Neuen Vertrag erstellen</h1>
            <p className="page-subtitle">Planen Sie wiederkehrende Dienstleistungen oder Einzelaufträge.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                <Sparkles size={12} className="text-amber-400 fill-amber-400" /> Service-Planer
            </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        <div className="content-grid lg:grid-cols-12 gap-4">

            {/* --- LINKS: KUNDE & SERVICE (7 Cols) --- */}
            <div className="lg:col-span-7 space-y-4">
                
                {/* 1. KUNDENWAHL */}
                <div className="form-card">
                    <div className="form-section-title">
                        <User size={14} /> 1. Kunde & Objekt
                    </div>
                    
                    <div className="space-y-4">
                        {/* Suchfeld integriert */}
                        <div className="space-y-1">
                            <label className="label-caps">Vertragspartner *</label>
                            
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2">
                                <div className="relative mb-2">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                    <input 
                                        type="text"
                                        placeholder="Kunden suchen..."
                                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 text-xs font-medium focus:outline-none focus:border-blue-400 transition-colors"
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
                                        className="input-standard pl-10 appearance-none cursor-pointer bg-white font-bold"
                                    >
                                        <option value="">-- Bitte wählen ({filteredCustomers.length}) --</option>
                                        {filteredCustomers.map(c => <option key={c.id} value={c.id}>{c.companyName || `${c.lastName}, ${c.firstName}`}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div className="space-y-1">
                            <label className="label-caps">Leistungsort (Adresse) *</label>
                            <div className="relative group">
                                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <select 
                                    required
                                    className={`input-standard pl-10 appearance-none cursor-pointer ${!formData.customerId ? 'bg-slate-50 text-slate-400' : ''}`}
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
                        <FileText size={14} /> 2. Dienstleistung
                    </div>
                    <div className="space-y-1">
                        <label className="label-caps">Service-Paket *</label>
                        <div className="relative group">
                            <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <select 
                                required
                                className="input-standard pl-10 appearance-none cursor-pointer font-medium"
                                value={formData.serviceId}
                                onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                            >
                                <option value="">-- Leistungskatalog öffnen --</option>
                                {services.map(s => <option key={s.id} value={s.id}>{s.name} — {Number(s.priceNet || 0).toFixed(2)} €</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RECHTS: ZEITPLAN (5 Cols) --- */}
            <div className="lg:col-span-5 space-y-4">
                
                {/* INFO BANNER */}
                <div className={`p-5 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                    isOneTime 
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-500/20' 
                    : 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-500/20'
                }`}>
                    <div className="absolute right-[-10px] top-[-10px] opacity-10 scale-150">
                        {isOneTime ? <CheckCircle2 size={100} /> : <Repeat size={100} />}
                    </div>
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            {isOneTime ? <PauseCircle size={20} /> : <AlertCircle size={20} />}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm mb-1">{isOneTime ? 'Einmaliger Auftrag' : 'Automatischer Dauerauftrag'}</h4>
                            <p className="text-[10px] leading-relaxed opacity-90">
                                {isOneTime 
                                    ? "Es wird genau EINEN Job erstellt. Der Vertrag wird danach archiviert." 
                                    : "Das System plant automatisch wiederkehrende Termine im Kalender."
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="form-card border-t-4 border-t-slate-900">
                    <div className="form-section-title">
                        <Calendar size={14} /> 3. Zeitplanung
                    </div>

                    <div className="space-y-4">
                        {/* INTERVALL GRID */}
                        <div className="space-y-1">
                            <label className="label-caps">Wiederholung</label>
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
                                        className={`cursor-pointer px-2 py-3 rounded-lg border text-center transition-all ${
                                            formData.interval === opt.id 
                                            ? 'border-slate-800 bg-slate-900 text-white shadow-md' 
                                            : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-wider">{opt.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* START DATUM & ZEIT */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="label-caps">{isOneTime ? 'Datum' : 'Startdatum'}</label>
                                <div className="relative group">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input required type="date" className="input-standard pl-10" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="label-caps">Uhrzeit</label>
                                <div className="relative group">
                                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <input required type="time" className="input-standard pl-10" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* ENDE */}
                        <div className={`space-y-1 transition-opacity duration-300 ${isOneTime ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                            <label className="label-caps">Vertragsende (Optional)</label>
                            <div className="relative group">
                                <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="date" 
                                    className="input-standard pl-10 border-dashed" 
                                    value={formData.endDate} 
                                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                                    disabled={isOneTime}
                                />
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1 pl-1">Leer lassen für unbefristete Laufzeit.</p>
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
                onClick={() => navigate('/dashboard/contracts')} 
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
                <><Save size={16} /> {isOneTime ? 'Auftrag erstellen' : 'Vertrag speichern'}</>
                )}
            </button>
            </div>
        </div>

      </form>
    </div>
  );
}