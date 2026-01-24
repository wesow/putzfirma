import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Clock, 
  Smartphone, 
  MapPin, 
  Phone, 
  Mail,
  Menu,
  X,
  PlayCircle
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // WICHTIG: Ersetze diese Platzhalter durch deine echten Daten für SEO!
  const CITY = "Berlin"; 
  const PHONE = "030 / 123 456 78";
  const EMAIL = "angebot@cleanops.de";

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- 1. SEO CONFIGURATION --- */}
      <Helmet>
        <title>Gebäudereinigung {CITY} | Professionell & Digital | CleanOps</title>
        <meta 
          name="description" 
          content={`Zuverlässige Reinigung für Büros, Praxen und Gebäude in ${CITY}. Transparente Preise, digitale Protokolle und 100% geprüfte Mitarbeiter. Jetzt Angebot anfordern!`} 
        />
        <meta name="keywords" content={`Gebäudereinigung ${CITY}, Büroreinigung, Putzfirma, Praxisreinigung, Unterhaltsreinigung`} />
      </Helmet>

      {/* --- 2. NAVIGATION (Sticky & Modern) --- */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">CleanOps</span>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#leistungen" className="hover:text-blue-600 transition hover:-translate-y-0.5">Leistungen</a>
            <a href="#vorteile" className="hover:text-blue-600 transition hover:-translate-y-0.5">Warum wir?</a>
            <a href="#kontakt" className="hover:text-blue-600 transition hover:-translate-y-0.5">Kontakt</a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
              Kunden-Login
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95">
              Angebot anfordern
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                  {mobileMenuOpen ? <X /> : <Menu />}
              </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
                <a href="#leistungen" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Leistungen</a>
                <a href="#vorteile" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Warum wir?</a>
                <a href="#kontakt" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-800">Kontakt</a>
                <hr className="border-slate-100 my-2"/>
                <Link to="/login" className="text-lg font-medium text-blue-600">Login</Link>
            </div>
        )}
      </nav>

      {/* --- 3. HERO SECTION (High Impact) --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        
        {/* Dekorative Blobs */}
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-indigo-50/60 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div className="animate-in slide-in-from-left duration-700 fade-in fill-mode-both">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Verfügbar in {CITY} & Umgebung
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
              Reinigung auf <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Autopilot.
              </span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
              Die erste Gebäudereinigung mit echtem digitalen Dashboard. 
              Verfolgen Sie Reinigungen live, sehen Sie Fotobeweise und zahlen Sie nur für Leistung.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
               <a href="#kontakt" className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1">
                 Angebot anfordern <ArrowRight size={20}/>
               </a>
               <Link to="/demo" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition flex items-center justify-center gap-2">
                 <PlayCircle size={20} className="text-slate-400"/> Wie es funktioniert
               </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                        </div>
                    ))}
                </div>
                <div>
                    <div className="flex text-yellow-400 gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <span>Vertraut von 200+ Unternehmen</span>
                </div>
            </div>
          </div>
          
          {/* Hero Image / Visual */}
          <div className="relative lg:h-[700px] flex items-center justify-center animate-in slide-in-from-right duration-1000 fade-in fill-mode-both delay-200">
             
             {/* Main Image Container with Tilt Effect */}
             <div className="relative w-full max-w-lg perspective-1000">
                <div className="relative transform rotate-y-6 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
                    <img 
                        src="https://images.unsplash.com/photo-1581578731117-104f2a41272c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Professionelle Reinigungskraft" 
                        className="rounded-[2.5rem] shadow-2xl object-cover h-[550px] w-full z-10 relative border-8 border-white"
                    />
                    
                    {/* Floating Card: Status */}
                    <div className="absolute top-12 -right-12 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 animate-bounce-slow">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-semibold uppercase">Status</div>
                                <div className="text-sm font-bold text-slate-900">Mitarbeiter geprüft</div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Card: App Preview */}
                    <div className="absolute bottom-12 -left-12 z-30 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 max-w-[280px]">
                       <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-3">
                           <span className="text-xs font-bold text-slate-400 uppercase">Live Update</span>
                           <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                       </div>
                       <div className="flex gap-3 mb-3">
                          <div className="h-12 w-12 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                              <img src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Proof" className="h-full w-full object-cover"/>
                          </div>
                          <div>
                              <div className="text-sm font-bold text-slate-900">Küche gereinigt</div>
                              <div className="text-xs text-slate-500">Vor 2 Min • Foto hochgeladen</div>
                          </div>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                           <div className="bg-blue-600 w-3/4 h-full rounded-full"></div>
                       </div>
                    </div>

                </div>
             </div>

             {/* Background Pattern */}
             <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>
          </div>
        </div>
      </header>

      {/* --- 4. LEISTUNGEN (Grid) --- */}
      <section id="leistungen" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Unsere Services</span>
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mt-3 mb-6">Sauberkeit für jeden Bedarf</h2>
              <p className="text-slate-500 text-lg">Keine Standardlösungen. Wir analysieren Ihren Bedarf und erstellen ein individuelles Reinigungskonzept.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <ServiceCard 
                title="Büroreinigung" 
                desc="Produktive Arbeitsatmosphäre durch saubere Schreibtische, keimfreie Küchen und gepflegte Meetingräume."
                image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                tags={['Täglich', 'Wöchentlich', 'Abends']}
              />
              <ServiceCard 
                title="Praxisreinigung" 
                desc="Höchste Hygiene-Standards für Ärzte. Wir arbeiten nach strengen Desinfektionsplänen für Ihre Sicherheit."
                image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80"
                tags={['Desinfektion', 'Zertifiziert', 'Sensibel']}
              />
              <ServiceCard 
                title="Glas- & Fassade" 
                desc="Der erste Eindruck zählt. Streifenfreie Fenster und repräsentative Fassaden für Ihr Gebäude."
                image="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=800&q=80"
                tags={['Steiger', 'Osmose', 'Sicher']}
              />
           </div>
        </div>
      </section>

      {/* --- 5. USP SECTION (Dark Mode Contrast) --- */}
      <section id="vorteile" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
           <div>
              <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                CleanOps Technologie
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                 Das Ende der <br/>
                 <span className="text-blue-400">Blackbox Reinigung.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                 Andere Firmen schicken eine Rechnung und Sie hoffen, dass geputzt wurde. 
                 Bei uns sehen Sie es. Unsere App trackt Zeiten, Aufgaben und Qualität in Echtzeit.
              </p>

              <div className="space-y-8">
                 <FeatureRow 
                   icon={<Smartphone />} 
                   title="Digitale Check-ins" 
                   text="Mitarbeiter scannen sich per GPS & QR-Code ein. Sie wissen genau, wann wir da waren."
                 />
                 <FeatureRow 
                   icon={<ShieldCheck />} 
                   title="Foto-Dokumentation" 
                   text="Nachher-Fotos von kritischen Bereichen (z.B. Küche) direkt in Ihrem Dashboard."
                 />
                 <FeatureRow 
                   icon={<Clock />} 
                   title="Smarte Abrechnung" 
                   text="Automatisierte Rechnungen basierend auf echten Daten. Keine Pauschalen für Fehlzeiten."
                 />
              </div>
           </div>
           
           {/* Abstract App Visualization */}
           <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-[2.5rem] p-8 shadow-2xl relative">
                  {/* Mockup Header */}
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Dashboard</div>
                          <div className="text-2xl font-bold">Übersicht</div>
                      </div>
                      <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="font-bold text-sm">CO</span>
                      </div>
                  </div>

                  {/* Mockup Content */}
                  <div className="space-y-4">
                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-600 p-5 rounded-2xl">
                              <div className="text-blue-200 text-xs font-bold mb-1">Offene Jobs</div>
                              <div className="text-3xl font-bold">2</div>
                          </div>
                          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                              <div className="text-slate-400 text-xs font-bold mb-1">Diesen Monat</div>
                              <div className="text-3xl font-bold">98%</div>
                          </div>
                      </div>

                      {/* Activity List */}
                      <div className="bg-slate-800 rounded-2xl p-2 border border-slate-700">
                          <div className="p-3 hover:bg-slate-700 rounded-xl flex items-center gap-4 transition-colors cursor-pointer">
                              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                                  <CheckCircle2 size={20}/>
                              </div>
                              <div className="flex-1">
                                  <div className="font-bold text-sm text-white">Reinigung abgeschlossen</div>
                                  <div className="text-xs text-slate-400">Hauptfiliale • Vor 10 min</div>
                              </div>
                          </div>
                          <div className="p-3 hover:bg-slate-700 rounded-xl flex items-center gap-4 transition-colors cursor-pointer">
                              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                                  <Mail size={20}/>
                              </div>
                              <div className="flex-1">
                                  <div className="font-bold text-sm text-white">Rechnung erstellt</div>
                                  <div className="text-xs text-slate-400">#RE-2024-102 • Automatik</div>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white text-slate-900 p-4 rounded-xl shadow-xl animate-pulse">
                      <div className="flex items-center gap-2">
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                          <span className="font-bold text-sm">System Live</span>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- 6. KONTAKT SECTION --- */}
      <section id="kontakt" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
           <div className="bg-blue-600 rounded-[3rem] p-10 lg:p-16 text-center text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
              {/* Decorative Circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10">
                  <h2 className="text-3xl lg:text-5xl font-bold mb-6">Sauberkeit startet hier.</h2>
                  <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    Fordern Sie jetzt Ihr unverbindliches Angebot an. <br className="hidden md:block"/>
                    Wir besichtigen Ihr Objekt kostenlos und erstellen einen Plan.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Link to="/register" className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg flex items-center justify-center gap-2">
                         Angebot anfordern <ArrowRight size={20}/>
                      </Link>
                      <a href={`tel:${PHONE}`} className="px-8 py-4 bg-blue-700 text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition flex items-center justify-center gap-2 border border-blue-500">
                         <Phone size={20}/> {PHONE}
                      </a>
                  </div>
                  
                  <div className="mt-8 text-sm text-blue-200 font-medium">
                     Antwort garantiert innerhalb von 24 Stunden.
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- 7. FOOTER --- */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-12">
           <div className="col-span-1 md:col-span-2">
             <div className="font-extrabold text-2xl text-slate-900 mb-4 tracking-tight flex items-center gap-2">
                 <div className="bg-blue-600 w-2 h-6 rounded-full"></div>
                 CleanOps
             </div>
             <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
               Wir revolutionieren die Gebäudereinigung durch Technologie und Transparenz. 
               Ihr zuverlässiger Partner in {CITY} und Umgebung.
             </p>
             <div className="flex gap-4">
                 {/* Social Icons Placeholder */}
                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer">IG</div>
                 <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition cursor-pointer">LI</div>
             </div>
           </div>
           
           <div>
             <h4 className="font-bold text-slate-900 mb-4">Rechtliches</h4>
             <ul className="space-y-3 text-sm text-slate-500">
               <li><Link to="/impressum" className="hover:text-blue-600 transition">Impressum</Link></li>
               <li><Link to="/datenschutz" className="hover:text-blue-600 transition">Datenschutz</Link></li>
               <li><Link to="/agb" className="hover:text-blue-600 transition">AGB</Link></li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-slate-900 mb-4">Kontakt</h4>
             <ul className="space-y-3 text-sm text-slate-500">
                <li className="flex items-start gap-3">
                    <MapPin size={18} className="shrink-0 text-blue-600"/>
                    <span>Musterstraße 1 <br/> {CITY}</span>
                </li>
                <li className="flex items-center gap-3">
                    <Phone size={18} className="shrink-0 text-blue-600"/>
                    <a href={`tel:${PHONE}`} className="hover:text-blue-600 transition">{PHONE}</a>
                </li>
                <li className="flex items-center gap-3">
                    <Mail size={18} className="shrink-0 text-blue-600"/>
                    <a href={`mailto:${EMAIL}`} className="hover:text-blue-600 transition">{EMAIL}</a>
                </li>
             </ul>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
           <span>&copy; {new Date().getFullYear()} CleanOps Gebäudereinigung GmbH.</span>
           <div className="flex gap-4">
               <span>Made with ❤️ in {CITY}</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ServiceCard({title, desc, image, tags}: any) {
  return (
    <div className="group rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
       <div className="h-56 overflow-hidden relative">
          <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10"></div>
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
          
          <div className="absolute bottom-4 left-4 z-20 flex gap-2">
             {tags && tags.map((tag: string, i: number) => (
                 <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-slate-800 px-2 py-1 rounded-md shadow-sm">
                    {tag}
                 </span>
             ))}
          </div>
       </div>
       <div className="p-8">
          <h3 className="font-bold text-2xl text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
          <div className="font-bold text-sm text-blue-600 flex items-center gap-2">
             Mehr erfahren <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </div>
       </div>
    </div>
  )
}

function FeatureRow({icon, title, text}: any) {
  return (
    <div className="flex gap-5 items-start">
       <div className="mt-1 bg-slate-800 p-4 rounded-2xl text-blue-400 border border-slate-700 shrink-0">
          {icon}
       </div>
       <div>
          <h4 className="font-bold text-white text-lg mb-2">{title}</h4>
          <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
       </div>
    </div>
  )
}