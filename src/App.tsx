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
import JobsPage from './pages/jobs/JobsPage'; // <--- WICHTIG: Import muss da sein
import TeamPage from './pages/team/TeamPage';
import CreateEmployeePage from './pages/team/CreateEmployeePage';
import ProtectedRoute from './components/ProtectedRoute'; // <--- WICHTIG: Importieren!
import EditEmployeePage from './pages/team/EditEmployeePage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import InvoicesPage from './pages/invoices/InvoicesPage';
import PayrollPage from './pages/team/PayrollPage';
import ExpensesPage from './pages/finances/ExpensesPage';
import AbsencesPage from './pages/team/AbsencesPage';
import OffersPage from './pages/sales/OffersPage';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Dashboard darf JEDER sehen */}
          <Route index element={<Dashboard />} />
          
          {/* KUNDEN: Nur Admin und Mitarbeiter */}
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
          
          {/* SERVICES: Nur Admin */}
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

          {/* VERTRÄGE: Nur Admin */}
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
          
          {/* JOBS: Admin und Mitarbeiter */}
          <Route path="jobs" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
              <JobsPage />
            </ProtectedRoute>
          } />

          {/* TEAM: Nur Admin (Das war dein Beispiel!) */}
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
        <Route path="invoices" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <InvoicesPage />
        </ProtectedRoute>
        } />
        <Route path="team/payroll" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PayrollPage />
          </ProtectedRoute>
        } />
        {/* FINANZEN */}
      <Route path="expenses" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <ExpensesPage />
        </ProtectedRoute>
      } />

      {/* TEAM */}
      <Route path="absences" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
          <AbsencesPage />
        </ProtectedRoute>
      } />

      {/* VERTRIEB */}
      <Route path="offers" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <OffersPage />
        </ProtectedRoute>
      } /></Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;