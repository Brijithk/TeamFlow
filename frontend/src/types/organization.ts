export interface Organization {
    id: number;
    name: string;
    slug: string;
    role: "ADMIN" | "MEMBER";
}