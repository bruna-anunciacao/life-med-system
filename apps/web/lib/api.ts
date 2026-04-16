import axios from "axios";
import Cookies from "js-cookie";
import { QUESTIONNAIRE_COMPLETED_KEY } from "./auth-constants";
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;

    if (
      typeof window !== "undefined" &&
      payload?.code === "QUESTIONNAIRE_REQUIRED" &&
      payload?.redirectTo
    ) {
      Cookies.set(QUESTIONNAIRE_COMPLETED_KEY, "false", { expires: 1 });
      window.location.href = payload.redirectTo;
    }

    const raw = error.response?.data?.message ?? error.message;
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw);
    return Promise.reject(new Error(message));
  },
);
