import { logoutUser } from "../services/authService"
import useAuth from "./useAuth"
import { useState } from "react"
const useLogout =() =>{
    const {user,setUser} = useAuth();
    const [error,setError]=useState("")
    const [loading,setLoading]=useState(false)
      const handleLogout=async()=>{
            try{ 
                setLoading(true)
               const response=await logoutUser()
               setUser(null)
            }
            catch(e){
                      setError("Failed to Logout")
            }
            finally{
                 setLoading(false)
                 
            }
            
      }
      return {handleLogout,loading,setLoading,error,setError}
}

export default useLogout 