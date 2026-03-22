// Centralização das rotas da API
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_PROFESSIONAL: '/auth/register/professional',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    ME: '/users/me',
    PATIENTS: '/users/patients',
    // Adicione outras rotas conforme necessário
  },
};
