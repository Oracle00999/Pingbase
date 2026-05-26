import { apiRequest } from "../lib/api.js";

export function listWorkspaces() {
  return apiRequest("/workspaces?limit=50");
}

export function createWorkspace({ name }) {
  return apiRequest("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
