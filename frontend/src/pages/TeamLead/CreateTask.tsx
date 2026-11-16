import { useState } from "react"
import { useEffect } from "react"
import { getEmployees } from "../../services/employeeService"
import { createTask } from "../../services/taskService"
import { CreateTaskData } from "../../types/task"
import type { Employee } from "../../types/employee"
const CreateTask = () => {
    const [employee,setEmployee] = useState<Employee[]>([])
    const [title,setTitle]=useState("")
    const [description,setDescription] = useState("")
    const [assignTo,setAssignTo]= useState("")
    const [priority,setPriority]=useState("")
    const [dueDate,setDueDate]=useState("")
    const [error,setError]=useState("")
    const today = new Date().toISOString().split('T')[0];
    const [loading,setLoading]=useState(false)
    const getEmployeeList=async()=>{
        try{
            setLoading(true)
           const response = await  getEmployees();
           setEmployee(response)
        }
        catch(e){
                console.log("error while fetching data")
        }
        finally{
                   setLoading(false)
        }
    }
    useEffect(()=>{
                    getEmployeeList()
    }
        ,[])
    const handleSubmit =async() =>{
       let error=""
       setError("")
          if (!title.trim() || !description.trim() || !assignTo.trim() || !priority.trim())
          {
          error="fill all fields"
          
          }
           if (!dueDate) {
      error='Please select a date.'
    } else if (dueDate < today) {
      error='Date cannot be in the past.'
    } 
          if (!error){
             //  submission code 
             const data ={
              "title":title,
              "description":description,
              "assigned_to":Number(assignTo),
              "priority":priority,
              "due_date":dueDate
             }
          }
          else{
            setError(error)
          }

    }
    return (<>
    
    <form onSubmit={e=>{e.preventDefault();handleSubmit()}}>
        <label htmlFor="Task-Title">Task Title :</label>
        <input type="text" id="Task-Title" value={title} onChange={e=>setTitle(e.target.value)} required/>
        <label htmlFor="Description">Description :
             <textarea value={description} onChange={e=>setDescription(e.target.value)} name="Description" id="Description" placeholder="Enter multiple lines of text..." required></textarea>
        </label>

       
           <label htmlFor="assign-to">Choose:</label>
      <select
        id="assign-to"
        value={assignTo}
        onChange={(e) => setAssignTo(e.target.value)} required
      >
          <option value="">Select Employee</option>
      
           {employee.length==0?(   <option value="" disabled>
      No employees available
    </option>):(

            
                employee.map((emp)=>(
                  <option key={emp.id} value={emp.id}>{emp.username}</option>
            )
                     )
           )}

      </select>
         <label htmlFor="role-select">Choose a Priority:</label>
      <select
        id="role-select"
        value={priority}
        onChange={(e) => setPriority(e.target.value)} required
      >
        <option value="">Select Priority</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <label htmlFor="DueDate">Due Date</label>
      <input type="date" id="DueDate" min={today} value={dueDate} onChange={e=>setDueDate(e.target.value)} required/>
      <button type="submit">Create Task</button>
        </form>
        <p>{error}</p>
        </>)
}

export default CreateTask







