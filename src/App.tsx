import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// --- LAYOUTS ---
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// --- PUBLIC PAGES ---
import LandingPage from './pages/public/LandingPage';
import ImpressumPage from './pages/public/ImpressumPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// --- DASHBOARDS ---
import Dashboard from './pages/Dashboard'; // Admin Dashboard
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// --- OPERATIVE PAGES (Jobs, Kalender) ---
import JobsPage from './pages/jobs/JobsPage';
import CalendarPage from './pages/CalendarPage';
import AbsencesPage from './pages/team/AbsencesPage';

// --- VERWALTUNG (Kunden, Services, Verträge) ---
import CustomersPage from './pages/customers/CustomersPage';
import CreateCustomerPage from './pages/customers/CreateCustomerPage';
import ServicesPage from './pages/services/ServicesPage';
import CreateServicePage from './pages/services/CreateServicePage';
import ContractsPage from './pages/contracts/ContractsPage';
import CreateContractPage from './pages/contracts/CreateContractPage';

// --- TEAM & HR ---
import TeamPage from './pages/team/TeamPage';
import CreateEmployeePage from './pages/team/CreateEmployeePage';
import EditEmployeePage from './pages/team/EditEmployeePage';
import PayrollPage from './pages/team/PayrollPage'; // Pfad angepasst falls nötig

// --- FINANZEN & VERTRIEB ---
import OffersPage from './pages/sales/OffersPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import ExpensesPage from './pages/finances/ExpensesPage';
import ReportsPage from './pages/ReportsPage';

// --- LAGER & SONSTIGES ---
import InventoryPage from './pages/inventory/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import EditServicePage from './pages/services/EditServicePage';

// --- HILFSKOMPONENTE: DASHBOARD WEICHE ---
const DashboardSwitcher = () => {
  const role = localStorage.getItem('role');

  if (role === 'ADMIN') {
    return <Dashboard />;
  } 
  if (role === 'CUSTOMER') {
    return <CustomerDashboard />;
  }
  // Fallback für Mitarbeiter
  return <EmployeeDashboard />;
};

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Toast Konfiguration (Benachrichtigungen) */}
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#fff' },
            success: { style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' } },
            error: { style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' } },
          }} 
        />

        <Routes>
          {/* === 1. ÖFFENTLICHE SEITEN === */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          
          {/* AUTH */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* === 2. GESCHÜTZTER DASHBOARD BEREICH === */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            {/* Startseite (Weiche je nach Rolle) */}
            <Route index element={<DashboardSwitcher />} />

            {/* --- JOBS & KALENDER (Für Alle relevant) --- */}
            <Route path="jobs" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <JobsPage />
              </ProtectedRoute>
            } />
            <Route path="calendar" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="absences" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <AbsencesPage />
              </ProtectedRoute>
            } />

            {/* --- KUNDEN (Admin & Büro) --- */}
            <Route path="customers" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CustomersPage />
              </ProtectedRoute>
            } />
            <Route path="customers/new" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CreateCustomerPage />
              </ProtectedRoute>
            } />

            {/* --- SERVICES (Admin) --- */}
            <Route path="services" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="services/new" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateServicePage />
              </ProtectedRoute>
            } />
            <Route path="services/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EditServicePage />
              </ProtectedRoute>
            } />
            {/* --- VERTRÄGE (Admin) --- */}
            <Route path="contracts" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ContractsPage />
              </ProtectedRoute>
            } />
            <Route path="contracts/new" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateContractPage />
              </ProtectedRoute>
            } />

            {/* --- TEAM & HR (Admin) --- */}
            <Route path="team" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <TeamPage />
              </ProtectedRoute>
            } />
            <Route path="team/new" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateEmployeePage />
              </ProtectedRoute>
            } />
            <Route path="team/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EditEmployeePage />
              </ProtectedRoute>
            } />
            
            {/* PAYROLL (Jetzt Top-Level unter Dashboard) */}
            <Route path="payroll" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PayrollPage />
              </ProtectedRoute>
            } />

            {/* --- FINANZEN & SALES (Admin) --- */}
            <Route path="offers" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <OffersPage />
              </ProtectedRoute>
            } />
            <Route path="invoices" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <InvoicesPage />
              </ProtectedRoute>
            } />
            <Route path="expenses" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ExpensesPage />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ReportsPage />
              </ProtectedRoute>
            } />

            {/* --- LAGER (Admin & Mitarbeiter) --- */}
            <Route path="inventory" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <InventoryPage />
              </ProtectedRoute>
            } />

            {/* --- EINSTELLUNGEN (Admin) --- */}
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SettingsPage />
              </ProtectedRoute>
            } />

          </Route>

          {/* === 3. FALLBACK === */}
          <Route path="*" element={<NotFoundPage />} />
        
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;