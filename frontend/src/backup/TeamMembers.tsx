import { useState,useEffect } from "react"
import type { Employee } from "../../types/employee"
import { getEmployees } from "../../services/employeeService"
const TeamMembers = () => {

    const [employeeList, setEmployeeList] = useState<Employee[]>([])
    const [loading,setLoading]=useState(true)
    const fetchEmployees = async() => {
             try{
                      const response =await getEmployees() 
                      setEmployeeList(response)      
             }
             catch(e){
                  console.log(e)           
             }
             finally{
                   setLoading(false)
             }
    }
    useEffect(()=>{fetchEmployees()},[])
    return (<>
    
    {loading ? <p>Loading Employees...</p> : employeeList.length === 0 ?
        <p>No employees found</p>:<table>
            <thead>
                <tr>
                <th>Username</th>
                <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {
                    employeeList.map((emp)=>(
                        <tr key={emp.id}>
                              <td>{emp.username}</td>
                             <td> {emp.email}</td>
                        </tr>
                    ))
                }
            </tbody>
            </table>}
    
    </>)
}

export default TeamMembers