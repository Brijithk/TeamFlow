import api from "./api";
import { Project } from "../types/project";

export const getMyProjects = async () => {
    const response = await api.get<Project[]>(
        "/api/my-projects/"
    );

    return response.data;
};

export interface CreateProjectData {
  name: string;
  key: string;
  description: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD";
    organization: number;
}

export const createProject = async (
  projectData: CreateProjectData
) => {
  const response = await api.post<Project>(
    "/api/projects/",
    projectData
  );

  return response.data;
};