import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { PulseDotLogo } from "../components/brand/PulseDotLogo.jsx";
import { appNavigation } from "../config/navigation.js";
import { Button } from "../components/ui/Button.jsx";
import { clearAuthToken } from "../lib/auth-storage.js";
import {
  clearActiveWorkspaceId,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "../lib/workspace-storage.js";
import { getCurrentUser } from "../services/auth-api.js";
import { listWorkspaces } from "../services/workspace-api.js";

export function AppShell() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState("");
  const [isLoadingShell, setIsLoadingShell] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadShellData() {
      try {
        const [userResult, workspaceResult] = await Promise.all([
          getCurrentUser(),
          listWorkspaces(),
        ]);

        if (isMounted) {
          const loadedWorkspaces = workspaceResult.data.workspaces;
          const savedWorkspaceId = getActiveWorkspaceId();
          const savedWorkspace = loadedWorkspaces.find(
            (workspace) => workspace.id === savedWorkspaceId
          );
          const nextActiveWorkspace = savedWorkspace || loadedWorkspaces[0];

          setUser(userResult.data.user);
          setWorkspaces(loadedWorkspaces);

          if (nextActiveWorkspace) {
            setActiveWorkspaceIdState(nextActiveWorkspace.id);
            setActiveWorkspaceId(nextActiveWorkspace.id);
          } else {
            clearActiveWorkspaceId();
          }
        }
      } catch {
        clearAuthToken();
        clearActiveWorkspaceId();
        navigate("/login", { replace: true });
      } finally {
        if (isMounted) {
          setIsLoadingShell(false);
        }
      }
    }

    loadShellData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    clearAuthToken();
    clearActiveWorkspaceId();
    navigate("/login", { replace: true });
  };

  const handleWorkspaceChange = (event) => {
    const nextWorkspaceId = event.target.value;

    setActiveWorkspaceIdState(nextWorkspaceId);
    setActiveWorkspaceId(nextWorkspaceId);
  };

  const handleWorkspaceCreated = (workspace) => {
    setWorkspaces((current) => {
      const workspaceExists = current.some((item) => item.id === workspace.id);

      if (workspaceExists) {
        return current;
      }

      return [workspace, ...current];
    });
    setActiveWorkspaceIdState(workspace.id);
    setActiveWorkspaceId(workspace.id);
  };

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link className="flex items-center gap-2 text-sm font-bold" to="/app">
            <PulseDotLogo />
            Pingbase
          </Link>
        </div>

        <nav className="space-y-1 p-3">
          {appNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
                end={item.href === "/app"}
                key={item.href}
                to={item.href}
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-5">
          <div className="min-w-0">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <p className="max-w-[11rem] truncate text-sm font-semibold text-slate-950 sm:max-w-xs">
                {isLoadingShell ? "Loading..." : user?.name || user?.email}
              </p>

              {workspaces.length > 0 ? (
                <select
                  className="h-9 max-w-[13rem] rounded-md border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:max-w-xs"
                  onChange={handleWorkspaceChange}
                  value={activeWorkspaceId}
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>

          <Button className="shrink-0 px-3 sm:px-4" onClick={handleLogout} variant="secondary">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-5 lg:pb-6">
          <Outlet
            context={{
              activeWorkspace,
              activeWorkspaceId,
              onWorkspaceCreated: handleWorkspaceCreated,
              isLoadingShell,
              user,
              workspaces,
            }}
          />
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 grid h-16 grid-cols-6 border-t border-slate-200 bg-white/95 px-1 backdrop-blur lg:hidden">
        {appNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold transition ${
                  isActive ? "text-slate-950" : "text-slate-500"
                }`
              }
              end={item.href === "/app"}
              key={item.href}
              to={item.href}
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
