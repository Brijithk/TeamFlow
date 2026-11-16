import useAuth from "../hooks/useAuth"
import { useNavigate } from "react-router";
import { BrowserRouter, Routes,Route } from "react-router";
import { Navigate,Outlet } from "react-router";
const ProtectedRoute = () =>{
    const navigate = useNavigate();
   const {user,loading} =useAuth()

   if (loading){
     return <p>Loading...</p>
   }
  
             
    if (!user){
         return <Navigate to="/login" replace />
    }
    else{
            return <Outlet />
    }
   
  

}

export default ProtectedRoute