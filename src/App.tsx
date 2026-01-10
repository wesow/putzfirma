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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          
          {/* Kunden */}
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/new" element={<CreateCustomerPage />} />
          
          {/* Services */}
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/new" element={<CreateServicePage />} />

          {/* Verträge */}
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="contracts/new" element={<CreateContractPage />} />
          
          <Route path="team" element={<TeamPage />} />
          <Route path="team/new" element={<CreateEmployeePage />} />
          <Route path="jobs" element={<JobsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;