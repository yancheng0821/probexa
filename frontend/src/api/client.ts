import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api",
  timeout: 30000,
});

export default api;
