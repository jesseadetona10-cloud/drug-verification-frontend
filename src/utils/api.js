import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://drug-verification-backend.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(BASE_URL + "/auth/token/refresh/", { refresh });
          localStorage.setItem("access_token", res.data.access);
          error.config.headers.Authorization = "Bearer " + res.data.access;
          return API(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
