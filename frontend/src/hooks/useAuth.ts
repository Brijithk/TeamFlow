import { useContext } from "react";
import {AuthContext} from "../context/AuthContext"


const useAuth=()=>{

       const context = useContext(AuthContext)

       if (!context){
        throw new Error("useAuth must be used within AuthProvider")
       }

        const {user,setUser,loading,setLoading} = context

        return {user,setUser,loading,setLoading}

}

export default useAuth