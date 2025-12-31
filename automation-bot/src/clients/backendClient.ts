import axios from "axios";
import env from "../config/env";

const backendClient = axios.create({
  baseURL: env.BACKEND_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default backendClient;
