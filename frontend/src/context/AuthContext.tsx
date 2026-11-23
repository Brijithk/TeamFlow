import { createContext,  useState } from 'react'
import type { ReactNode } from 'react'
import type { User,AuthContextType } from '../types/auth'
import { useEffect } from 'react'
import { getCurrentUser } from '../services/authService'

export const AuthContext=createContext<AuthContextType | null>(null)

function AuthProvider({children}:{children:ReactNode}){
    const [user,setUser]=useState<User | null>(null);
    const [loading,setLoading]=useState(true);

    const handleAuthFailure =()=>{
                setUser(null)
                    setLoading(false)

    }     
            
    useEffect(()=>{
         window.addEventListener("auth-failed",handleAuthFailure)
      async function checkAuth(){
        try{
         
       const recUser=await getCurrentUser()
      setUser(recUser)
        }
        catch(e){
            setUser(null)}
            finally{
                setLoading(false)
            }
        }
    
    checkAuth();
return () => {
    window.removeEventListener("auth-failed", handleAuthFailure)
}    }
        
    ,[]);
    return(
         <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
    {children}
            </AuthContext.Provider>
    )
}

export default AuthProvider

