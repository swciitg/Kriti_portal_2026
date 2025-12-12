// src/constants.js
export const BACKEND_URL = "http://localhost:5000";
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const TECHSECY_ROUTES = {
  OPEN_PS: `${API_BASE}/techsecy/ps`,
  MY_PS: `${API_BASE}/techsecy/my-ps`,
  REGISTER_TEAM: `${API_BASE}/techsecy/team`,
  TEAM_AND_CONFIG: (psId) => `${API_BASE}/techsecy/team/${psId}`,
};

export const SUBMISSION_ROUTES = {
  BY_PS: (psId) => `${API_BASE}/submissions/get-all/${psId}`,
};
