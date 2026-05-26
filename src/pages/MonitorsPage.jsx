import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Activity,
  Clock,
  ExternalLink,
  Globe2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { Input } from "../components/ui/Input.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { useToast } from "../components/ui/useToast.js";
import {
  createMonitor,
  deleteMonitor,
  listMonitors,
  pauseMonitor,
  resumeMonitor,
} from "../services/monitor-api.js";

const defaultFormData = {
  name: "",
  url: "",
  method: "GET",
  expectedStatusCode: "200",
  timeoutMs: "5000",
  intervalSeconds: "60",
  failureThreshold: "3",
  recoveryThreshold: "1",
};

const statusFilters = ["ALL", "UP", "DOWN", "DEGRADED", "UNKNOWN", "PAUSED"];

function toMonitorPayload(formData) {
  return {
    name: formData.name.trim(),
    url: formData.url.trim(),
    method: formData.method,
    expectedStatusCode: Number(formData.expectedStatusCode),
    timeoutMs: Number(formData.timeoutMs),
    intervalSeconds: Number(formData.intervalSeconds),
    failureThreshold: Number(formData.failureThreshold),
    recoveryThreshold: Number(formData.recoveryThreshold),
  };
}

function formatInterval(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  }

  return `${Math.round(seconds / 3600)}h`;
}

