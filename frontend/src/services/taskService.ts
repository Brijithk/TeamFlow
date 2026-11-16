import api from "./api";
import type { CreateTaskData } from "../types/task";
export const createTask= async(taskData:CreateTaskData)=>{
     const response = await api.post("/api/tasks/team-lead/",taskData) 
     return response.data
}