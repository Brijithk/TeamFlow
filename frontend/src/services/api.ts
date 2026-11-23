import axios from 'axios'


const api = axios.create({
          baseURL: "http://localhost:8000/",
            withCredentials: true,
            withXSRFToken: true,
            xsrfCookieName: "csrftoken",
            xsrfHeaderName: "X-CSRFToken",
          headers:{
            "Content-Type":"application/json",

          }
})

api.interceptors.response.use(
  (response)=>
    response
    ,async(error)=>{
    const originalRequest = error.config
   
          if(!originalRequest){
           return Promise.reject(error)
          }
           if(originalRequest.url?.includes("/api/accounts/login/")){
                  return Promise.reject(error)

    }
       if(originalRequest.url?.includes("/api/accounts/token/refresh/")){
                  return Promise.reject(error)

    }

    if(error.response?.status==401 &&  !originalRequest._retry){
                  originalRequest._retry = true
                  try{
                  await refreshApi.post("/api/accounts/token/refresh/",{})
                   return api(originalRequest)
                  }
                  catch(e){
                    window.dispatchEvent(new Event("auth-failed"))
                    return Promise.reject(e)
                  }
    }
    return Promise.reject(error)
  }
)

export const refreshApi = axios.create({
          baseURL: "http://localhost:8000/",
            withCredentials: true,
            withXSRFToken: true,
            xsrfCookieName: "csrftoken",
            xsrfHeaderName: "X-CSRFToken",
          headers:{
            "Content-Type":"application/json",

          }
})

export default api

