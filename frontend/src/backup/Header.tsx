import useAuth from "../hooks/useAuth"
import useLogout from "../hooks/useLogout"
const Header = () => {
    const {user} =useAuth()
    const {handleLogout,loading,setLoading,error,setError} = useLogout()
    return (<>
      <h1>TeamFlow</h1>
       <p>username :{user?.username}</p>
       <button type="button" onClick={handleLogout} disabled={loading}>Logout</button>
       <p>{error}</p>
    </>)
}

export default Header