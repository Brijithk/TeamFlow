export interface Project {
    id: number;
    organization: number;
    name: string;
    key: string;
    description: string;
    status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
    role: "MANAGER" | "MEMBER" | "REVIEWER";
}