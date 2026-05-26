import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Database, LogOut, Plus, UserRound } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { useToast } from "../components/ui/useToast.js";
import { clearAuthToken } from "../lib/auth-storage.js";
import { clearActiveWorkspaceId } from "../lib/workspace-storage.js";
import { formatDateTime } from "../lib/format.js";
import { createWorkspace } from "../services/workspace-api.js";

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="break-all text-sm font-bold text-slate-950">
        {value || "--"}
      </span>
    </div>
  );
}

export function SettingsPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const {
    activeWorkspace,
    isLoadingShell,
    onWorkspaceCreated,
    user,
    workspaces,
  } = useOutletContext();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const handleLogout = () => {
    clearAuthToken();
    clearActiveWorkspaceId();
    navigate("/login", { replace: true });
  };

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    setWorkspaceError("");
    setIsCreatingWorkspace(true);

    try {
      const result = await createWorkspace({ name: workspaceName.trim() });
      onWorkspaceCreated(result.data.workspace);
      setWorkspaceName("");
      showToast({
        title: "Workspace created",
        message: `${result.data.workspace.name} is now active.`,
        type: "success",
      });
    } catch (requestError) {
      setWorkspaceError(requestError.message);
      showToast({
        title: "Could not create workspace",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your account and workspace preferences.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <UserRound size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">Account</h2>
              <p className="text-sm text-slate-600">
                Basic details for the current signed-in user.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <DetailRow label="Name" value={user?.name || "Not set"} />
            <DetailRow label="Email" value={user?.email} />
            <DetailRow
              label="Account created"
              value={formatDateTime(user?.createdAt)}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <LogOut size={20} />
            </span>
            <div>
              <h2 className="text-lg font-bold">Sign out</h2>
              <p className="text-sm text-slate-600">
                Leave this account on this device.
              </p>
            </div>
          </div>

          <Button className="mt-5 w-full" onClick={handleLogout} variant="secondary">
            <LogOut size={16} />
            Logout
          </Button>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <Database size={20} />
          </span>
          <div>
            <h2 className="text-lg font-bold">Workspace</h2>
            <p className="text-sm text-slate-600">
              Current workspace selected for dashboard, monitors, incidents, and alerts.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <DetailRow label="Name" value={activeWorkspace?.name} />
          <DetailRow label="Role" value={activeWorkspace?.role} />
          <DetailRow label="Workspace ID" value={activeWorkspace?.id} />
          <DetailRow
            label="Created"
            value={formatDateTime(activeWorkspace?.createdAt)}
          />
          <DetailRow label="Available workspaces" value={workspaces.length} />
        </div>

        <form
          className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4"
          onSubmit={handleCreateWorkspace}
        >
          <h3 className="text-base font-bold">Create workspace</h3>
          <p className="mt-1 text-sm text-slate-600">
            Add another workspace for a different team, product, or project.
          </p>

          {workspaceError ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {workspaceError}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              maxLength={100}
              onChange={(event) => setWorkspaceName(event.target.value)}
              placeholder="Workspace name"
              required
              value={workspaceName}
            />
            <Button
              className="shrink-0"
              disabled={isCreatingWorkspace}
              type="submit"
            >
              <Plus size={16} />
              {isCreatingWorkspace ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Preferences</h2>
        <p className="mt-1 text-sm text-slate-600">
          More options like notifications, team members, and appearance can live
          here when those features are added.
        </p>
        <div className="mt-5">
          <DetailRow
            label="Default workspace"
            value={isLoadingShell ? "Loading..." : activeWorkspace?.name}
          />
          <DetailRow label="Notifications" value="Webhook alerts" />
        </div>
      </section>
    </div>
  );
}
