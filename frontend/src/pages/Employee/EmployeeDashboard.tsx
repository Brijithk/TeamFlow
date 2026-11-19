import './EmployeeDashboard.css'
import { useState,useEffect } from 'react'
import type { Task } from '../../types/task'
import { getMyTasks } from '../../services/taskService'
const EmployeeDashboard =() =>{
    const [tasks,setTasks] =useState<Task[]>([])
    const [loading,setLoading]=useState(true)
    const [error,setError] =useState<string>("")
    const dateOptions: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};
    const getTasks = async() =>{
       try{
              const response=await getMyTasks()
              setTasks(response)
       }
       catch(e){
        setError("Error while fetching api")
        console.log(e)
       }
       finally{
           setLoading(false)
       }
    }
    useEffect(()=>{
        getTasks()
    },[])
return (<><p>Employee Dashboard</p>
<div className="summary-grid">
<div className="summary-card">
    <h1>My Total Tasks</h1>
    <p>{tasks.length}</p>
    </div>
<div className="summary-card">
      <h1>Pending Tasks</h1>
    <p>{tasks.filter((task)=>(task.status=="PENDING")).length}</p>
    </div>
<div className="summary-card">
      <h1>In Progress Tasks</h1>
    <p>{tasks.filter((task)=>(task.status=="IN_PROGRESS")).length}</p>
    </div>

<div className="summary-card">
      <h1>Completed Tasks</h1>
    <p>{tasks.filter((task)=>(task.status=="COMPLETED")).length}</p>
    </div>
     </div>
      <section>
        <h2>Recent-Tasks</h2>
      { loading ?<p>Loading tasks...</p> :error?<p>{error}</p>:tasks.length === 0 ?<p>No tasks assigned yet.</p> : <table>
            <thead>
            <tr>
                <th>Task Title</th>             
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
            </tr>
            </thead>
            <tbody>
               
                {
                  [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,5).map((task)=>(
                    <tr key={task.id}>
                        <td>{task.title}</td>
                        <td>{task.priority}</td>
                        <td>{task.status}</td>
                      <td>
  {task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-GB', dateOptions)
    : '—'}
</td>  
                   
                    </tr>
                  ))
                }
                </tbody>
            </table>   
            
      }
      </section>
   

</>)

}

export default EmployeeDashboard