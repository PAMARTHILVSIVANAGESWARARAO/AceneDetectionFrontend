import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

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
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────
// NOTE: OTP verification, resend OTP, forgot password and reset password routes
// have been removed from the backend (SMTP firewall blocked). Register now
// returns a JWT token directly — no OTP step required.
export const authAPI = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
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