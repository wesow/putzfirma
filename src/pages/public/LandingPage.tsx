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
  CheckCircle2
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
        <title>GlanzOps | Professionelle Gebäudereinigung & Digitales Management</title>
        <meta name="description" content={`Die modernste Gebäudereinigung in ${CITY}. Echtzeit-Tracking, Fotobeweise und transparente Abrechnung.`} />
      </Helmet>

      {/* --- NAVIGATION --- */}
      <nav className="fixed w-full z-[100] transition-all duration-300 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
                <Sparkles size={20} fill="currentColor" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tighter">GlanzOps</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            <a href="#leistungen" className="hover:text-blue-600 transition-colors">Leistungen</a>
            <a href="#vorteile" className="hover:text-blue-600 transition-colors">Technologie</a>
            <a href="#kontakt" className="hover:text-blue-600 transition-colors">Kontakt</a>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-8 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5">
                <a href="#leistungen" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-tight">Leistungen</a>
                <a href="#vorteile" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-tight">Technologie</a>
                <a href="#kontakt" onClick={() => setMobileMenuOpen(false)} className="text-xl font-black uppercase tracking-tight">Kontakt</a>
                <hr className="border-slate-100"/>
                <Link to="/login" className="text-lg font-black text-blue-600 uppercase tracking-widest">Kundenportal</Link>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-56 lg:pb-48 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white">
        {/* Dekorative Elemente */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/5 border border-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-12 animate-in fade-in zoom-in duration-1000">
              <Zap size={14} fill="currentColor" /> Intelligence Reinigungs-Management
            </div>
            
            <h1 className="text-6xl lg:text-[105px] font-black text-slate-900 leading-[0.9] mb-10 tracking-[-0.04em] animate-in slide-in-from-bottom-8 duration-700">
              Sauberkeit perfekt <br/>
              <span className="text-blue-600 relative inline-block">
                organisiert.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C118.5 3 239.5 3 355 9" stroke="#2563EB" strokeWidth="5" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg lg:text-2xl text-slate-500 mb-14 leading-relaxed max-w-3xl font-medium animate-in fade-in duration-1000 delay-200">
              GlanzOps vereint Premium-Gebäudereinigung mit einer intelligenten Software-Plattform. 
              Erleben Sie volle Transparenz durch Echtzeit-Status und Fotodokumentation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
               <a href="#kontakt" className="btn-primary !px-12 !py-5 !text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:-translate-y-1 transition-all">
                 Angebot anfordern <ArrowRight size={18} className="ml-1" />
               </a>
               <Link to="/login" className="btn-secondary !px-12 !py-5 !text-xs uppercase tracking-[0.2em] bg-white border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all shadow-xl shadow-slate-200/50">
                 <PlayCircle size={18} className="text-blue-600 mr-1"/> Dashboard Demo
               </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-24 flex flex-col items-center gap-6 animate-in fade-in duration-1000 delay-500">
                <div className="flex -space-x-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-xl transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                        <img src={`https://i.pravatar.cc/150?u=${i+45}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex text-amber-400 gap-1">
                        {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Exzellenz in über 200 Objekten</span>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- LEISTUNGEN --- */}
      <section id="leistungen" className="py-32 bg-slate-50/50 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-24">
               <div className="max-w-2xl text-left">
                  <span className="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px] bg-blue-50 px-3 py-1 rounded-lg">Portfolio</span>
                  <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mt-6 leading-[1.1] tracking-tighter">Das Full-Service <br/> Versprechen.</h2>
               </div>
               <p className="text-slate-500 text-lg font-medium max-w-sm mb-4 leading-relaxed italic border-l-2 border-blue-600 pl-6">
                 „Wir reinigen nicht nur – wir managen Ihre Infrastruktur mit digitaler Präzision.“
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <ServiceCard 
                title="Büroreinigung" 
                desc="Garantierte Sauberkeit für Höchstleistungen. Strukturierte Abläufe für moderne Arbeitswelten."
                icon={<Building2 size={28} />}
                tags={['PREMIUM', 'OFFICE']}
              />
              <ServiceCard 
                title="Praxisreinigung" 
                desc="Maximale Desinfektionssicherheit nach höchsten klinischen Standards. Vollständig protokolliert."
                icon={<Shield size={28} />}
                tags={['HYGIENE+', 'SAFE']}
              />
              <ServiceCard 
                title="Industriereinigung" 
                desc="Speziallösungen für komplexe Anforderungen. Von der Halle bis zur Fassadenglasung."
                icon={<Sparkles size={28} />}
                tags={['HIGH-TECH', 'GRUND']}
              />
            </div>
        </div>
      </section>

      {/* --- TECH USP (DASHBOARD PREVIEW) --- */}
      <section id="vorteile" className="py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">
            
            {/* Dashboard Mockup Layout */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              
              <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-3xl border border-slate-800 relative overflow-hidden">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                      <div className="text-left">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Live Monitor</p>
                          <h3 className="text-2xl font-black text-white tracking-tight">Echtzeit Analyse</h3>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl text-[10px] font-black border border-emerald-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        ACTIVE SESSION
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-5 mb-8">
                              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/40">
                                  <Clock size={28} />
                              </div>
                              <div className="text-left">
                                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Letzter Einsatz</p>
                                  <p className="text-xl font-black text-white mt-1">Heute, 08:15 — 11:30</p>
                              </div>
                          </div>
                          
                          <div className="space-y-4">
                              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  <span>Fortschritt</span>
                                  <span className="text-blue-400">100% Abgeschlossen</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                              <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Qualitäts-Score</p>
                              <p className="text-2xl font-black text-white tracking-tighter">99.8%</p>
                          </div>
                          <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                              <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Belege / Fotos</p>
                              <p className="text-2xl font-black text-white tracking-tighter">18 Stk.</p>
                          </div>
                      </div>
                  </div>
              </div>
            </div>

            <div className="text-left">
              <span className="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px] bg-blue-50 px-3 py-1 rounded-lg">Innovation</span>
              <h2 className="text-5xl lg:text-7xl font-black text-slate-900 mt-8 mb-10 leading-[1.1] tracking-tighter">Kein blindes <br/> Vertrauen mehr.</h2>
              <p className="text-xl text-slate-500 mb-12 font-medium leading-relaxed">
                Herkömmliche Reinigungsfirmen sind oft eine "Blackbox". Wir geben Ihnen den Schlüssel. 
                Über Ihr persönliches GlanzOps-Dashboard sehen Sie sekundengenau, wer, wann und wie bei Ihnen gereinigt hat.
              </p>

              <div className="grid sm:grid-cols-2 gap-10">
                  <div className="space-y-4 group">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Camera size={28} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bildbeweise</h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">Jeder kritische Bereich wird nach Abschluss fotografiert und direkt in Ihr Portal hochgeladen.</p>
                  </div>
                  <div className="space-y-4 group">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                          <Smartphone size={28} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">QR-Live Scan</h4>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">Unsere Mitarbeiter scannen digitale Raumbücher vor Ort. Sie wissen sofort, wenn wir fertig sind.</p>
                  </div>
              </div>
            </div>
        </div>
      </section>

      {/* --- CONTACT CTA --- */}
      <section id="kontakt" className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
           <div className="bg-slate-950 rounded-[4rem] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl shadow-blue-900/20">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 animate-pulse"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-blue-600/50">
                      <Mail size={36} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-black mb-10 tracking-tighter leading-[1.1]">Bereit für das <br/> GlanzOps Upgrade?</h2>
                  <p className="text-slate-400 text-lg lg:text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                    Wir erstellen Ihnen innerhalb von <span className="text-white font-black underline decoration-blue-600 underline-offset-8">24 Stunden</span> ein maßgeschneidertes, digitales Reinigungskonzept.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                      <Link to="/register" className="px-12 py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/40 active:scale-95">
                          Kostenloses Angebot anfordern
                      </Link>
                      <a href={`tel:${PHONE}`} className="px-12 py-6 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-white/10 backdrop-blur-md">
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
               Wir definieren Gebäudereinigung für das digitale Zeitalter neu. Transparent, präzise und kompromisslos sauber.
             </p>
             <div className="flex gap-4">
                 {['LI', 'IG', 'TW'].map(social => (
                   <div key={social} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer shadow-sm">
                     {social}
                   </div>
                 ))}
             </div>
           </div>
           
           <div className="space-y-10">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Rechtliches</h4>
             <ul className="space-y-6 text-sm font-black text-slate-700 uppercase tracking-widest">
               <li><Link to="/impressum" className="hover:text-blue-600 transition-colors">Impressum</Link></li>
               <li><Link to="/datenschutz" className="hover:text-blue-600 transition-colors">Datenschutz</Link></li>
               <li><Link to="/agb" className="hover:text-blue-600 transition-colors">AGB</Link></li>
             </ul>
           </div>
           
           <div className="space-y-10">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Zentrale</h4>
             <div className="space-y-8 text-sm font-black text-slate-700 leading-relaxed uppercase tracking-widest">
                <div className="flex gap-5">
                    <MapPin size={24} className="text-blue-600 shrink-0"/>
                    <span>Musterstraße 1 <br/> {CITY}, Deutschland</span>
                </div>
                <div className="flex gap-5">
                    <Mail size={24} className="text-blue-600 shrink-0"/>
                    <a href={`mailto:${EMAIL}`} className="hover:text-blue-600 transition-colors truncate">{EMAIL}</a>
                </div>
             </div>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
           <span>&copy; {new Date().getFullYear()} GlanzOps Gebäudereinigung GmbH</span>
           <div className="flex gap-6">
              <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> Meisterbetrieb</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-emerald-500" /> CO2 Neutral</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({title, desc, icon, tags}: any) {
  return (
    <div className="group bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-3xl hover:shadow-blue-600/5 transition-all duration-700 hover:-translate-y-4 text-left">
       <div className="w-16 h-16 rounded-[1.75rem] bg-slate-50 text-blue-600 flex items-center justify-center mb-10 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-600/40 transition-all duration-500">
          {icon}
       </div>
       <div className="flex gap-2 mb-6">
           {tags.map((tag: string) => (
             <span key={tag} className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/60 bg-blue-600/5 px-2.5 py-1 rounded-lg">{tag}</span>
           ))}
       </div>
       <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">{title}</h3>
       <p className="text-slate-500 text-lg leading-relaxed font-medium mb-10">{desc}</p>
       <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600 group-hover:gap-5 transition-all">
         Entdecken <ArrowRight size={18} />
       </div>
    </div>
  )
}