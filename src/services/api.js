import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor – inject token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("acnepilot_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("acnepilot_token");
      localStorage.removeItem("acnepilot_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  verifyOtp: (data) => apiClient.post("/auth/verify-otp", data),
  resendOtp: (data) => apiClient.post("/auth/resend-otp", data),
  login: (data) => apiClient.post("/auth/login", data),
  forgotPassword: (data) => apiClient.post("/auth/forgot-password", data),
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),
  getUserCount: () => apiClient.get("/auth/users/count"),
};

// ─── User Info API ────────────────────────────────────────────────────────────
export const userAPI = {
  saveUserInfo: (data) => apiClient.post("/auth/userinfo", data),
  getMyUserInfo: () => apiClient.get("/auth/userinfo"),
  getUserStatus: () => apiClient.get("/auth/user-status"),
  uploadAcneImages: (formData) =>
    apiClient.post("/auth/upload-acne", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    }),
};

// ─── Treatment API ────────────────────────────────────────────────────────────
export const treatmentAPI = {
  generateDayOne: () => apiClient.post("/treatment/start"),
  submitReview: (data) => apiClient.post("/treatment/review", data),
  getStatus: () => apiClient.get("/treatment/status"),
};

export default apiClient;
