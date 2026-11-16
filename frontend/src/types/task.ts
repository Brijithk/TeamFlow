export interface CreateTaskData{
    title :string
    description : string
    assigned_to : number
    priority : "LOW" | "MEDIUM" | "HIGH"
    due_date :string
}