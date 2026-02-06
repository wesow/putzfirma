import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import './App.css';

// --- CONTEXT ---
import { useAuth } from './context/AuthContext';

// --- LAYOUTS & GUARDS ---
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// --- PUBLIC PAGES ---
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ImpressumPage from './pages/public/ImpressumPage';
import LandingPage from './pages/public/LandingPage';
import PublicSignPage from './pages/public/PublicSignPage'; // <--- WICHTIG: Importieren
import RegisterPage from './pages/RegisterPage';

// --- DASHBOARDS ---
import CustomerDashboard from './pages/CustomerDashboard';
import Dashboard from './pages/Dashboard'; // Admin/Manager Dashboard
import EmployeeDashboard from './pages/EmployeeDashboard';

// --- OPERATIVE PAGES ---
import CalendarPage from './pages/CalendarPage';
import JobsPage from './pages/jobs/JobsPage';
import AbsencesPage from './pages/team/AbsencesPage';

// --- VERWALTUNG ---
import ContractsPage from './pages/contracts/ContractsPage';
import CreateContractPage from './pages/contracts/CreateContractPage';
import CreateCustomerPage from './pages/customers/CreateCustomerPage';
import CustomersPage from './pages/customers/CustomersPage';
import EditCustomerPage from './pages/customers/EditCustomerPage';
import CreateServicePage from './pages/services/CreateServicePage';
import EditServicePage from './pages/services/EditServicePage';
import ServicesPage from './pages/services/ServicesPage';

// --- TEAM & HR ---
import CreateEmployeePage from './pages/team/CreateEmployeePage';
import EditEmployeePage from './pages/team/EditEmployeePage';
import PayrollPage from './pages/team/PayrollPage';
import TeamPage from './pages/team/TeamPage';

// --- FINANZEN & SALES ---
import FinancePage from './pages/admin/FinancePage';
import AuditLogs from './pages/AuditLogs';
import ExpensesPage from './pages/expenses/ExpensesPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import CreateOffersPage from './pages/sales/CreateOfferPage';
import OffersPage from './pages/sales/OffersPage';

// --- SYSTEM & INFRASTRUKTUR ---
import BusinessFlowPage from './pages/admin/BusinessFlowPage';
import SystemStatusPage from './pages/admin/SystemStatusPage';
import CreateInventoryPage from './pages/inventory/CreateInventoryPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Weiche für das Start-Dashboard nach dem Login
 */
const DashboardSwitcher = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN' || user?.role === 'MANAGER') return <Dashboard />;
  if (user?.role === 'CUSTOMER') return <CustomerDashboard />;
  return <EmployeeDashboard />; 
};

function App() {
  return (
    <HelmetProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: { 
            background: '#0f172a', 
            color: '#fff', 
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600'
          }
        }} 
      />

      <Routes>
        {/* === 1. ÖFFENTLICHE SEITEN === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* KORREKTUR: Hier muss die Signatur-Route hin (außerhalb vom Dashboard!) */}
        <Route path="/sign/:token" element={<PublicSignPage />} />

        {/* === 2. GESCHÜTZTER BEREICH (Alle Rollen) === */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'CUSTOMER', 'MANAGER']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            {/* Startseite (Rollen-spezifisch) */}
            <Route index element={<DashboardSwitcher />} />

            {/* Gemeinsame Profileinstellungen für alle Rollen */}
            <Route path="settings" element={<SettingsPage />} />

            {/* --- GEMEINSAME ROUTE: RECHNUNGEN (Admin, Manager & Kunden) --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CUSTOMER']} />}>
               <Route path="invoices" element={<InvoicesPage />} />
            </Route>

            {/* --- NUR MITARBEITER & ADMINS (Operativ) --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'MANAGER']} />}>
              <Route path="jobs" element={<JobsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="absences" element={<AbsencesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/new" element={<CreateInventoryPage />} />
            </Route>

            {/* --- NUR ADMIN & MANAGER (Steuerung) --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              {/* Kundenstamm */}
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/new" element={<CreateCustomerPage />} />
              <Route path="customers/edit/:id" element={<EditCustomerPage />} />
              
              {/* Services & Verträge */}
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/new" element={<CreateServicePage />} />
              <Route path="services/edit/:id" element={<EditServicePage />} />
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="contracts/new" element={<CreateContractPage />} />
              
              {/* Personal & Finanzen */}
              <Route path="team" element={<TeamPage />} />
              <Route path="team/new" element={<CreateEmployeePage />} />
              <Route path="team/:id" element={<EditEmployeePage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="offers" element={<OffersPage />} />
              <Route path="offers/new" element={<CreateOffersPage />} />
              
              <Route path="finance" element={<FinancePage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              
              {/* System-Tools */}
              <Route path="flow" element={<BusinessFlowPage />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="system-status" element={<SystemStatusPage />} /> 
              <Route path="business-flow" element={<BusinessFlowPage />} />
            </Route>

          </Route>
        </Route>

        {/* === 3. FALLBACK === */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HelmetProvider>
  );
}

export default App;