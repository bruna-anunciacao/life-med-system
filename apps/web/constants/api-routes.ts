// Centralização das rotas da API
export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REGISTER_PROFESSIONAL: "/auth/register/professional",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
  },
  USERS: {
    ME: "/users/me",
  },
  ADMIN: {
    PATIENTS: "/admin/patients",
    PROFESSIONALS: "/admin/professionals",
    VERIFY: (id: string) => `/admin/verify/${id}`,
    UPDATE_USER: (id: string) => `/admin/user/${id}`,
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
  APPOINTMENTS: {
    MY: "/appointments/my",
    CREATE: "/appointments",
    CANCEL: (id: string) => `/appointments/${id}`,
    SLOTS: "/appointments/slots",
  },
};
