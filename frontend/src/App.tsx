import LoginPage from './pages/LoginPage'
import { BrowserRouter, Routes, Route } from "react-router";
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import TeamLeadDashboard from './pages/TeamLead/TeamLeadDashboard';
import DashboardLayout from './layouts/DashboardLayout';
import CreateTask from './pages/TeamLead/CreateTask';
import ManageTasks from './pages/TeamLead/ManageTasks';
import MyTasks from './pages/Employee/MyTasks';
import TaskDetails from './pages/Employee/TaskDetails';
import TaskHistory from './pages/Employee/TaskHistory';
import RegisterPage from './pages/RegisterPage';
import TeamMembers from './pages/TeamLead/TeamMembers';
import CreateEmployee from './pages/TeamLead/CreateEmployee';
import WorkspaceDashboard from './pages/dashboard/WorkspaceDashboard';
function App() {

     const { user } =useAuth()
  return (
  <BrowserRouter>
  <Routes>
      <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<RegisterPage />} />
  <Route element={<ProtectedRoute />}>

    <Route path="/dashboard" element={<DashboardLayout />}>
       {/* <Route
    path="/dashboard1"
    element={<WorkspaceDashboard />}
/> */}
<Route index element={<WorkspaceDashboard />} />
{/* <Route path="workspace" element={<WorkspaceDashboard />} />
    <Route index element={
     user?.role === "EMPLOYEE" ?
    <EmployeeDashboard /> :
        <TeamLeadDashboard />
  } /> */}
  <Route element={<ProtectedRoute allowedRole="TEAM_LEAD" />}>
  <Route path='tasks' element={<ManageTasks />} />
  <Route path="tasks/create" element={<CreateTask />} />
     <Route path='team' element={<TeamMembers />}/>
            <Route path='team/create' element={<CreateEmployee />}/>
</Route>
<Route element={<ProtectedRoute allowedRole="EMPLOYEE" />}>
  <Route path='my-tasks' element={<MyTasks />}/>
   <Route path='my-tasks/:id' element={<TaskDetails />}/>
</Route>

     <Route path='history' element={<TaskHistory />}/>
   
   

  
    </Route>
   
    

    </Route>
    
    </Routes>
  </BrowserRouter>
  )
}

export default App
