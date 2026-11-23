import "./TeamLeadDashboard.css"
import type { Task } from "../../types/task"
import { getTeamTasks } from "../../services/taskService"
import { useState ,useEffect} from "react"
const TeamLeadDashboard =() =>{
           
    const [tasks,setTasks]=useState<Task[]>([])
    const [loading,setLoading]=useState(true)
    const [error,setError]=useState<string>("")

    const fetchTeamTasks = async() => {
        try{
                    setError("")
                  const response=await getTeamTasks()
                  setTasks(response)
        }
        catch(e:unknown){
                            setError("Error while fetching data")
        }
        finally{
                      setLoading(false)
        }
    }
    useEffect(()=>{fetchTeamTasks()},[])
return (<><h1>Team Lead Dashboard 1</h1>
<div className="summary-grid">
<div className="summary-card">
    <h1>Total Tasks</h1>
    <p>{tasks.length}</p>
    </div>
<div className="summary-card">
      <h1>Pending Tasks</h1>
    <p>{tasks.filter((task)=>(task.status==="PENDING")).length}</p>
    </div>
<div className="summary-card">
      <h1>In Progress Tasks</h1>
    <p>{tasks.filter((task)=>(task.status==="IN_PROGRESS")).length}</p>
    </div>

<div className="summary-card">
      <h1>Completed Tasks</h1>
    <p>{tasks.filter((task)=>(task.status==="COMPLETED")).length}</p>
    </div>
     </div>
      <section>
        <h2>Recent-Tasks</h2>
          {loading?<p>Loading Recent Task</p>:error?<p>Error while fetching data</p>
          :tasks.length==0?<p>No Tasks</p>:
        <table>
            <thead>
            <tr>
                <th>Task Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
            </tr>
            </thead>
            <tbody>
              
                {
                    [...tasks].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,5).map((task)=>(
                       <tr key={task.id}>
                         <td>{task.title}</td>
                         <td>{task.assigned_to_username}</td>
                         <td>{task.priority}</td>
                         <td>{task.status}</td>
                         <td>{task.deadline}</td>
                       </tr> 
                    ))
                }
                </tbody>
            </table> 
      }   

      </section>
   

</>)
        
}

export default TeamLeadDashboard
