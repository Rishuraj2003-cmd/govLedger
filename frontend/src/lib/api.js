import { getStoredToken, setStoredToken } from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// Request helper for FormData (file uploads) - do NOT set Content-Type so browser sets boundary
async function uploadRequest(path, formData) {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return data;
}

export const api = {
  getAuthStatus: () => request("/auth/status"),
  setupAdmin: (payload) => request("/auth/setup-admin", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  verifyEmailOtp: (payload) => request("/auth/verify-email", { method: "POST", body: JSON.stringify(payload) }),
  resendOtp: (payload) => request("/auth/resend-otp", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (payload) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) }),
  validateResetOtp: (payload) => request("/auth/validate-reset-otp", { method: "POST", body: JSON.stringify(payload) }),
  resetPassword: (payload) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),
  googleLogin: (payload) => request("/auth/google", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  updateWallet: (payload) => request("/auth/me/wallet", { method: "PATCH", body: JSON.stringify(payload) }),
  updateProfile: (payload) => request("/auth/me/profile", { method: "PATCH", body: JSON.stringify(payload) }),
  getReferenceData: () => request("/reference-data"),
  getOverview: () => request("/overview"),
  getProjects: () => request("/projects"),
  getProjectById: (id) => request(`/projects/${id}`),
  getTransactions: () => request("/transactions"),
  getAnalytics: () => request("/analytics"),
  getAuditReport: () => request("/audit/report"),
  getAnnouncements: () => request("/announcements"),
  createProject: (payload) => request("/projects", { method: "POST", body: JSON.stringify(payload) }),
  allocateFunds: (projectId, payload) => request(`/projects/${projectId}/allocate`, { method: "POST", body: JSON.stringify(payload) }),
  transferFunds: (projectId, payload) => request(`/projects/${projectId}/transfer`, { method: "POST", body: JSON.stringify(payload) }),
  createAnnouncement: (formData) => uploadRequest("/announcements", formData),
  getUsers: () => request("/users"),
  createUser: (payload) => request("/users", { method: "POST", body: JSON.stringify(payload) }),
  submitWork: (projectId, formData) => uploadRequest(`/projects/${projectId}/submit-work`, formData),
  getProjectSubmissions: (projectId) => request(`/projects/${projectId}/submissions`),
  getPendingSubmissions: () => request("/submissions/pending"),
  approveSubmission: (subId, payload) => request(`/submissions/${subId}/approve`, { method: "POST", body: JSON.stringify(payload) }),
  rejectSubmission: (subId, payload) => request(`/submissions/${subId}/reject`, { method: "POST", body: JSON.stringify(payload) }),
};

export function handleAuthSuccess(data) {
  if (data.token) {
    setStoredToken(data.token);
  }
  return data;
}
