import useAuth from "../hooks/useAuth"
import { Navigate,Outlet } from "react-router";

interface allowedRoleType{
  allowedRole?:"TEAM_LEAD" | "EMPLOYEE"
}
const ProtectedRoute = ({ allowedRole }: allowedRoleType) =>{
   const {user,loading} =useAuth()
   if (loading){
     return <p>Loading...</p>
   }
  
             
    if (!user){
         return <Navigate to="/login" replace />
    }
    else{
      if(allowedRole && allowedRole !== user.role){
          return <Navigate to="/dashboard" replace />
      }
      else{
            return <Outlet />
      }
    }
   
  

}

export default ProtectedRoute