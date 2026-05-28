import apiClient from "../api";

const TOKEN_KEY = "technicien_token";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getAuthHeaders = (contentType = "application/json") => {
  const headers = {
    Authorization: `Bearer ${getToken()}`,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
};

export const registerPatient = async (data) => {
  return apiClient.post("/api/auth/register/patient", data);
};

export const loginTechnicien = async (email, password) => {
  const response = await apiClient.post("/api/tech/login/technicien", {
    username: email,
    password,
  });

  const token = response?.access_token || response?.token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  return response;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const getProfilTechnicien = async () => {
  return apiClient.request("/api/tech/profil", {
    method: "GET",
    headers: getAuthHeaders(null),
  });
};

export const getStatsTechnicien = async () => {
  return apiClient.request("/api/tech/stats", {
    method: "GET",
    headers: getAuthHeaders(null),
  });
};

export const updateProfilTechnicien = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  if (isFormData) {
    return apiClient.request("/api/tech/profil", {
      method: "PUT",
      headers: getAuthHeaders(null),
      body: data,
    });
  }

  const formData = new FormData();

  if (data?.fullName !== undefined) {
    formData.append("fullName", data.fullName);
  }

  if (data?.telephone !== undefined && data.telephone !== null) {
    formData.append("telephone", data.telephone);
  }

  if (data?.avatar) {
    formData.append("avatar", data.avatar);
  }

  return apiClient.request("/api/tech/profil", {
    method: "PUT",
    headers: getAuthHeaders(null),
    body: formData,
  });
};

export const ensureAuthenticated = () => {
  if (!isAuthenticated() && typeof window !== "undefined") {
    window.location.href = "/login-technicien";
    return false;
  }

  return true;
};
