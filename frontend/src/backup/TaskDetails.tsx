import { useLocation } from "react-router";
import { useNavigate } from "react-router";
const TaskDetails = () => {
    const location =useLocation()
    const navigate=useNavigate()
    const selectedTask = location.state.task
    return (<>
    <p>Title:
        {selectedTask.title}</p>
        <p>Description :{selectedTask.description}</p>
        <p>Assigned By :{selectedTask.created_by_username}</p>
        <p>Priority :{selectedTask.priority}</p>
        <p>Status :{selectedTask.status}</p>
        <p>Deadline :{selectedTask.deadline}</p>
        
        <button onClick={()=>{navigate(-1)}}>Back</button>
        </>)
}

export default TaskDetails