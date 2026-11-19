import type { TaskHistory } from "../../types/task"
import { useState ,useEffect} from "react"
import { getTaskHistory } from "../../services/taskService"
const TaskHistory =()=>{
    const [history,setHistory] = useState<TaskHistory[]>([])
    const [loading,setLoading]=useState(true)
    const getHistory = async() =>{
           try{
                     
                      const response=await getTaskHistory()
                      setHistory(response)
           }
           catch(e){
             console.log(e)
           }
           finally{
                     setLoading(false)
           }
    }
   
    useEffect(()=>{getHistory()},[])

  return(<>
    
    {loading ? <p>Loading history...</p>:
    
      <table>
    <thead>
        <tr>
            <th>Task</th>
            <th>Updated By</th>
            <th>Previous Status</th>
            <th>New Status</th>
            <th>Updated At</th>
        </tr>
    </thead>
    <tbody>
        {
            history.map((historyItem)=>(

                <tr key={historyItem.id}>
                    <td>{historyItem.task_title}</td>
                    <td>{historyItem.updated_by_username}</td>
                    <td>{historyItem.old_status}</td>
                    <td>{historyItem.new_status}</td>
                    <td>{historyItem.changed_at}</td> 
                </tr>
            ))
        }
    </tbody>
  </table>
    }


  {history.length === 0 && !loading && <p>No task history available.</p>}
    
  </>)
}

export default TaskHistory