export function MonitorsPage() {
  const { showToast } = useToast();
  const { activeWorkspace, activeWorkspaceId, isLoadingShell } =
    useOutletContext();
  const [monitors, setMonitors] = useState([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingMonitorId, setDeletingMonitorId] = useState("");
  const [monitorPendingDelete, setMonitorPendingDelete] = useState(null);
  const [updatingMonitorId, setUpdatingMonitorId] = useState("");

  const filteredMonitors = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return monitors.filter((monitor) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        monitor.name.toLowerCase().includes(normalizedSearch) ||
        monitor.url.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "ALL" || monitor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [monitors, searchQuery, statusFilter]);

  const statusCounts = useMemo(
    () =>
      monitors.reduce(
        (counts, monitor) => ({
          ...counts,
          [monitor.status]: (counts[monitor.status] || 0) + 1,
        }),
        {}
      ),
    [monitors]
  );

  async function loadMonitors() {
    if (!activeWorkspaceId) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await listMonitors(activeWorkspaceId);
      setMonitors(result.data.monitors);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialMonitors() {
      if (!activeWorkspaceId) {
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const result = await listMonitors(activeWorkspaceId);

        if (isMounted) {
          setMonitors(result.data.monitors);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialMonitors();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeWorkspaceId) {
      return;
    }

    setFormError("");
    setIsCreating(true);

    try {
      const result = await createMonitor(
        activeWorkspaceId,
        toMonitorPayload(formData)
      );

      setMonitors((current) => [result.data.monitor, ...current]);
      setFormData(defaultFormData);
      setIsFormOpen(false);
      showToast({
        title: "Monitor created",
        message: `${result.data.monitor.name} is ready to check.`,
        type: "success",
      });
    } catch (requestError) {
      setFormError(requestError.message);
      showToast({
        title: "Could not create monitor",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteMonitor = async () => {
    if (!activeWorkspaceId) {
      return;
    }

    if (!monitorPendingDelete) {
      return;
    }

    setError("");
    setDeletingMonitorId(monitorPendingDelete.id);

    try {
      await deleteMonitor(activeWorkspaceId, monitorPendingDelete.id);
      setMonitors((current) =>
        current.filter((item) => item.id !== monitorPendingDelete.id)
      );
      showToast({
        title: "Monitor deleted",
        message: `${monitorPendingDelete.name} was removed.`,
        type: "success",
      });
      setMonitorPendingDelete(null);
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Could not delete monitor",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setDeletingMonitorId("");
    }
  };

  const handleToggleMonitorSchedule = async (monitor) => {
    if (!activeWorkspaceId) {
      return;
    }

    setError("");
    setUpdatingMonitorId(monitor.id);

    try {
      const action =
        monitor.status === "PAUSED" ? resumeMonitor : pauseMonitor;
      const result = await action(activeWorkspaceId, monitor.id);

      setMonitors((current) =>
        current.map((item) =>
          item.id === monitor.id ? result.data.monitor : item
        )
      );
      showToast({
        title:
          monitor.status === "PAUSED" ? "Monitor resumed" : "Monitor paused",
        message: result.data.monitor.name,
        type: "success",
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Could not update monitor",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setUpdatingMonitorId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Monitors</h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeWorkspace
              ? `Endpoints watched in ${activeWorkspace.name}.`
              : "Loading your workspace monitors."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isLoading || isLoadingShell}
            onClick={loadMonitors}
            variant="secondary"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button
            disabled={!activeWorkspaceId}
            onClick={() => setIsFormOpen((current) => !current)}
          >
            <Plus size={16} />
            New monitor
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Total", monitors.length],
          ["Up", statusCounts.UP || 0],
          ["Down", statusCounts.DOWN || 0],
          ["Unknown", statusCounts.UNKNOWN || 0],
        ].map(([label, value]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={label}
          >
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <Input
              className="pl-9"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search monitors by name or URL"
              value={searchQuery}
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <button
                className={`h-9 rounded-md border px-3 text-sm font-semibold transition ${
                  statusFilter === status
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                }`}
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {status === "ALL" ? "All" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Create monitor</h2>
              <p className="mt-1 text-sm text-slate-600">
                Add an API or website endpoint to check on an interval.
              </p>
            </div>
          </div>

          {formError ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <Input
                name="name"
                onChange={updateField}
                placeholder="API Health"
                required
                value={formData.name}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">URL</span>
              <Input
                name="url"
                onChange={updateField}
                placeholder="https://example.com/health"
                required
                type="url"
                value={formData.url}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Method
              </span>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                name="method"
                onChange={updateField}
                value={formData.method}
              >
                {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map(
                  (method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Expected status
              </span>
              <Input
                max="599"
                min="100"
                name="expectedStatusCode"
                onChange={updateField}
                required
                type="number"
                value={formData.expectedStatusCode}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Timeout
              </span>
              <Input
                max="120000"
                min="1000"
                name="timeoutMs"
                onChange={updateField}
                required
                step="1000"
                type="number"
                value={formData.timeoutMs}
              />
              <span className="block text-xs font-medium text-slate-500">
                In milliseconds.
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Interval
              </span>
              <Input
                max="86400"
                min="30"
                name="intervalSeconds"
                onChange={updateField}
                required
                type="number"
                value={formData.intervalSeconds}
              />
              <span className="block text-xs font-medium text-slate-500">
                In seconds. Minimum is 30.
              </span>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Failure threshold
              </span>
              <Input
                max="10"
                min="1"
                name="failureThreshold"
                onChange={updateField}
                required
                type="number"
                value={formData.failureThreshold}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Recovery threshold
              </span>
              <Input
                max="10"
                min="1"
                name="recoveryThreshold"
                onChange={updateField}
                required
                type="number"
                value={formData.recoveryThreshold}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              onClick={() => setIsFormOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button disabled={isCreating} type="submit">
              {isCreating ? "Creating..." : "Create monitor"}
            </Button>
          </div>
        </form>
      ) : null}

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold">All monitors</h2>
          <span className="text-sm font-medium text-slate-500">
            {isLoading
              ? "Loading..."
              : `${filteredMonitors.length} shown of ${monitors.length}`}
          </span>
        </div>

        {monitors.length === 0 && !isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Activity size={20} />
            </div>
            <h3 className="mt-4 text-lg font-bold">No monitors yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Create your first monitor to start tracking uptime, latency, and
              incidents.
            </p>
          </div>
        ) : filteredMonitors.length === 0 && !isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <Search size={20} />
            </div>
            <h3 className="mt-4 text-lg font-bold">No monitors found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Try a different search term or status filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredMonitors.map((monitor) => (
              <article
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]"
                key={monitor.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-bold">
                      {monitor.name}
                    </h3>
                    <StatusBadge status={monitor.status} />
                  </div>

                  <div className="mt-2 flex min-w-0 flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                      <Globe2 size={15} />
                      {monitor.method}
                    </span>
                    <span className="truncate">{monitor.url}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[440px]">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Expected
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {monitor.expectedStatusCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Interval
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {formatInterval(monitor.intervalSeconds)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Timeout
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {monitor.timeoutMs}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Next check
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 font-bold text-slate-950">
                      <Clock size={14} />
                      {monitor.nextCheckAt ? "Scheduled" : "--"}
                    </p>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-4">
                    <Link
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      to={`/app/monitors/${monitor.id}`}
                    >
                      View details
                      <ExternalLink size={14} />
                    </Link>
                    <Button
                      className="h-9 px-3"
                      disabled={
                        updatingMonitorId === monitor.id ||
                        deletingMonitorId === monitor.id
                      }
                      onClick={() => handleToggleMonitorSchedule(monitor)}
                      variant="secondary"
                    >
                      {monitor.status === "PAUSED" ? (
                        <Play size={15} />
                      ) : (
                        <Pause size={15} />
                      )}
                      {updatingMonitorId === monitor.id
                        ? "Updating..."
                        : monitor.status === "PAUSED"
                          ? "Resume"
                          : "Pause"}
                    </Button>
                    <Button
                      className="h-9 px-3 text-red-700 hover:bg-red-50"
                      disabled={
                        deletingMonitorId === monitor.id ||
                        updatingMonitorId === monitor.id
                      }
                      onClick={() => setMonitorPendingDelete(monitor)}
                      variant="ghost"
                    >
                      <Trash2 size={15} />
                      {deletingMonitorId === monitor.id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="Delete monitor"
        description={
          monitorPendingDelete
            ? `${monitorPendingDelete.name} will be permanently removed, including its check history and incidents.`
            : ""
        }
        isLoading={Boolean(deletingMonitorId)}
        isOpen={Boolean(monitorPendingDelete)}
        onClose={() => {
          if (!deletingMonitorId) {
            setMonitorPendingDelete(null);
          }
        }}
        onConfirm={handleDeleteMonitor}
        title="Delete monitor?"
      />
    </div>
  );
}
