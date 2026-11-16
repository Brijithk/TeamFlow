import { useLogin } from "../hooks/useLogin"

const LoginTest =() =>{
    
    const {error,loading,username,setUsername,password,setPassword,handleLogin} = useLogin()
    return(<>
    <form onSubmit={e=>{e.preventDefault();handleLogin()}}>
    <input value={username} onChange={e=>setUsername(e.target.value)} name="username" type="text" />
    <input value={password} type="text" onChange={e=>{setPassword(e.target.value)}} name="password" />
    <button type="submit" disabled={loading}>
      {loading ? "Logging in...":"Login"}
    </button>
    </form>
    {error && <p>{error}</p>}
    </>)
}

export default LoginTest