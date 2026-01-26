import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield, Mail, Phone, MapPin, Building, User, Gavel, Scale } from 'lucide-react';

export default function ImpressumPage() {
  // --------------------------------------------------------
  // GlanzOps - Stammdaten
  // --------------------------------------------------------
  const COMPANY_NAME = "GlanzOps Gebäudereinigung";
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
    <div className="page-container max-w-5xl mx-auto">
      <Helmet>
        <title>Impressum | {COMPANY_NAME}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* HEADER & NAVIGATION */}
      <div className="mb-6 flex flex-col gap-4">
        <Link 
          to="/" 
          className="w-fit text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-all font-black uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={14} /> Zurück zur Startseite
        </Link>
        
        <div className="header-section">
          <div className="flex items-center gap-5">
            <div className="stat-icon-wrapper icon-info !w-14 !h-14 rounded-2xl shadow-inner border border-blue-100 bg-blue-50 text-blue-600">
              <Shield size={28} />
            </div>
            <div className="text-left">
              <h1 className="page-title text-3xl">Impressum</h1>
              <p className="page-subtitle text-lg">Rechtliche Anbieterkennzeichnung gemäß § 5 TMG</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <main className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 md:p-16 space-y-16">
          
          {/* ANBIETERKENNZEICHNUNG */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <Building size={20} className="text-blue-500" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Unternehmensangaben</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div>
                        <p className="label-caps !ml-0 !mb-3">Firmierung</p>
                        <p className="font-black text-slate-900 text-2xl leading-tight">
                            {COMPANY_NAME}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <p className="label-caps !ml-0 !mb-3">Sitz der Gesellschaft</p>
                        <div className="flex items-start gap-3 text-slate-600 font-bold">
                            <MapPin size={18} className="text-slate-300 shrink-0 mt-1" />
                            <div className="text-lg leading-relaxed">
                                {STREET}<br />
                                {ZIP} {CITY}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                    <div>
                        <p className="label-caps !ml-0 !mb-3 text-blue-600">Vertretungsberechtigt</p>
                        <div className="flex items-center gap-3 text-slate-900 font-black text-xl">
                            <User className="text-blue-500" size={22} /> {CEO}
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Geschäftsführer</p>
                    </div>
                </div>
            </div>
          </section>

          {/* KONTAKT & REGISTER */}
          <section className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Mail size={20} className="text-blue-500" />
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Kontaktmöglichkeiten</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="group flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                <Phone size={18} />
                            </div>
                            <span className="font-bold text-slate-700">{PHONE}</span>
                        </div>
                        <div className="group flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </div>
                            <a href={`mailto:${EMAIL}`} className="font-black text-blue-600 hover:underline">{EMAIL}</a>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Scale size={20} className="text-blue-500" />
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Register & Steuer</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {REGISTER_COURT && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="label-caps !ml-0 !mb-2">Handelsregister</p>
                                <p className="text-sm text-slate-700 font-bold leading-relaxed">
                                    {REGISTER_COURT}<br />
                                    <span className="text-blue-500 font-black tracking-tighter">Reg-Nr:</span> {REGISTER_NUMBER}
                                </p>
                            </div>
                        )}
                        {UST_ID && (
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <p className="label-caps !ml-0 !mb-2">Umsatzsteuer-ID</p>
                                <p className="text-lg text-slate-900 font-black font-mono tracking-tighter">
                                    {UST_ID}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">gemäß § 27 a Umsatzsteuergesetz</p>
                            </div>
                        )}
                    </div>
                </div>
          </section>

          {/* DISCLAIMER SECTION */}
          <section className="pt-12 border-t border-slate-100 space-y-10">
            <div className="flex items-center gap-3">
                <Gavel size={20} className="text-blue-500" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Rechtliche Hinweise</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Inhalte</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, fremde Informationen zu überwachen.
                    </p>
                </div>
                <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Verlinkungen</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Unser Angebot enthält Links zu externen Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss und übernehmen daher keine Gewähr. Für die Inhalte ist stets der jeweilige Anbieter verantwortlich.
                    </p>
                </div>
                <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em]">Urheberrecht</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        Die Inhalte auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verwertung bedürfen der schriftlichen Zustimmung des Erstellers.
                    </p>
                </div>
            </div>
          </section>

          {/* OS-PLATTFORM */}
          <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Scale size={32} />
                </div>
                <div className="text-center md:text-left flex-1">
                    <h4 className="text-lg font-black tracking-tight mb-2 uppercase">Online-Streitbeilegung</h4>
                    <p className="text-blue-100 text-sm leading-relaxed font-medium mb-4">
                        Die EU-Kommission bietet eine Plattform zur Online-Streitbeilegung an. Wir sind zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle nicht verpflichtet.
                    </p>
                    <a 
                        href="https://ec.europa.org/consumers/odr/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block bg-white text-blue-600 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg shadow-black/10"
                    >
                        Plattform besuchen
                    </a>
                </div>
          </div>

        </div>
      </main>

      <footer className="py-12 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} {COMPANY_NAME} &bull; Alle Rechte vorbehalten
          </p>
      </footer>
    </div>
  );
}