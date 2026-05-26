import { apiRequest } from "../lib/api.js";

export function listIncidents(workspaceId, status = "ALL") {
  const params = new URLSearchParams({ limit: "50" });

  if (status !== "ALL") {
    params.set("status", status);
  }

  return apiRequest(`/workspaces/${workspaceId}/incidents?${params}`);
}

export function getIncident(workspaceId, incidentId) {
  return apiRequest(`/workspaces/${workspaceId}/incidents/${incidentId}`);
}
