export interface CreateTaskData{
    title :string
    description : string
    assigned_to : number
    priority : "LOW" | "MEDIUM" | "HIGH"
    deadline :string
}

export type Priority = "LOW" | "MEDIUM" | "HIGH"

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED"


export interface Task{
     id : number
     title : string
     description : string
     priority : Priority
     status : TaskStatus
     deadline : string
     created_by : number
     assigned_to : number
     created_at : string
     updated_at :string
     assigned_to_username: string
     created_by_username: string
}

export interface TaskHistory{
     id:number
     task:number
     updated_by:number
     task_title:string
     updated_by_username:string
     old_status:TaskStatus | ""
     new_status:TaskStatus
     changed_at:string
}