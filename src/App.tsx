import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async'; // <--- NEU: SEO Provider

// Pages & Layouts
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard'; 
import DashboardLayout from './layouts/DashboardLayout';

import CustomersPage from './pages/customers/CustomersPage';
import CreateCustomerPage from './pages/customers/CreateCustomerPage';
import ServicesPage from './pages/services/ServicesPage'; 
import CreateServicePage from './pages/services/CreateServicePage'; 
import ContractsPage from './pages/contracts/ContractsPage';
import CreateContractPage from './pages/contracts/CreateContractPage';
import JobsPage from './pages/jobs/JobsPage';
import TeamPage from './pages/team/TeamPage';
import CreateEmployeePage from './pages/team/CreateEmployeePage';
import ProtectedRoute from './components/ProtectedRoute';
import EditEmployeePage from './pages/team/EditEmployeePage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import PayrollPage from './pages/team/PayrollPage';
import ExpensesPage from './pages/finances/ExpensesPage';
import AbsencesPage from './pages/team/AbsencesPage';
import OffersPage from './pages/sales/OffersPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import InventoryPage from './pages/inventory/InventoryPage';
import ImpressumPage from './pages/public/ImpressumPage';
import CustomerDashboard from './pages/CustomerDashboard';

// --- HILFSKOMPONENTE FÜR DASHBOARD-WEICHE ---
const DashboardSwitcher = () => {
  const role = localStorage.getItem('role');

  if (role === 'ADMIN') {
    return <Dashboard />;
  } 
  
  if (role === 'CUSTOMER') {
    return <CustomerDashboard />; // <--- NEU: Zeige Kunden-Dashboard
  }

  // Fallback für EMPLOYEE (oder unbekannte Rollen)
  return <EmployeeDashboard />;
};
function App() {
  return (
    <HelmetProvider> {/* <--- NEU: Umschließt die ganze App für SEO */}
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: { background: '#333', color: '#fff' },
            success: { style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' } },
            error: { style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' } },
          }} 
        />

        <Routes>
          {/* === 1. ÖFFENTLICHE STARTSEITE (SEO WICHTIG) === */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/impressum" element={<ImpressumPage />} /> {/* <--- NEU */}

          {/* === 2. AUTHENTIFIZIERUNG === */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* === 3. GESCHÜTZTER BEREICH (Dashboard) === */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            <Route index element={<DashboardSwitcher />} />
            
            {/* KUNDEN */}
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
            
            {/* SERVICES */}
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

            {/* VERTRÄGE */}
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
            
            {/* JOBS */}
            <Route path="jobs" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <JobsPage />
              </ProtectedRoute>
            } />

            {/* TEAM */}
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
            <Route path="team/payroll" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <PayrollPage />
              </ProtectedRoute>
            } />
            <Route path="absences" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <AbsencesPage />
              </ProtectedRoute>
            } />

            {/* KALENDER & BERICHTE */}
            <Route path="calendar" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <CalendarPage />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ReportsPage />
              </ProtectedRoute>
            } />

            {/* FINANZEN & VERTRIEB */}
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
            <Route path="offers" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <OffersPage />
              </ProtectedRoute>
            } />
            
            {/* LAGER & EINSTELLUNGEN */}
            <Route path="inventory" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
                <InventoryPage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
               <ProtectedRoute allowedRoles={['ADMIN']}>
                 <SettingsPage />
               </ProtectedRoute>
             } />
          </Route>
        

          {/* 4. FALLBACK: Alles Unbekannte geht zur Startseite */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;