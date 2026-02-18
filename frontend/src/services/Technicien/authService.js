import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/tech/login/technicien"; // adapte selon ton backend

const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
};

const getToken = () => {
  return localStorage.getItem("token");
};

const authService = {
  login,
  logout,
  getToken,
};

export default authService;
