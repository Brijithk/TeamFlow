import { useState } from "react"
import { useEffect } from "react"
import { getTeamTasks } from "../../services/taskService"
import type { Task } from "../../types/task"
import axios from "axios"
import { useNavigate } from "react-router"
import { deleteTask } from "../../services/taskService"
const ManageTasks = () => {
  const [taskList,setTaskList] = useState<Task[]>([])
   const [loading,setLoading]= useState(true)
  //  const [selectedTask,setSelectedTask]=useState<Task | null>(null)
   const [error,setError] =useState("")
   const [deleting,setDeleting] =useState(false)
   const navigate=useNavigate()
  const getAllTask = async() =>{
    try{
     const response=await getTeamTasks()
     setTaskList(response)
    }
   catch (e: unknown) {
  if (axios.isAxiosError(e)) {
    console.log("API error:", e.response?.data);
    setError("API error")
  } else {
    console.log("Unexpected error:", e);
    setError("Unexpected error")
  }
}
    finally{
                setLoading(false)
    }
  }
   useEffect(()=>{getAllTask()},[])
   const performDelete =async(id:number) =>{
      try{
        setDeleting(true)
        await deleteTask(id)
        const filteredTask=taskList.filter((val)=>!(val.id==id))
        setTaskList(filteredTask)
        
      }
      catch(e){
        console.log(e)
      }
      finally{
        setDeleting(false)
      }
   }
    return (<>
    
     <section>
        <h2>Manage Tasks</h2>
               {loading? <p>Loading tasks....</p>:error?<p>{error}
               </p>: 
        <table>
            <thead>
            <tr>
                <th>Task Title</th>
                 <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
            </tr>
            </thead>
         
            <tbody>
               {
                taskList.map((task)=>(

                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.assigned_to_username}</td>
                    <td>{task.priority}</td>
                    <td>{task.status}</td>
                    <td>{task.deadline}</td>
                    
                    <td>
                      <button onClick={()=>{
                         navigate("/dashboard/tasks/create",{
                               state: {
                                   task:task
    }
                         })
                      }}>edit</button>
                        <button disabled={deleting} onClick={() => performDelete(task.id)}>delete</button>
                    </td>
                  </tr>
                ))
               }
                </tbody>
                  
            </table> }  
        
      </section>
    </>)
} 

export default ManageTasks