import { apiRequest } from "../lib/api.js";

export function listMonitors(workspaceId) {
  return apiRequest(`/workspaces/${workspaceId}/monitors?limit=50`);
}

export function createMonitor(workspaceId, monitor) {
  return apiRequest(`/workspaces/${workspaceId}/monitors`, {
    method: "POST",
    body: JSON.stringify(monitor),
  });
}

export function getMonitor(workspaceId, monitorId) {
  return apiRequest(`/workspaces/${workspaceId}/monitors/${monitorId}`);
}

export function updateMonitor(workspaceId, monitorId, updates) {
  return apiRequest(`/workspaces/${workspaceId}/monitors/${monitorId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function listMonitorChecks(workspaceId, monitorId) {
  return apiRequest(
    `/workspaces/${workspaceId}/monitors/${monitorId}/checks?limit=20`
  );
}

export function runMonitorCheck(workspaceId, monitorId) {
  return apiRequest(`/workspaces/${workspaceId}/monitors/${monitorId}/check`, {
    method: "POST",
  });
}

export function deleteMonitor(workspaceId, monitorId) {
  return apiRequest(`/workspaces/${workspaceId}/monitors/${monitorId}`, {
    method: "DELETE",
  });
}

export function pauseMonitor(workspaceId, monitorId) {
  return apiRequest(`/workspaces/${workspaceId}/monitors/${monitorId}/pause`, {
    method: "PATCH",
  });
}

export function resumeMonitor(workspaceId, monitorId) {
  return apiRequest(`/workspaces/${workspaceId}/monitors/${monitorId}/resume`, {
    method: "PATCH",
  });
}
