import api from "./api";
export const getEmployees =async() =>{
    

    const response=await api.get('/api/accounts/employees/')
    return response.data
}