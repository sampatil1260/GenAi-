/**
 * Axios API client — centralizes all backend communication.
 * Automatically attaches JWT token from localStorage to all requests.
 */
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const TOKEN_KEY = "ami_token";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 min — audio processing can be slow
});

// ── Interceptor — attach JWT to every request ───────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const signupUser = async (name, email, password) => {
  const response = await api.post("/auth/signup", { name, email, password });
  return response.data;
};

// ── Meetings ────────────────────────────────────────────────────

export const uploadMeeting = async (title, file) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMeetings = async () => {
  const response = await api.get("/meetings");
  return response.data;
};

export const getMeeting = async (id) => {
  const response = await api.get(`/meetings/${id}`);
  return response.data;
};

export const getMeetingSummary = async (id) => {
  const response = await api.get(`/meetings/${id}/summary`);
  return response.data;
};

export const deleteMeeting = async (id) => {
  const response = await api.delete(`/meetings/${id}`);
  return response.data;
};

// ── Search ──────────────────────────────────────────────────────

export const searchMeetings = async (query, topK = 5) => {
  const response = await api.post("/search", { query, top_k: topK });
  return response.data;
};

export default api;