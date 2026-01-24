import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Clock, 
  Smartphone, 
  MapPin, 
  Phone, 
  Mail 
} from 'lucide-react';

export default function LandingPage() {
  // WICHTIG: Ersetze diese Platzhalter durch deine echten Daten für SEO!
  const CITY = "Berlin"; // Deine Stadt
  const PHONE = "030 / 123 456 78";
  const EMAIL = "angebot@cleanops.de";

  return (
    <div className="bg-white min-h-screen font-sans text-slate-800">
      
      {/* --- 1. SEO CONFIGURATION --- */}
      <Helmet>
        <title>Gebäudereinigung {CITY} | Professionell & Digital | CleanOps</title>
        <meta 
          name="description" 
          content={`Zuverlässige Reinigung für Büros, Praxen und Gebäude in ${CITY}. Transparente Preise, digitale Protokolle und 100% geprüfte Mitarbeiter. Jetzt Angebot anfordern!`} 
        />
        <meta name="keywords" content={`Gebäudereinigung ${CITY}, Büroreinigung, Putzfirma, Praxisreinigung, Unterhaltsreinigung`} />
        {/* Open Graph für Facebook/LinkedIn/WhatsApp Vorschau */}
        <meta property="og:title" content={`CleanOps - Die moderne Gebäudereinigung in ${CITY}`} />
        <meta property="og:description" content="Schluss mit Zettelwirtschaft. Wir reinigen transparent mit digitalem Nachweis." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* --- 2. NAVIGATION --- */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-extrabold text-2xl text-blue-600 flex items-center gap-2 tracking-tight">
             ✨ CleanOps
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#leistungen" className="hover:text-blue-600 transition">Leistungen</a>
            <a href="#vorteile" className="hover:text-blue-600 transition">Warum wir?</a>
            <a href="#kontakt" className="hover:text-blue-600 transition">Kontakt</a>
          </div>

          <div className="flex gap-3">
            <Link to="/login" className="hidden sm:block px-4 py-2 font-medium text-slate-600 hover:text-blue-600 transition">
              Kunden-Login
            </Link>
            <Link to="/register" className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:shadow-xl transform hover:-translate-y-0.5">
              Angebot anfordern
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 3. HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Hintergrund-Elemente */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-blue-50/50 rounded-bl-[100px] hidden lg:block"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
              <Star size={14} fill="currentColor" /> Nr. 1 in {CITY}
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Reinigung, die man <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                live sehen
              </span> kann.
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
              Schluss mit "Wurde heute geputzt?". Bei CleanOps erhalten Sie digitale Nachweise, Fotos und volle Transparenz. Sauberkeit 2.0 für Ihr Business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
               <a href="#kontakt" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl">
                 Kostenloses Angebot <ArrowRight size={20}/>
               </a>
               <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex -space-x-3">
                    <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=1" alt="Kunde"/>
                    <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=3" alt="Kunde"/>
                    <img className="w-10 h-10 rounded-full border-2 border-white" src="https://i.pravatar.cc/100?img=8" alt="Kunde"/>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold text-slate-900">4.9/5</span> von 200+ Kunden
                  </div>
               </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-wrap gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> Sofort verfügbar</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> Rechnung mit MwSt.</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-green-500"/> Haftpflichtversichert</div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative lg:h-[600px] flex items-center justify-center animate-in slide-in-from-right duration-1000">
             <div className="relative w-full max-w-md">
                {/* Das Bild symbolisiert Professionalität */}
                <img 
                  src="https://images.unsplash.com/photo-1581578731117-104f2a41272c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Professionelle Reinigungskraft" 
                  className="rounded-3xl shadow-2xl object-cover h-[500px] w-full transform rotate-3 z-10 relative"
                />
                
                {/* Floating UI Card (zeigt deine App!) */}
                <div className="absolute bottom-12 -left-8 md:-left-12 z-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[260px] animate-bounce-slow">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-100 p-2 rounded-full"><CheckCircle size={20} className="text-green-600"/></div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">Auftrag erledigt</div>
                        <div className="text-xs text-slate-500">Büro Etage 3 • 18:30 Uhr</div>
                      </div>
                   </div>
                   <div className="bg-slate-100 rounded-lg h-24 w-full flex items-center justify-center text-slate-400 text-xs mb-2">
                      [Foto-Beweis]
                   </div>
                   <div className="text-xs font-semibold text-blue-600">Via CleanOps App gesendet</div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- 4. LEISTUNGEN --- */}
      <section id="leistungen" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Unsere Leistungen in {CITY}</h2>
              <p className="text-slate-600 text-lg">Wir bieten maßgeschneiderte Reinigungskonzepte für gewerbliche und private Kunden.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              <ServiceCard 
                title="Büroreinigung" 
                desc="Tägliche oder wöchentliche Reinigung von Arbeitsplätzen, Küchen und Sanitäranlagen."
                image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=80"
              />
              <ServiceCard 
                title="Praxisreinigung" 
                desc="Hygienische Reinigung nach strengen Standards für Ärzte, Apotheken und Labore."
                image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80"
              />
              <ServiceCard 
                title="Glasreinigung" 
                desc="Streifenfreie Fenster, Schaufenster und Glasfassaden für den perfekten Durchblick."
                image="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=500&q=80"
              />
           </div>
        </div>
      </section>

      {/* --- 5. WARUM WIR (Deine App als Vorteil!) --- */}
      <section id="vorteile" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
           <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Transparenz statt <br/>"Vertrauen Sie uns einfach"
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Andere Putzfirmen arbeiten im Verborgenen. Wir nutzen die <strong>CleanOps Technologie</strong>, damit Sie immer genau wissen, was Sie bezahlen.
              </p>

              <div className="space-y-6">
                 <FeatureRow 
                   icon={<Smartphone />} 
                   title="Digitales Protokoll" 
                   text="Unsere Mitarbeiter dokumentieren den Start und das Ende per App."
                 />
                 <FeatureRow 
                   icon={<ShieldCheck />} 
                   title="Foto-Beweise" 
                   text="Besondere Aufgaben oder Mängel werden fotografisch festgehalten."
                 />
                 <FeatureRow 
                   icon={<Clock />} 
                   title="Fair Abrechnung" 
                   text="Sie zahlen nur für erbrachte Leistungen, minutengenau oder pauschal."
                 />
              </div>
           </div>
           
           {/* Abstrakte Darstellung deiner App */}
           <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
              
              <div className="relative z-10">
                 <div className="uppercase tracking-widest text-sm font-bold text-blue-400 mb-2">Kundenportal</div>
                 <h3 className="text-2xl font-bold mb-8">Ihr Blick hinter die Kulissen</h3>
                 
                 <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-center backdrop-blur-sm">
                       <div className="flex items-center gap-3">
                          <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><CheckCircle size={18}/></div>
                          <div>
                             <div className="font-bold text-sm">Büro Etage 1</div>
                             <div className="text-xs text-slate-400">Heute, 14:00 Uhr</div>
                          </div>
                       </div>
                       <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded">Erledigt</span>
                    </div>
                    
                    <div className="bg-white/10 p-4 rounded-xl border border-white/10 flex justify-between items-center backdrop-blur-sm">
                       <div className="flex items-center gap-3">
                          <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Clock size={18}/></div>
                          <div>
                             <div className="font-bold text-sm">Konferenzraum</div>
                             <div className="text-xs text-slate-400">Morgen, 08:00 Uhr</div>
                          </div>
                       </div>
                       <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded">Geplant</span>
                    </div>
                 </div>

                 <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-blue-300 hover:text-white transition">
                       Zum Demo-Login &rarr;
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- 6. CTA / KONTAKT --- */}
      <section id="kontakt" className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
           <h2 className="text-3xl lg:text-4xl font-bold mb-6">Bereit für echte Sauberkeit?</h2>
           <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
             Fordern Sie jetzt Ihr unverbindliches Angebot an. Wir melden uns innerhalb von 24 Stunden bei Ihnen.
           </p>
           
           <div className="bg-white text-slate-800 rounded-2xl p-8 shadow-2xl max-w-lg mx-auto text-left">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Phone /></div>
                    <div>
                       <div className="text-xs text-slate-500 uppercase font-bold">Anrufen</div>
                       <div className="font-bold text-lg">{PHONE}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Mail /></div>
                    <div>
                       <div className="text-xs text-slate-500 uppercase font-bold">E-Mail</div>
                       <div className="font-bold text-lg">{EMAIL}</div>
                    </div>
                 </div>

                 <Link to="/register" className="mt-4 w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-center hover:bg-slate-800 transition shadow-lg">
                    Online Angebot anfordern
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* --- 7. FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-8">
           <div>
             <div className="font-bold text-2xl text-white mb-4">✨ CleanOps</div>
             <p className="text-sm leading-relaxed">
               Wir bringen Glanz in Ihren Alltag. Modern, digital und menschlich. Ihr Partner in {CITY}.
             </p>
           </div>
           
           <div>
             <h4 className="font-bold text-white mb-4">Service</h4>
             <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-white transition">Büroreinigung</a></li>
               <li><a href="#" className="hover:text-white transition">Praxisreinigung</a></li>
               <li><a href="#" className="hover:text-white transition">Treppenhaus</a></li>
               <li><a href="#" className="hover:text-white transition">Grundreinigung</a></li>
             </ul>
           </div>

           <div>
             <h4 className="font-bold text-white mb-4">Rechtliches</h4>
             <ul className="space-y-2 text-sm">
               <li><Link to="/impressum" className="hover:text-white transition">Impressum</Link></li>
               <li><Link to="/datenschutz" className="hover:text-white transition">Datenschutz</Link></li>
               <li><Link to="/agb" className="hover:text-white transition">AGB</Link></li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-bold text-white mb-4">Kontakt</h4>
             <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><MapPin size={16}/> {CITY}, Deutschland</div>
                <div className="flex items-center gap-2"><Phone size={16}/> {PHONE}</div>
                <div className="flex items-center gap-2"><Mail size={16}/> {EMAIL}</div>
             </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 text-center text-xs">
           &copy; {new Date().getFullYear()} CleanOps Gebäudereinigung. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ServiceCard({title, desc, image}: any) {
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
       <div className="h-48 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
       </div>
       <div className="p-6">
          <h3 className="font-bold text-xl text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}

function FeatureRow({icon, title, text}: any) {
  return (
    <div className="flex gap-4">
       <div className="mt-1 bg-blue-100 p-3 rounded-xl text-blue-600 h-fit">
          {icon}
       </div>
       <div>
          <h4 className="font-bold text-slate-900">{title}</h4>
          <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
       </div>
    </div>
  )
}