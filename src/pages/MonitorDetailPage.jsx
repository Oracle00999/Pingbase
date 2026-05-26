import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Globe2,
  Pause,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { ResponseTimeChart } from "../components/charts/ResponseTimeChart.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { Input } from "../components/ui/Input.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { useToast } from "../components/ui/useToast.js";
import {
  formatDateTime,
  formatMilliseconds,
  formatNumber,
} from "../lib/format.js";
import {
  deleteMonitor,
  getMonitor,
  listMonitorChecks,
  pauseMonitor,
  resumeMonitor,
  runMonitorCheck,
  updateMonitor,
} from "../services/monitor-api.js";

const defaultEditForm = {
  name: "",
  url: "",
  method: "GET",
  expectedStatusCode: "200",
  timeoutMs: "5000",
  intervalSeconds: "60",
  failureThreshold: "3",
  recoveryThreshold: "1",
};

function buildEditForm(monitor) {
  if (!monitor) {
    return defaultEditForm;
  }

  return {
    name: monitor.name || "",
    url: monitor.url || "",
    method: monitor.method || "GET",
    expectedStatusCode: String(monitor.expectedStatusCode || 200),
    timeoutMs: String(monitor.timeoutMs || 5000),
    intervalSeconds: String(monitor.intervalSeconds || 60),
    failureThreshold: String(monitor.failureThreshold || 3),
    recoveryThreshold: String(monitor.recoveryThreshold || 1),
  };
}

