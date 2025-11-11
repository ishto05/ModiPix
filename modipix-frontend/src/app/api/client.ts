import axios from "axios";
import { getToken } from "@clerk/nextjs";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
});

api.interceptors.request.use(async (config) => {
  const token = await getToken({ template: "default" });
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

