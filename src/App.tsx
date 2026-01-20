import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages & Layouts
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard'; // <--- NEU
import DashboardLayout from './layouts/DashboardLayout';
// ... (restliche Imports bleiben gleich)
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

// --- HILFSKOMPONENTE FÜR DASHBOARD-WEICHE ---
const DashboardSwitcher = () => {
  const role = localStorage.getItem('role');
  // Wenn Admin -> Admin Dashboard, sonst -> Mitarbeiter Dashboard
  return role === 'ADMIN' ? <Dashboard /> : <EmployeeDashboard />;
};

function App() {
  return (
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
        {/* === ÖFFENTLICHE ROUTEN === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* === GESCHÜTZTER BEREICH (Dashboard) === */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          
          {/* HIER IST DIE WEICHE: */}
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
      

        {/* 2. FALLBACK FÜR FALSCHE URLS */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;