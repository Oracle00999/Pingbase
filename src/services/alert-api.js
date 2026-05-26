import { apiRequest } from "../lib/api.js";

export function listAlertChannels(workspaceId) {
  return apiRequest(`/workspaces/${workspaceId}/alert-channels?limit=50`);
}

export function createAlertChannel(workspaceId, channel) {
  return apiRequest(`/workspaces/${workspaceId}/alert-channels`, {
    method: "POST",
    body: JSON.stringify({
      type: "WEBHOOK",
      ...channel,
    }),
  });
}

export function updateAlertChannel(workspaceId, channelId, updates) {
  return apiRequest(`/workspaces/${workspaceId}/alert-channels/${channelId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteAlertChannel(workspaceId, channelId) {
  return apiRequest(`/workspaces/${workspaceId}/alert-channels/${channelId}`, {
    method: "DELETE",
  });
}

export function listAlertEvents(workspaceId, filters = {}) {
  const params = new URLSearchParams({ limit: "50" });

  if (filters.eventType && filters.eventType !== "ALL") {
    params.set("eventType", filters.eventType);
  }

  if (filters.deliveryStatus && filters.deliveryStatus !== "ALL") {
    params.set("deliveryStatus", filters.deliveryStatus);
  }

  return apiRequest(`/workspaces/${workspaceId}/alert-events?${params}`);
}
