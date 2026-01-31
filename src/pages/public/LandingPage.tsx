import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowRight, 
  Star, 
  Clock, 
  Smartphone, 
  MapPin, 
  Phone, 
  Mail,
  Menu,
  X,
  PlayCircle,
  Building2,
  Sparkles,
  Zap,
  Shield,
  Camera,
  CheckCircle2,
  FileSignature,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const CITY = "Berlin"; 
  const PHONE = "030 / 123 456 78";
  const EMAIL = "angebot@glanzops.de";

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      <Helmet>
        <title>GlanzOps | Digitale Gebäudereinigung {CITY} | Echtzeit-Management</title>
        <meta name="description" content={`Professionelle Gebäudereinigung & Büroreinigung in ${CITY}. Digitales Management-System mit Live-Status, Fotobeweisen und eIDAS-Unterschrift.`} />
        <meta name="keywords" content="Gebäudereinigung Berlin, Büroreinigung, Unterhaltsreinigung, Glasreinigung, Praxisreinigung, Digitales Reinigungsmanagement" />
      </Helmet>

      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full z-[100] transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
                <Sparkles size={20} fill="currentColor" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tighter">GlanzOps</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="#leistungen" className="hover:text-blue-600 transition-colors">Leistungen</a>
            <a href="#technologie" className="hover:text-blue-600 transition-colors">OS-Plattform</a>
            <a href="#preise" className="hover:text-blue-600 transition-colors">Transparenz</a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition">
              Kunden-Login
            </Link>
            <Link to="/register" className="btn-primary !px-6 !py-3 !text-[11px] uppercase tracking-widest shadow-xl shadow-blue-200">
              Angebot anfordern
            </Link>
          </div>

          <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-900">
                  {mobileMenuOpen ? <X /> : <Menu />}
              </button>
          </div>
        </div>

        {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5">
                <a href="#leistungen" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-tight">Leistungen</a>
                <a href="#technologie" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-tight">OS-Plattform</a>
                <a href="#kontakt" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-tight">Kontakt</a>
                <hr className="border-slate-100"/>
                <Link to="/login" className="text-lg font-black text-blue-600 uppercase tracking-widest">Login</Link>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-56 lg:pb-48 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 shadow-sm">
              <ShieldCheck size={14} className="text-blue-600" /> Digital Managed Cleaning in {CITY}
            </div>
            
            <h1 className="text-5xl lg:text-[95px] font-black text-slate-900 leading-[0.95] mb-10 tracking-tight animate-in slide-in-from-bottom-8 duration-700">
              Die Gebäudereinigung <br/>
              <span className="text-blue-600 relative inline-block">
                mit Betriebssystem.
                <svg className="absolute -bottom-2 left-0 w-full opacity-50" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C118.5 3 239.5 3 355 9" stroke="#2563EB" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg lg:text-2xl text-slate-500 mb-14 leading-relaxed max-w-3xl font-medium">
              GlanzOps ersetzt Intransparenz durch Technologie. Professionelle Unterhaltsreinigung 
              mit Live-Tracking, Fotodokumentation und digitalem Vertragsmanagement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
               <a href="#kontakt" className="btn-primary !px-12 !py-5 !text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30">
                 Jetzt Angebot erhalten <ArrowRight size={18} className="ml-1" />
               </a>
               <Link to="/login" className="btn-secondary !px-12 !py-5 !text-xs uppercase tracking-[0.2em] bg-white border-slate-200">
                 <LayoutDashboard size={18} className="text-blue-600 mr-1"/> Zum Kundenportal
               </Link>
            </div>

            {/* Google-SEO Trust Factors */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-t border-slate-200 pt-12">
                {[
                    { label: "MEISTERBETRIEB", val: "Handwerksqualität" },
                    { label: "GOBD-KONFORM", val: "Digital-Archiv" },
                    { label: "EIDAS-STANDARD", val: "Online-Signatur" },
                    { label: "VERSICHERT", val: "3 Mio. Deckung" }
                ].map((t, i) => (
                    <div key={i} className="text-center">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.label}</p>
                        <p className="text-slate-900 font-bold text-sm mt-1">{t.val}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </header>

      {/* --- LEISTUNGEN (Optimiert für Google Suche) --- */}
      <section id="leistungen" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <span className="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px]">Services</span>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mt-4 mb-20 tracking-tight">Spezialisierte Reinigungskonzepte.</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <ServiceCard 
                title="Unterhaltsreinigung" 
                desc="Wiederkehrende Reinigung für Büros, Co-Working Spaces und Gewerbeflächen. Digitaler Turnus von wöchentlich bis täglich."
                icon={<Building2 size={28} />}
                tags={['OFFICE', 'STAMMPERSONAL']}
              />
              <ServiceCard 
                title="Praxis- & Klinikreinigung" 
                desc="Hygienesensible Bereiche mit lückenloser Dokumentation. Desinfektionsreinigung nach RKI-Standards inkl. Live-Belegen."
                icon={<Shield size={28} />}
                tags={['HYGIENE+', 'FULL-TRACKING']}
              />
              <ServiceCard 
                title="Glas- & Fassade" 
                desc="Streifenfreier Glanz für Ihre Außenwirkung. Von Schaufenstern bis zur Industrieglasreinigung – auch in großen Höhen."
                icon={<Sparkles size={28} />}
                tags={['INTERVAL', 'SPECIALIST']}
              />
            </div>
        </div>
      </section>

      {/* --- TECHNOLOGIE (Die Dashboard-Story) --- */}
      <section id="technologie" className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-dot-pattern"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center relative z-10">
            
            <div className="text-left">
              <span className="text-blue-400 font-black tracking-[0.3em] uppercase text-[10px]">Transparenz-Garantie</span>
              <h2 className="text-4xl lg:text-7xl font-black mt-8 mb-10 leading-[1.1] tracking-tighter">Ihre Reinigung <br/> als Echtzeit-Stream.</h2>
              <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed">
                Vergessen Sie die Blackbox Reinigung. Mit dem GlanzOps Dashboard haben Sie volle Kontrolle über alle Standorte, Einsätze und Belege.
              </p>

              <div className="space-y-8">
                  {[
                      { icon: <Camera />, title: "Live-Fotodokumentation", text: "Unsere Teams laden nach jedem Einsatz Fotos der kritischen Zonen hoch." },
                      { icon: <FileSignature />, title: "Digitale Signatur", text: "Verträge und Leistungsnachweise unterschreiben Sie einfach am Smartphone." },
                      { icon: <LayoutDashboard />, title: "Zentrales Archiv", text: "Alle Rechnungen und Einsatzprotokolle GoBD-konform an einem Ort." }
                  ].map((item, i) => (
                      <div key={i} className="flex gap-6">
                          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">{item.icon}</div>
                          <div>
                              <h4 className="font-bold text-lg">{item.title}</h4>
                              <p className="text-slate-500 text-sm">{item.text}</p>
                          </div>
                      </div>
                  ))}
              </div>
            </div>

            {/* Dashboard Mockup Layout */}
            <div className="relative animate-in zoom-in duration-1000">
              <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-6 shadow-3xl">
                  <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">glanzops-v2.5.bin</div>
                  </div>
                  <div className="space-y-4">
                      <div className="h-20 bg-white/5 rounded-xl border border-white/10 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center"><Clock size={20}/></div>
                              <div className="text-left"><p className="text-[9px] text-slate-400">STATUS</p><p className="font-bold text-sm">Reinigung läuft...</p></div>
                          </div>
                          <div className="text-right text-emerald-400 font-mono text-xs">01:24:55</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-4 text-left">
                              <p className="text-[9px] text-slate-400 uppercase">Belege</p>
                              <p className="text-2xl font-black mt-1">12 Fotos</p>
                          </div>
                          <div className="h-24 bg-white/5 rounded-xl border border-white/10 p-4 text-left">
                              <p className="text-[9px] text-slate-400 uppercase">Qualität</p>
                              <p className="text-2xl font-black mt-1 text-blue-400">99.8%</p>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
        </div>
      </section>

      {/* --- CONTACT CTA --- */}
      <section id="kontakt" className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-6xl mx-auto px-6">
           <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl shadow-blue-600/40">
              <div className="relative z-10 flex flex-col items-center">
                  <h2 className="text-4xl lg:text-7xl font-black mb-10 tracking-tighter leading-[1.1]">Bereit für die <br/> digitale Sauberkeit?</h2>
                  <p className="text-blue-100 text-lg lg:text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                    Wir erstellen Ihnen innerhalb von <span className="text-white font-black underline decoration-white underline-offset-8">24 Stunden</span> ein individuelles Reinigungskonzept.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                      <Link to="/register" className="px-12 py-6 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-2xl active:scale-95">
                          Jetzt Angebot anfordern
                      </Link>
                      <a href={`tel:${PHONE}`} className="px-12 py-6 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/20 backdrop-blur-md">
                         <Phone size={18}/> {PHONE}
                      </a>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-20 mb-24 text-left">
           <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-3 mb-10">
                <div className="bg-blue-600 text-white p-2.5 rounded-xl">
                    <Sparkles size={22} fill="currentColor" />
                </div>
                <span className="font-black text-2xl text-slate-900 tracking-tighter">GlanzOps</span>
              </div>
             <p className="text-slate-500 font-bold text-lg leading-relaxed max-w-md mb-12">
               Die erste Gebäudereinigung mit integriertem Operations System. Transparent, effizient und GoBD-konform.
             </p>
           </div>
           
           <div className="space-y-10">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Navigation</h4>
             <ul className="space-y-6 text-sm font-black text-slate-700 uppercase tracking-widest">
               <li><a href="#leistungen" className="hover:text-blue-600 transition-colors">Services</a></li>
               <li><a href="#technologie" className="hover:text-blue-600 transition-colors">Plattform</a></li>
               <li><Link to="/login" className="hover:text-blue-600 transition-colors">Kundenportal</Link></li>
             </ul>
           </div>
           
           <div className="space-y-10">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Kontakt</h4>
             <div className="space-y-8 text-sm font-black text-slate-700 uppercase tracking-widest">
                <div className="flex gap-4">
                    <MapPin size={20} className="text-blue-600 shrink-0"/>
                    <span>Musterstraße 1 <br/> {CITY}, Deutschland</span>
                </div>
                <div className="flex gap-4">
                    <Mail size={20} className="text-blue-600 shrink-0"/>
                    <a href={`mailto:${EMAIL}`} className="hover:text-blue-600 transition-colors truncate">{EMAIL}</a>
                </div>
             </div>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">
           <span>&copy; {new Date().getFullYear()} GlanzOps Gebäudereinigung GmbH</span>
           <div className="flex gap-6">
              <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Meisterbetrieb</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> DSGVO Konform</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({title, desc, icon, tags}: any) {
  return (
    <div className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500 hover:-translate-y-2 text-left">
       <div className="w-14 h-14 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center mb-10 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
          {icon}
       </div>
       <div className="flex gap-2 mb-6">
           {tags.map((tag: string) => (
             <span key={tag} className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/60 bg-blue-600/5 px-2 py-0.5 rounded-lg">{tag}</span>
           ))}
       </div>
       <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{title}</h3>
       <p className="text-slate-500 text-base leading-relaxed font-medium mb-10">{desc}</p>
       <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
         Details ansehen <ArrowRight size={18} />
       </div>
    </div>
  )
}