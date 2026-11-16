import type { Dispatch, SetStateAction } from 'react'

export interface User{
       id:number 
       username:string 
       email:string
       role: "EMPLOYEE" | "TEAM_LEAD"
}
 
export interface AuthContextType{
    user: User |null
    setUser:Dispatch<SetStateAction<User | null>>
    loading:boolean
    setLoading:Dispatch<SetStateAction<boolean>>
}

export interface LoginResponse{
    refresh:string
    access:string
}