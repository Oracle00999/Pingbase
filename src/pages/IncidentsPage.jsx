import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { formatDateTime } from "../lib/format.js";
import { listIncidents } from "../services/incident-api.js";

const filters = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Resolved", value: "RESOLVED" },
];

function formatDuration(durationMs) {
  if (durationMs === null || durationMs === undefined) {
    return "--";
  }

  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes < 1) {
    return `${seconds}s`;
  }

  if (minutes < 60) {
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function IncidentsPage() {
  const { activeWorkspace, activeWorkspaceId, isLoadingShell } =
    useOutletContext();
  const [incidents, setIncidents] = useState([]);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const counts = useMemo(
    () =>
      incidents.reduce(
        (summary, incident) => ({
          ...summary,
          [incident.status]: (summary[incident.status] || 0) + 1,
        }),
        {}
      ),
    [incidents]
  );

  async function loadIncidents(status = activeFilter) {
    if (!activeWorkspaceId) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await listIncidents(activeWorkspaceId, status);
      setIncidents(result.data.incidents);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialIncidents() {
      if (!activeWorkspaceId) {
        return;
      }

      setError("");
      setIsLoading(true);

      try {
        const result = await listIncidents(activeWorkspaceId, activeFilter);

        if (isMounted) {
          setIncidents(result.data.incidents);
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

    loadInitialIncidents();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId, activeFilter]);

  const handleFilterChange = (nextFilter) => {
    setActiveFilter(nextFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Incidents</h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeWorkspace
              ? `Availability events for ${activeWorkspace.name}.`
              : "Loading workspace incidents."}
          </p>
        </div>

        <Button
          disabled={isLoading || isLoadingShell}
          onClick={() => loadIncidents()}
          variant="secondary"
        >
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Shown", incidents.length, Clock],
          ["Open", counts.OPEN || 0, AlertTriangle],
          ["Resolved", counts.RESOLVED || 0, CheckCircle2],
        ].map(([label, value, Icon]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={label}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon size={18} className="text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {isLoading ? "--" : value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex w-fit rounded-md border border-slate-200 bg-white p-1 shadow-sm">
        {filters.map((filter) => (
          <button
            className={`h-9 rounded px-3 text-sm font-semibold transition ${
              activeFilter === filter.value
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            }`}
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold">Incident history</h2>
          <span className="text-sm font-medium text-slate-500">
            {isLoading ? "Loading..." : `${incidents.length} shown`}
          </span>
        </div>

        {incidents.length === 0 && !isLoading ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="mt-4 text-lg font-bold">No incidents found</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Incidents appear here when a monitor crosses its failure threshold
              and moves into a down state.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {incidents.map((incident) => (
              <article className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]" key={incident.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-bold">
                      {incident.monitor?.name || "Monitor"}
                    </h3>
                    <StatusBadge status={incident.status} />
                  </div>

                  <p className="mt-2 break-all text-sm text-slate-600">
                    {incident.monitor?.url}
                  </p>

                  {incident.failureReason ? (
                    <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {incident.failureReason}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[420px]">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Started
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {formatDateTime(incident.startedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Resolved
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {formatDateTime(incident.resolvedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Duration
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {incident.status === "OPEN"
                        ? "Ongoing"
                        : formatDuration(incident.durationMs)}
                    </p>
                  </div>

                  <div className="sm:col-span-3">
                    <Link
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                      to={`/app/monitors/${incident.monitorId}`}
                    >
                      Open monitor
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
