import { useState } from "react"
import { useEffect } from "react"
import { getEmployees } from "../../services/employeeService"
import { createTask } from "../../services/taskService"
import type { CreateTaskData } from "../../types/task"
import type { Employee } from "../../types/employee"
import {useLocation} from 'react-router'
import { updateTask } from "../../services/taskService"
enum Priority{
  LOW="LOW",
  MEDIUM="MEDIUM",
  HIGH="HIGH"
}
function getLocalToday(): string {
 
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
const CreateTask = () => {
       const location = useLocation();
   const retrievedTask = location.state?.task;
   const isEditMode=Boolean(retrievedTask)
    const [employee,setEmployee] = useState<Employee[]>([])
    const [title,setTitle]=useState(retrievedTask?.title??"")
    const [description,setDescription] = useState(retrievedTask?.description??"")
    const [success,setSuccess]=useState("")
    const [assignTo,setAssignTo]= useState(retrievedTask ? String(retrievedTask.assigned_to) : "")
    const [priority,setPriority]=useState<Priority>(retrievedTask?.priority??Priority.LOW)
    const today = getLocalToday();
  const [dueDate, setDueDate] = useState<string>(retrievedTask?.deadline ??today);
    // const [dueDate,setDueDate]=useState("")
    const [error,setError]=useState("")
    // const today = new Date().toISOString().split('T')[0];
    const [loading,setLoading]=useState(false)
    const [submitting,setSubmitting]=useState(false)

      const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as Priority);
  };
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
       setError("")
       setSuccess("")
   
    if (!title.trim() || !description.trim() || !assignTo.trim()) {
    setError("Please fill all required fields.")
    return
}

if (!dueDate) {
    setError("Please select a date.")
    return
}

if (dueDate < today) {
    setError("Date cannot be in the past.")
    return
}
          
             //  submission code 
             const data : CreateTaskData ={
              "title":title,
              "description":description,
              "assigned_to":Number(assignTo),
              "priority":priority,
              "deadline":dueDate
             }
             try{
              setSubmitting(true)
              console.log(data)
              if(!isEditMode){
                   await createTask(data)

        
                   setSuccess("form submitted successfully")
              }
              else{
                await updateTask(retrievedTask.id, data)
                   setSuccess("form updated successfully")
              }
                   setTitle("")
                          setDescription("")
                         setAssignTo("")
                           setPriority(Priority.LOW)
                          setDueDate("")
             }
             catch(e:any){
                       setError("Failed to create task. Please try again.")   
                     console.log("API error:", e.response?.data)     }
             finally{
                        setSubmitting(false)
                          
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
        onChange={(e) => setAssignTo(e.target.value)} disabled={loading} required
      >
          <option value="">Select Employee</option>
      {loading?  <option value="">Loading employees...</option>
           :employee.length==0?(   <option value="" disabled>
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
        onChange={handleChange} required
      >
       {Object.values(Priority).map((priorityValue) => (
          <option key={priorityValue} value={priorityValue}>
            {priorityValue}
          </option>
        ))}
      </select>
      <label htmlFor="DueDate">Due Date</label>
      <input type="date" id="DueDate" min={today} value={dueDate} onChange={e=>setDueDate(e.target.value)} required/>
      <button type="submit" disabled={submitting}>{submitting?"Submitting..." : "Create Task"}</button>
        </form>
        <p>{success}</p>
        <p>{error}</p>
        </>)
}

export default CreateTask







