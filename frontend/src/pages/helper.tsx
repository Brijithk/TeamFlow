import { useLogin } from "../hooks/useLogin";
import useAuth from "../hooks/useAuth";
const LoginPage =()=>{
    
     const {username,setUsername,password,setPassword,
        loading,error,handleLogin} =useLogin()
    
   const {user}=useAuth()
  
    return(
        <>
        <form onSubmit={e=>{e.preventDefault();handleLogin()}}>
            <label htmlFor="username">username</label>
            <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required/>
            <label htmlFor="password">password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
            <button type="submit" disabled={loading}>
            {loading?"Submiting...":"Submit"}
            </button>
        </form>
        {error && <p>{error}</p>}
        {user && <p>{user.username}</p>}
        </>
    )
}

export default LoginPage