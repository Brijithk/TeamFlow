import api from "./axios";

export const getMyOrganizations = () => {
    return api.get("/accounts/my-organizations/");
};