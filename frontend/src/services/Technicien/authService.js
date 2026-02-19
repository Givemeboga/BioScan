import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api",
});

export const registerPatient = async (data) => {
  const response = await API.post("/auth/register/patient", data);
  return response.data;
};
