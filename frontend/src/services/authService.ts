import api from "./api";
export const loginUser = async(username:string,password:string) =>{

    const response =await api.post("/api/accounts/login/",{username,password})
    return response.data
}
export const logoutUser = async() => {
     const response=await api.post("/api/accounts/logout/")
     return response.data
}
export const getCsrfToken = async() =>{
      const response =await api.get("/api/accounts/csrf/")
      return response.data
}

export const getCurrentUser=async()=>{
     const response=await api.get("/api/accounts/me/")
     return response.data
}