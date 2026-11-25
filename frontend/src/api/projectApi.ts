import api from "./axios";

export const getMyProjects = () => {
    return api.get("/my-projects/");
};