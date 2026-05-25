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
  // Let the browser set the multipart boundary for FormData requests.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
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
      payload?.redirectTo &&
      // Avoid bouncing the patient back to the questionnaire when they have
      // just completed it: a residual request may still race the freshly
      // persisted state. The completion cookie is the source of truth here.
      Cookies.get(QUESTIONNAIRE_COMPLETED_KEY) !== "true"
    ) {
      Cookies.set(QUESTIONNAIRE_COMPLETED_KEY, "false", { expires: 1 });
      window.location.href = payload.redirectTo;
    }

    const raw = error.response?.data?.message ?? error.message;
    const message = Array.isArray(raw) ? raw.join(", ") : String(raw);
    error.message = message;
    return Promise.reject(error);
  },
);
