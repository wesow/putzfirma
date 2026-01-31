import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { Route, Routes } from 'react-router-dom';
import './app.css';

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
import RegisterPage from './pages/RegisterPage';

// --- DASHBOARDS ---
import CustomerDashboard from './pages/CustomerDashboard';
import Dashboard from './pages/Dashboard'; // Admin Dashboard
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
import FinancePage from './pages/admin/FinancePage'; // <--- NEU: Finance Dashboard
import AuditLogs from './pages/AuditLogs';
import ExpensesPage from './pages/expenses/ExpensesPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import ReportsPage from './pages/ReportsPage';
import CreateOffersPage from './pages/sales/CreateOfferPage';
import OffersPage from './pages/sales/OffersPage';

// --- LAGER & SONSTIGES ---
import CreateInventoryPage from './pages/inventory/CreateInventoryPage';
import InventoryPage from './pages/inventory/InventoryPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Hilfskomponente für die Dashboard-Weiche
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
          },
          success: { 
            style: { 
              background: '#ecfdf5', 
              color: '#065f46', 
              border: '1px solid #10b981' 
            } 
          },
          error: { 
            style: { 
              background: '#fef2f2', 
              color: '#991b1b', 
              border: '1px solid #ef4444' 
            } 
          },
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

        {/* === 2. GESCHÜTZTER DASHBOARD BEREICH === */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'CUSTOMER', 'MANAGER']} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            <Route index element={<DashboardSwitcher />} />

            {/* --- OPERATIVES TEAM (Admin & Mitarbeiter) --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'MANAGER']} />}>
              <Route path="jobs" element={<JobsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="absences" element={<AbsencesPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/new" element={<CreateCustomerPage />} />
              <Route path="customers/edit/:id" element={<EditCustomerPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/new" element={<CreateInventoryPage />} />
            </Route>

            {/* --- EXKLUSIVE ADMIN BEREICHE (Unternehmenssteuerung) --- */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/new" element={<CreateServicePage />} />
              <Route path="services/edit/:id" element={<EditServicePage />} />
              
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="contracts/new" element={<CreateContractPage />} />
              
              <Route path="team" element={<TeamPage />} />
              <Route path="team/new" element={<CreateEmployeePage />} />
              <Route path="team/:id" element={<EditEmployeePage />} />
              
              <Route path="payroll" element={<PayrollPage />} />
              
              {/* FINANZEN */}
              <Route path="offers" element={<OffersPage />} />
              <Route path="offers/new" element={<CreateOffersPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="finance" element={<FinancePage />} /> {/* <--- NEU: Hier registriert */}
              <Route path="expenses" element={<ExpensesPage />} />
              
              <Route path="reports" element={<ReportsPage />} />
              <Route path="audit" element={<AuditLogs />} />
              <Route path="settings" element={<SettingsPage />} />
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