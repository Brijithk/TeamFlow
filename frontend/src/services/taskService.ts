import api from "./api";
import type { CreateTaskData } from "../types/task";
import type { Task ,TaskStatus,TaskHistory} from "../types/task";

export const createTask= async(taskData:CreateTaskData)=>{
     const response = await api.post("/api/tasks/team-lead/",taskData) 
     return response.data
}

export const getTeamTasks=async()=>{
     const response=await api.get<Task[]>("/api/tasks/team-lead/")
     return response.data
}

export const updateTask = async(id:number,taskData:Partial<CreateTaskData>)=>{
       const response=await api.patch(`/api/tasks/team-lead/${id}/`,taskData)
       return response.data
}

export const deleteTask = async(id:number) =>{
     const response = await api.delete(`/api/tasks/team-lead/${id}/`)
     return response.data
}

export const getMyTasks= async()=>{
     const response= await api.get<Task[]>('/api/tasks/employee/')
     return response.data
}

export const updateTaskStatus =async(id:number,status:TaskStatus) =>{
         const response = await api.patch(`/api/tasks/employee/${id}/status/`,{status})
         return response.data
}

export const getTaskHistory = async() => {
        const response= await api.get<TaskHistory[]>("/api/tasks/history/")
        return response.data
}