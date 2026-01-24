import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Shield } from 'lucide-react';

export default function ImpressumPage() {
  // --------------------------------------------------------
  // 📝 BITTE HIER DEINE ECHTEN DATEN EINTRAGEN
  // --------------------------------------------------------
  const COMPANY_NAME = "CleanOps Gebäudereinigung";
  const CEO = "Max Mustermann"; // Dein Name
  const STREET = "Musterstraße 1";
  const CITY = "12345 Berlin";
  const EMAIL = "info@cleanops.de";
  const PHONE = "030 / 123 456 78";
  
  // Falls vorhanden (sonst leer lassen):
  const UST_ID = "DE123456789"; 
  const REGISTER_COURT = "Amtsgericht Berlin-Charlottenburg";
  const REGISTER_NUMBER = "HRB 12345";
  // --------------------------------------------------------

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-700">
      
      {/* 1. SEO */}
      <Helmet>
        <title>Impressum | {COMPANY_NAME}</title>
        <meta name="robots" content="noindex" /> {/* Impressum muss nicht zwingend in Google ranken */}
      </Helmet>

      {/* 2. NAVIGATION (Zurück) */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition font-medium">
            <ArrowLeft size={20} /> Zurück zur Startseite
          </Link>
        </div>
      </nav>

      {/* 3. CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
            <div className="bg-slate-100 p-3 rounded-xl">
              <Shield className="text-slate-600 h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Impressum</h1>
          </div>

          <div className="space-y-8">
            
            {/* ANGABEN */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Angaben gemäß § 5 TMG</h2>
              <p>
                <strong>{COMPANY_NAME}</strong><br />
                {STREET}<br />
                {CITY}
              </p>
            </section>

            {/* VERTRETUNG */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Vertreten durch:</h2>
              <p>{CEO}</p>
            </section>

            {/* KONTAKT */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Kontakt</h2>
              <p>
                Telefon: {PHONE}<br />
                E-Mail: <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a>
              </p>
            </section>

            {/* REGISTER */}
            {(REGISTER_COURT || REGISTER_NUMBER) && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Registereintrag</h2>
                <p>
                  Eintragung im Handelsregister.<br />
                  Registergericht: {REGISTER_COURT}<br />
                  Registernummer: {REGISTER_NUMBER}
                </p>
              </section>
            )}

            {/* UMSATZSTEUER */}
            {UST_ID && (
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Umsatzsteuer-ID</h2>
                <p>
                  Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                  {UST_ID}
                </p>
              </section>
            )}

            {/* STREITSCHLICHTUNG */}
            <section className="pt-8 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">EU-Streitschlichtung</h2>
              <p className="mb-4">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.org/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  https://ec.europa.org/consumers/odr/
                </a>.<br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h3>
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            {/* HAFTUNGSAUSSCHLUSS */}
            <section className="pt-8 border-t border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Haftungsausschluss (Disclaimer)</h2>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">Haftung für Inhalte</h3>
              <p className="mb-4 text-sm leading-relaxed">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. 
                Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen 
                oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung 
                von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
                der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-2">Haftung für Links</h3>
              <p className="mb-4 text-sm leading-relaxed">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte 
                auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. 
                Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der 
                Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung 
                nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>

              <h3 className="text-lg font-bold text-slate-900 mb-2">Urheberrecht</h3>
              <p className="text-sm leading-relaxed">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, 
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber 
                erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine 
                Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} {COMPANY_NAME}. Alle Rechte vorbehalten.
      </footer>
    </div>
  );
}