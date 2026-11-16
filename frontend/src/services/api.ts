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

export default api

