import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield, Mail, Phone, MapPin, Building, User, Gavel, Scale, ChevronLeft, Landmark } from 'lucide-react';

export default function ImpressumPage() {
  // --------------------------------------------------------
  // GlanzOps - Stammdaten
  // --------------------------------------------------------
  const COMPANY_NAME = "GlanzOps Gebäudereinigung GmbH";
  const CEO = "Max Mustermann"; 
  const STREET = "Musterstraße 1";
  const ZIP = "12345";
  const CITY = "Berlin";
  const EMAIL = "info@glanzops.de";
  const PHONE = "030 / 123 456 78";
  
  const UST_ID = "DE123456789"; 
  const REGISTER_COURT = "Amtsgericht Berlin-Charlottenburg";
  const REGISTER_NUMBER = "HRB 12345";
  // --------------------------------------------------------

  return (
    <div className="page-container">
      <Helmet>
        <title>Impressum | {COMPANY_NAME}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* --- HEADER SECTION --- */}
      <div className="header-section">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="btn-secondary !p-2"
            title="Zurück"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h1 className="page-title text-base">Impressum</h1>
            <p className="page-subtitle">Rechtliche Anbieterkennzeichnung gemäß § 5 TMG.</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                <Shield size={12} className="text-blue-500" /> Rechtssicher
            </span>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 pb-24">
        
        <div className="content-grid lg:grid-cols-12 gap-4">
          
          {/* LINKS: BASIS DATEN */}
          <div className="lg:col-span-7 space-y-4">
            <div className="form-card h-full">
              <div className="form-section-title">
                <Building size={14} className="text-blue-500" /> 1. Unternehmensangaben
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 pt-2">
                <div className="space-y-6">
                    <div>
                        <p className="label-caps !ml-0 mb-1">Firmierung</p>
                        <p className="font-bold text-slate-900 text-lg leading-tight">
                            {COMPANY_NAME}
                        </p>
                    </div>
                    <div>
                        <p className="label-caps !ml-0 mb-2">Sitz der Gesellschaft</p>
                        <div className="flex items-start gap-2.5 text-slate-600">
                            <MapPin size={14} className="text-slate-300 shrink-0 mt-0.5" />
                            <div className="text-[13px] font-medium leading-relaxed">
                                {STREET}<br />
                                {ZIP} {CITY}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <p className="label-caps !ml-0 mb-3 text-blue-600">Geschäftsführung</p>
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base">
                        <User className="text-blue-500" size={16} /> {CEO}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Vertretungsberechtigt</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-blue-500" />
                  <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Direktkontakt</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-blue-200 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={14} /></div>
                        <span className="text-sm font-bold text-slate-700">{PHONE}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-blue-200 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={14} /></div>
                        <a href={`mailto:${EMAIL}`} className="text-sm font-black text-blue-600">{EMAIL}</a>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* RECHTS: REGISTER */}
          <div className="lg:col-span-5 space-y-4">
            <div className="form-card h-full border-l-2 border-l-blue-500">
              <div className="form-section-title">
                <Scale size={14} className="text-blue-500" /> 2. Register & Steuer
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="label-caps !ml-0 mb-1.5">Handelsregister</p>
                    <p className="text-[13px] text-slate-700 font-bold">
                        {REGISTER_COURT}
                    </p>
                    <p className="text-[11px] text-blue-600 font-black mt-0.5">{REGISTER_NUMBER}</p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <p className="label-caps !ml-0 mb-1.5 text-emerald-600">Umsatzsteuer-ID</p>
                    <p className="text-base text-slate-900 font-black font-mono tracking-tighter">
                        {UST_ID}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">gemäß § 27 a UStG</p>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                    <Landmark size={18} className="text-blue-500 shrink-0" />
                    <p className="text-[10px] text-blue-800 leading-normal font-medium">
                        Zuständige Aufsichtsbehörde: Handwerkskammer {CITY}. Berufsbezeichnung: Gebäudereinigermeister.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECHTLICHE HINWEISE (FULL WIDTH) */}
        <div className="form-card">
            <div className="form-section-title">
                <Gavel size={14} className="text-blue-500" /> 3. Rechtliche Hinweise
            </div>
            <div className="grid md:grid-cols-3 gap-8 mt-4">
                {[
                    { label: "Inhalte", text: "Verantwortlich für eigene Inhalte auf diesen Seiten gemäß § 7 Abs.1 TMG." },
                    { label: "Verlinkungen", text: "Keine Gewähr für externe Website-Inhalte Dritter. Haftung liegt beim jeweiligen Anbieter." },
                    { label: "Urheberrecht", text: "Vervielfältigung oder Verwertung bedürfen der schriftlichen Zustimmung." }
                ].map((item, i) => (
                    <div key={i} className="space-y-2">
                        <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{item.label}</h3>
                        <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{item.text}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* OS PLATFORM BANNER */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <Scale size={24} className="text-blue-400" />
            </div>
            <div className="text-center md:text-left flex-1">
                <h4 className="text-sm font-black uppercase tracking-tight mb-1">Online-Streitbeilegung (OS)</h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                    Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit.
                </p>
            </div>خ
            <a 
                href="https://ec.europa.org/consumers/odr/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary !bg-white !text-slate-900 !py-2 !px-6 hover:!bg-slate-100 transition-colors whitespace-nowrap !text-[11px]"
            >
                Plattform öffnen
            </a>
        </div>

      </div>

      <footer className="py-12 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} {COMPANY_NAME} &bull; Alle Rechte vorbehalten
          </p>
      </footer>
    </div>
  );
}