function toMonitorUpdates(formData) {
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

export function MonitorDetailPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { monitorId } = useParams();
  const { activeWorkspaceId, isLoadingShell } = useOutletContext();
  const [monitor, setMonitor] = useState(null);
  const [checkResults, setCheckResults] = useState([]);
  const [editForm, setEditForm] = useState(defaultEditForm);
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [runError, setRunError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMonitorDetail() {
      if (!activeWorkspaceId || !monitorId) {
        return;
      }

      setError("");
      setRunError("");
      setIsLoading(true);

      try {
        const [monitorResult, checksResult] = await Promise.all([
          getMonitor(activeWorkspaceId, monitorId),
          listMonitorChecks(activeWorkspaceId, monitorId),
        ]);

        if (isMounted) {
          const loadedMonitor = monitorResult.data.monitor;

          setMonitor(loadedMonitor);
          setEditForm(buildEditForm(loadedMonitor));
          setCheckResults(checksResult.data.checkResults);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
          setMonitor(null);
          setCheckResults([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMonitorDetail();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId, monitorId]);

  const handleRunCheck = async () => {
    if (!activeWorkspaceId || !monitorId) {
      return;
    }

    setRunError("");
    setIsRunningCheck(true);

    try {
      const result = await runMonitorCheck(activeWorkspaceId, monitorId);

      setMonitor(result.data.monitor);
      setCheckResults((current) => [result.data.checkResult, ...current]);
      showToast({
        title: "Check completed",
        message: `${result.data.monitor.name} returned ${result.data.checkResult.status}.`,
        type: result.data.checkResult.status === "SUCCESS" ? "success" : "error",
      });
    } catch (requestError) {
      setRunError(requestError.message);
      showToast({
        title: "Check failed",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleDeleteMonitor = async () => {
    if (!activeWorkspaceId || !monitorId || !monitor) {
      return;
    }

    setError("");
    setRunError("");
    setIsDeleting(true);

    try {
      await deleteMonitor(activeWorkspaceId, monitorId);
      showToast({
        title: "Monitor deleted",
        message: `${monitor.name} was removed.`,
        type: "success",
      });
      navigate("/app/monitors", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        title: "Could not delete monitor",
        message: requestError.message,
        type: "error",
      });
      setIsDeleting(false);
    }
  };

  const handleToggleMonitorSchedule = async () => {
    if (!activeWorkspaceId || !monitorId || !monitor) {
      return;
    }

    setError("");
    setRunError("");
    setIsUpdatingSchedule(true);

    try {
      const action = monitor.status === "PAUSED" ? resumeMonitor : pauseMonitor;
      const result = await action(activeWorkspaceId, monitorId);
      setMonitor(result.data.monitor);
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
      setIsUpdatingSchedule(false);
    }
  };

  const updateEditField = (event) => {
    setEditForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleStartEditing = () => {
    setEditError("");
    setEditForm(buildEditForm(monitor));
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditError("");
    setEditForm(buildEditForm(monitor));
    setIsEditing(false);
  };

  const handleSaveMonitor = async (event) => {
    event.preventDefault();

    if (!activeWorkspaceId || !monitorId) {
      return;
    }

    setEditError("");
    setIsSaving(true);

    try {
      const result = await updateMonitor(
        activeWorkspaceId,
        monitorId,
        toMonitorUpdates(editForm)
      );

      setMonitor(result.data.monitor);
      setEditForm(buildEditForm(result.data.monitor));
      setIsEditing(false);
      showToast({
        title: "Monitor updated",
        message: `${result.data.monitor.name} was saved.`,
        type: "success",
      });
    } catch (requestError) {
      setEditError(requestError.message);
      showToast({
        title: "Could not save monitor",
        message: requestError.message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <Link
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            to="/app/monitors"
          >
            <ArrowLeft size={16} />
            Back to monitors
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate text-2xl font-bold">
              {isLoading ? "Loading monitor..." : monitor?.name || "Monitor"}
            </h1>
            {monitor ? <StatusBadge status={monitor.status} /> : null}
          </div>
          <p className="mt-2 break-all text-sm text-slate-600">
            {monitor?.url || "Fetching monitor details."}
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            disabled={
              isLoadingShell ||
              isLoading ||
              isSaving ||
              isRunningCheck ||
              isUpdatingSchedule ||
              isDeleting ||
              monitor?.status === "PAUSED" ||
              !monitor
            }
            onClick={handleRunCheck}
          >
            {isRunningCheck ? <RefreshCw size={16} /> : <Play size={16} />}
            {isRunningCheck ? "Running..." : "Run check"}
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={
              isLoadingShell ||
              isLoading ||
              isSaving ||
              isRunningCheck ||
              isUpdatingSchedule ||
              isDeleting ||
              !monitor
            }
            onClick={handleStartEditing}
            variant="secondary"
          >
            <Pencil size={16} />
            Edit
          </Button>
          <Button
            className="w-full sm:w-auto"
            disabled={
              isLoadingShell ||
              isLoading ||
              isSaving ||
              isRunningCheck ||
              isUpdatingSchedule ||
              isDeleting ||
              !monitor
            }
            onClick={handleToggleMonitorSchedule}
            variant="secondary"
          >
            {monitor?.status === "PAUSED" ? (
              <Play size={16} />
            ) : (
              <Pause size={16} />
            )}
            {isUpdatingSchedule
              ? "Updating..."
              : monitor?.status === "PAUSED"
                ? "Resume"
                : "Pause"}
          </Button>
          <Button
            className="w-full text-red-700 hover:bg-red-50 sm:w-auto"
            disabled={
              isLoadingShell ||
              isLoading ||
              isSaving ||
              isRunningCheck ||
              isUpdatingSchedule ||
              isDeleting ||
              !monitor
            }
            onClick={() => setIsDeleteDialogOpen(true)}
            variant="ghost"
          >
            <Trash2 size={16} />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      {runError ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {runError}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ["Method", monitor?.method, Globe2],
          ["Expected", monitor?.expectedStatusCode, ExternalLink],
          ["Timeout", formatMilliseconds(monitor?.timeoutMs), Clock],
          ["Interval", monitor ? `${formatNumber(monitor.intervalSeconds)}s` : "--", RefreshCw],
        ].map(([label, value, Icon]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={label}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon size={18} className="text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold">{isLoading ? "--" : value}</p>
          </div>
        ))}
      </div>

      {isEditing ? (
        <form
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSaveMonitor}
        >
          <div>
            <h2 className="text-lg font-bold">Edit monitor</h2>
            <p className="mt-1 text-sm text-slate-600">
              Update the endpoint, schedule, and status rules for this monitor.
            </p>
          </div>

          {editError ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {editError}
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Name</span>
              <Input
                name="name"
                onChange={updateEditField}
                required
                value={editForm.name}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">URL</span>
              <Input
                name="url"
                onChange={updateEditField}
                required
                type="url"
                value={editForm.url}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                Method
              </span>
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                name="method"
                onChange={updateEditField}
                value={editForm.method}
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
                onChange={updateEditField}
                required
                type="number"
                value={editForm.expectedStatusCode}
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
                onChange={updateEditField}
                required
                step="1000"
                type="number"
                value={editForm.timeoutMs}
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
                onChange={updateEditField}
                required
                type="number"
                value={editForm.intervalSeconds}
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
                onChange={updateEditField}
                required
                type="number"
                value={editForm.failureThreshold}
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
                onChange={updateEditField}
                required
                type="number"
                value={editForm.recoveryThreshold}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              disabled={isSaving}
              onClick={handleCancelEditing}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      ) : null}

      <ResponseTimeChart checkResults={checkResults} />

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold">Schedule</h2>
          <div className="mt-4 space-y-4 text-sm">
            {[
              ["Last checked", formatDateTime(monitor?.lastCheckedAt)],
              ["Next check", formatDateTime(monitor?.nextCheckAt)],
              ["Failures", formatNumber(monitor?.consecutiveFailures)],
              ["Successes", formatNumber(monitor?.consecutiveSuccesses)],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between gap-4" key={label}>
                <span className="font-medium text-slate-500">{label}</span>
                <span className="text-right font-bold text-slate-950">
                  {isLoading ? "--" : value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <h2 className="text-lg font-bold">Recent checks</h2>
            <span className="text-sm font-medium text-slate-500">
              {isLoading ? "Loading..." : `${checkResults.length} shown`}
            </span>
          </div>

          {checkResults.length === 0 && !isLoading ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                <Clock size={20} />
              </div>
              <h3 className="mt-4 text-lg font-bold">No checks yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Run a manual check to create the first result, or wait for the
                scheduler to pick it up.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {checkResults.map((check) => (
                <article
                  className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start"
                  key={check.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={check.status} />
                      <span className="text-sm font-semibold text-slate-600">
                        {formatDateTime(check.checkedAt)}
                      </span>
                    </div>
                    {check.errorMessage ? (
                      <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        {check.errorMessage}
                      </p>
                    ) : null}
                  </div>

                  <div className="grid w-full grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Status
                      </p>
                      <p className="mt-1 font-bold">
                        {check.responseStatusCode || "--"}
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase text-slate-400">
                        Time
                      </p>
                      <p className="mt-1 font-bold">
                        {formatMilliseconds(check.responseTimeMs)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        confirmLabel="Delete monitor"
        description={
          monitor
            ? `${monitor.name} will be permanently removed, including its check history and incidents.`
            : ""
        }
        isLoading={isDeleting}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
          }
        }}
        onConfirm={handleDeleteMonitor}
        title="Delete monitor?"
      />
    </div>
  );
}
