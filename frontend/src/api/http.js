import axios from "axios";

// Base URL comes from env to support dev/staging/prod without code changes.
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const http = axios.create({
  baseURL,
  withCredentials: true,
});

// Keep Authorization header in sync with auth state.
export function setAuthToken(token) {
  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common.Authorization;
  }
}
