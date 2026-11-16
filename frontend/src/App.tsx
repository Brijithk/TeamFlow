import LoginPage from './pages/LoginPage'
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import TeamLeadDashboard from './pages/TeamLead/TeamLeadDashboard';
import DashboardLayout from './layouts/DashboardLayout';
import CreateTask from './pages/TeamLead/CreateTask';
import ManageTasks from './pages/TeamLead/ManageTasks';
function App() {

     const { user } =useAuth()
  return (
  <BrowserRouter>
  <Routes>
      <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>

    <Route path="/dashboard" element={<DashboardLayout />}>
     
    <Route index element={
     user?.role === "EMPLOYEE" ?
    <EmployeeDashboard /> :
        <TeamLeadDashboard />
  } />
  <Route path='tasks' element={<ManageTasks />} />
  <Route path="tasks/create" element={<CreateTask />} />
    
  
    </Route>
   
    

    </Route>
    </Routes>
  </BrowserRouter>
  )
}

export default App
