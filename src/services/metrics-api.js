import { apiRequest } from "../lib/api.js";

export function getWorkspaceMetricsSummary(workspaceId, days = 7) {
  return apiRequest(`/workspaces/${workspaceId}/metrics/summary?days=${days}`);
}
