import axios from "axios";
import { Capacitor } from "@capacitor/core";

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getServerBaseUrl() {
  try {
    return window.localStorage.getItem("royal-skye-server-url") || import.meta.env.VITE_API_BASE_URL || "";
  } catch {
    return import.meta.env.VITE_API_BASE_URL || "";
  }
}

const initialBaseUrl = getServerBaseUrl();
export const api = axios.create({ baseURL: initialBaseUrl });

function websocketUrl(baseUrl: string) {
  if (baseUrl) {
    const parsed = new URL(baseUrl);
    return `${parsed.protocol === "https:" ? "wss:" : "ws:"}//${parsed.host}`;
  }
  const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${socketProtocol}//${window.location.host}`;
}

export let wsBaseUrl = websocketUrl(initialBaseUrl);

export function setServerBaseUrl(value: string) {
  const normalized = normalizeBaseUrl(value);
  if (normalized) {
    const parsed = new URL(normalized);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Server address must begin with http:// or https://");
    }
    if (Capacitor.getPlatform() === "android" && parsed.protocol !== "https:") {
      throw new Error("Android requires trusted HTTPS. Install the Royal Skye local CA certificate, then use https://HOST-IP:8443.");
    }
    window.localStorage.setItem("royal-skye-server-url", normalized);
  } else {
    window.localStorage.removeItem("royal-skye-server-url");
  }
  api.defaults.baseURL = normalized;
  wsBaseUrl = websocketUrl(normalized);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("fullName");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(error: any, fallback = "The request failed.") {
  const response = error?.response;
  const detail = response?.data?.detail ?? response?.data?.message;
  const detailText = Array.isArray(detail)
    ? detail.map((item: any) => item?.msg || JSON.stringify(item)).join("; ")
    : typeof detail === "string" ? detail : detail ? JSON.stringify(detail) : "";
  if (detailText) return detailText;
  if (response) return `${fallback} (HTTP ${response.status}${response.statusText ? `: ${response.statusText}` : ""}).`;
  if (error?.request) return `${fallback} No response from the server; check the server address and confirm the restaurant host is running.`;
  return error?.message || fallback;
}
