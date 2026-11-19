import { useState,useEffect } from "react"
import type { Task,TaskStatus } from "../../types/task"
import { getMyTasks } from "../../services/taskService"
import { updateTaskStatus } from "../../services/taskService"
const MyTasks =()=>{
    const [tasks,setTasks]= useState<Task[]>([])
    const [loading,setLoading]= useState(true)
    const [statusUpdating,setStatusUpdating] = useState(false)
    const getTask = async() =>{
        try{
  
            const response = await getMyTasks()
            setTasks(response)
        }
        catch(e){
            console.log(e)
        }
        finally{
            setLoading(false)
        }
    }
    const handleStatusUpdate = async(id: number,status: TaskStatus) =>{
           try{
            setStatusUpdating(true)
                     await updateTaskStatus(id, status)
                     setTasks(previousTask=>
                         previousTask.map(task =>
                             task.id == id ? {...task,status:status} : task
                         )
                     )
           }
           catch(e:unknown){
                                    console.log("API error:", e)        
           }
           finally{
                      setStatusUpdating(false)
           }
    }
    useEffect(()=>{getTask()},[])
    return(<>
        {loading?<p>Loading...</p>:<p>My Assigned Tasks: {tasks.length}</p>}
        
        { !loading &&
        <table>
            <thead><tr>
                   <th>Task Title</th>
                   <th>Description</th>
                   <th>Assigned By</th>
                   <th>Priority</th>
                   <th>Status</th>
                   <th>Deadline</th>
                   <th>Action</th>
                </tr></thead>
                <tbody>
                    
              
            {tasks.map((task)=>(
                <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>{task.created_by}</td>
                    <td>{task.priority}</td>
                    <td>{task.status}</td>
                    <td>{task.deadline}</td>
                    <td><select name="status" value={task.status} id="status" disabled={statusUpdating || task.status === "COMPLETED"} onChange={(e)=>{
                        const currentStatus=e.target.value as TaskStatus
                        handleStatusUpdate(task.id, currentStatus)
                    }
                    }>
                       <option disabled={statusUpdating}>{task.status}</option>   
                              <option>PENDING</option> 
                                     <option>IN_PROGRESS</option> 
                                            <option>COMPLETED</option>  
                        </select></td>
                </tr>
            ))}
              </tbody>
        </table>

        }
        </>
    )
}
export default MyTasks