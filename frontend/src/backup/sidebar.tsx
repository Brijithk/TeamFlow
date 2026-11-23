import useAuth from "../hooks/useAuth";
import {NavLink} from "react-router"
const Sidebar =()=>{

  const {user} = useAuth()
  
    return (<aside>
        <h1>TeamFlow</h1>
        <nav>
            { user?.role === "TEAM_LEAD" &&
            <>
            <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard"}>Overview</NavLink>
            <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard/tasks"}>Manage Tasks</NavLink>
            <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard/tasks/create"}>Create Task</NavLink>
            <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard/team"}>Team Members</NavLink>
            <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard/history"}>Task History</NavLink>
            </>
         }
         { user?.role === "EMPLOYEE" &&
         <>
            <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard"}>Overview</NavLink>
             <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard/my-tasks"}>My Tasks</NavLink>
              <NavLink end className={({isActive})=>isActive?"active":"inactive"} to={"/dashboard/history"}>Task History</NavLink>
            </>
         }
        </nav>
    </aside>)
}

export default Sidebar