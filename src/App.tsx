import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
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
import EmployeeDashboard from './pages/EmployeeDashboard';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === ÖFFENTLICHE ROUTEN (Jeder darf hier hin) === */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* HIERHIN VERSCHOBEN: */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* === GESCHÜTZTER BEREICH (Dashboard) === */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Dashboard darf JEDER sehen */}
          <Route index element={<Dashboard />} />
          
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
        <Route path="settings" element={
             <ProtectedRoute allowedRoles={['ADMIN']}>
               <SettingsPage />
             </ProtectedRoute>
           } />
        </Route> {/* <--- HIER ENDET DAS DASHBOARD */}

        {/* Fallback für falsche URLs */}
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;