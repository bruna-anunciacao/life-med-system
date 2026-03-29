// Centralização das rotas da API
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REGISTER_PROFESSIONAL: "/auth/register/professional",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USERS: {
    ME: "/users/me",
    PATIENTS: "/users/patients",
    PROFESSIONALS: "/users/professionals",
    VERIFY: (id: string) => `/users/${id}/verify`,
  },
  PATIENTS: {
    EXPORT_DONE_APPOINTMENTS: "/patients/export/done-appointments",
    EXPORT_PENDING_APPOINTMENTS: "/patients/export/pending-appointments",
    EXPORT_CANCELLED_APPOINTMENTS: "/patients/export/cancelled-appointments",
  },
  PROFESSIONALS: {
    SETTINGS: "/professional/settings",
    SCHEDULE: "/professional/schedule",
  },
};
