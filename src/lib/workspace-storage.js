const ACTIVE_WORKSPACE_KEY = "pingbase.activeWorkspaceId";

export function getActiveWorkspaceId() {
  return window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
}

export function setActiveWorkspaceId(workspaceId) {
  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
}

export function clearActiveWorkspaceId() {
  window.localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
}
