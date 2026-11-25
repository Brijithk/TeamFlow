import api from "./api";
import { Organization } from "../types/organization";
export const getMyOrganizations = async () => {
  const response = await api.get("/api/accounts/my-organizations/");

  console.log("My Organizations API:", response.data);

  return response.data;
};