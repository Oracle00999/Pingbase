import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Activity, Clock, Server, ShieldCheck } from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import {
  formatMilliseconds,
  formatNumber,
  formatPercent,
} from "../lib/format.js";
import { getWorkspaceMetricsSummary } from "../services/metrics-api.js";

function getWorkspaceStatus(summary) {
  if (!summary || summary.monitors.total === 0) {
    return "UNKNOWN";
  }

  if (summary.monitors.down > 0) {
    return "DOWN";
  }

  if (summary.monitors.degraded > 0) {
    return "DEGRADED";
  }

  return "UP";
}

export function DashboardPage() {
  const { activeWorkspace, activeWorkspaceId, isLoadingShell } =
    useOutletContext();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      if (!activeWorkspaceId) {
        return;
      }

      setError("");
      setIsLoadingSummary(true);

      try {
        const result = await getWorkspaceMetricsSummary(activeWorkspaceId);

        if (isMounted) {
          setSummary(result.data.summary);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
          setSummary(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    }

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, [activeWorkspaceId]);

  const stats = useMemo(
    () => [
      {
        label: "Monitors",
        value: formatNumber(summary?.monitors.total),
        icon: Server,
      },
      {
        label: "Uptime",
        value: formatPercent(summary?.checks.uptimePercentage),
        icon: ShieldCheck,
      },
      {
        label: "Avg latency",
        value: formatMilliseconds(summary?.checks.averageResponseTimeMs),
        icon: Clock,
      },
      {
        label: "Open incidents",
        value: formatNumber(summary?.incidents.open),
        icon: Activity,
      },
    ],
    [summary]
  );

  const workspaceStatus = getWorkspaceStatus(summary);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            {activeWorkspace
              ? `${activeWorkspace.name} health over the last 7 days.`
              : "Loading your workspace dashboard."}
          </p>
        </div>
        <StatusBadge className="self-start sm:self-auto" status={workspaceStatus} />
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              key={stat.label}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <Icon size={18} className="text-slate-400" />
              </div>
              <p className="mt-3 text-3xl font-bold">
                {isLoadingShell || isLoadingSummary ? "--" : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {summary?.monitors.total === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-bold">No monitors yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Monitor management comes next. Once a monitor exists, this dashboard
            will show real uptime, latency, and incident health.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Monitor status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                ["Up", summary?.monitors.up],
                ["Down", summary?.monitors.down],
                ["Degraded", summary?.monitors.degraded],
                ["Unknown", summary?.monitors.unknown],
              ].map(([label, value]) => (
                <div className="rounded-md bg-slate-50 p-3" key={label}>
                  <p className="text-2xl font-bold">{formatNumber(value)}</p>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Checks</h2>
            <div className="mt-4 space-y-3">
              {[
                ["Total", summary?.checks.total],
                ["Successful", summary?.checks.successful],
                ["Failed", summary?.checks.failed],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between" key={label}>
                  <span className="text-sm font-medium text-slate-500">
                    {label}
                  </span>
                  <span className="text-sm font-bold">
                    {formatNumber(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
