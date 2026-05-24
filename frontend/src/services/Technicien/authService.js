import axios from "axios";

const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

const API = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
});

export const registerPatient = async (data) => {
  const response = await API.post("/auth/register/patient", data);
  return response.data;
};
