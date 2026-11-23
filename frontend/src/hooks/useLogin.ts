import { useState } from "react";
import { loginUser } from "../services/authService";
import { getCurrentUser } from "../services/authService";
import { getCsrfToken } from "../services/authService";
import useAuth from "./useAuth";
import {useNavigate} from "react-router"
import axios from "axios";
export const useLogin=()=>{
     const navigate=useNavigate()
    const [username,setUsername]=useState("")
    const [password,setPassword]=useState("")
    const [loading,setLoading]=useState(false)
    const [error,setError]=useState("")
    const {user,setUser} =useAuth()
    



    const handleLogin=async()=>{
                  try{
                        setLoading(true)
    setError("")
        await getCsrfToken()

    const response= await loginUser(username,password)
    const currentUser=await getCurrentUser()
    setUser(currentUser)
    navigate("/dashboard")
    }

    catch (e:unknown){
        if (axios.isAxiosError(e) && e.response?.status === 401){
                 setError("Invalid username or password.")   
        }
        else{
     setError("Login failed. Please try again.")
        }
    }
    finally{
       setLoading(false)
    }
    }


    return {username,setUsername,password,setPassword,
        loading,setLoading,error,setError,handleLogin
    }
}

