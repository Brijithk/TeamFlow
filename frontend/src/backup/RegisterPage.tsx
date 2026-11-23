import { useState } from "react"
import { registerUser } from "../services/authService"
import { useNavigate } from "react-router-dom"
const RegisterPage = () => {
    const [username,setUsername]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [confirmPassword,setConfirmPassword]=useState("")
    const [error,setError]=useState("")
    const [success,setSuccess]=useState("")
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate()
    const handleRegister =async() =>{
        setError("")
        setSuccess("")
   if (password.length<4 || confirmPassword.length<4)
   {
    setError("Password must contain atleast 4 characters")
    return
   }
   if (password !== confirmPassword){
       setError("Password and confirm password doesn't match")
       return
   }
   try{

            setLoading(true)
            const response=await registerUser(username,email,password)
            setSuccess("Account created successfully!")
            navigate("/login")
              }
              catch(e){
                setError("Error while making api call")
              }   
              finally{
                setLoading(false)
              }

}
   return (<>
   <form onSubmit={(e)=>{e.preventDefault();handleRegister()}}>
    <input id="username" value={username} onChange={(e)=>{setUsername(e.target.value)}} type="text" required/>
    <input id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} type="email" required/>
    <input id="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} type="password" required/>
    <input id="confirmPassword" onChange={(e)=>{setConfirmPassword(e.target.value)}} value={confirmPassword} type="password" required/>
    <input type="submit" value={loading?"Creating":"Create Account"} disabled={loading}/>
   </form>
   {error && <p>{error}</p>}
   {success && <p>{success}</p>}
   </>)
}

export default RegisterPage