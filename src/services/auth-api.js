import { apiRequest } from "../lib/api.js";

export function loginUser({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser({ email, name, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      name: name || undefined,
      password,
    }),
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}
