import { formatDateTime, formatMilliseconds } from "../../lib/format.js";

const chartWidth = 720;
const chartHeight = 240;
const padding = {
  bottom: 34,
  left: 46,
  right: 18,
  top: 22,
};

function buildChartPoints(checkResults) {
  const checks = [...checkResults]
    .reverse()
    .filter(
      (check) =>
        check.responseTimeMs !== null && check.responseTimeMs !== undefined
    );

  if (checks.length === 0) {
    return [];
  }

  const maxResponseTime = Math.max(
    ...checks.map((check) => check.responseTimeMs),
    1
  );
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  return checks.map((check, index) => {
    const x =
      checks.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (index / (checks.length - 1)) * plotWidth;
    const y =
      padding.top +
      plotHeight -
      (check.responseTimeMs / maxResponseTime) * plotHeight;

    return {
      check,
      x,
      y,
    };
  });
}

function buildPath(points) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function buildAreaPath(points) {
  if (points.length === 0) {
    return "";
  }

  const baseline = chartHeight - padding.bottom;
  const linePath = buildPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
}

export function ResponseTimeChart({ checkResults }) {
  const points = buildChartPoints(checkResults);
  const responseTimes = points.map((point) => point.check.responseTimeMs);
  const minResponseTime = responseTimes.length ? Math.min(...responseTimes) : null;
  const maxResponseTime = responseTimes.length ? Math.max(...responseTimes) : null;
  const averageResponseTime = responseTimes.length
    ? responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length
    : null;
  const successCount = checkResults.filter(
    (check) => check.status === "SUCCESS"
  ).length;
  const failureCount = checkResults.filter(
    (check) => check.status === "FAILURE"
  ).length;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h2 className="text-lg font-bold">Response time trend</h2>
          <p className="mt-1 text-sm text-slate-600">
            Based on the most recent check results loaded for this monitor.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          {[
            ["Avg", formatMilliseconds(averageResponseTime)],
            ["Min", formatMilliseconds(minResponseTime)],
            ["Max", formatMilliseconds(maxResponseTime)],
          ].map(([label, value]) => (
            <div className="rounded-md bg-slate-50 px-3 py-2" key={label}>
              <p className="text-xs font-semibold uppercase text-slate-400">
                {label}
              </p>
              <p className="mt-1 font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        <svg
          className="block h-auto min-h-60 w-full"
          role="img"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <title>Recent response time chart</title>
          <rect fill="#111118" height={chartHeight} width={chartWidth} />
          {[0.25, 0.5, 0.75].map((line) => {
            const y =
              padding.top +
              (chartHeight - padding.top - padding.bottom) * line;

            return (
              <line
                key={line}
                stroke="#282836"
                strokeDasharray="5 5"
                strokeWidth="1"
                x1={padding.left}
                x2={chartWidth - padding.right}
                y1={y}
                y2={y}
              />
            );
          })}

          <line
            stroke="#3a3a48"
            strokeWidth="1.5"
            x1={padding.left}
            x2={padding.left}
            y1={padding.top}
            y2={chartHeight - padding.bottom}
          />
          <line
            stroke="#3a3a48"
            strokeWidth="1.5"
            x1={padding.left}
            x2={chartWidth - padding.right}
            y1={chartHeight - padding.bottom}
            y2={chartHeight - padding.bottom}
          />

          {points.length > 0 ? (
            <>
              <path d={buildAreaPath(points)} fill="#7c3aed" opacity="0.16" />
              <path
                d={buildPath(points)}
                fill="none"
                stroke="#a78bfa"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />

              {points.map((point) => (
                <g key={point.check.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    fill="#111118"
                    r="8"
                    stroke={
                      point.check.status === "SUCCESS" ? "#10b981" : "#ef4444"
                    }
                    strokeWidth="3"
                  >
                    <title>
                      {`${formatMilliseconds(point.check.responseTimeMs)} at ${formatDateTime(
                        point.check.checkedAt
                      )}`}
                    </title>
                  </circle>
                </g>
              ))}
            </>
          ) : (
            <>
              <path
                d="M 70 150 C 180 120, 260 170, 350 138 S 540 125, 650 155"
                fill="none"
                stroke="#7c3aed"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeWidth="4"
              />
              <text
                fill="#f4f4f5"
                fontSize="16"
                fontWeight="700"
                textAnchor="middle"
                x={chartWidth / 2}
                y="98"
              >
                No response time data yet
              </text>
              <text
                fill="#a1a1aa"
                fontSize="13"
                textAnchor="middle"
                x={chartWidth / 2}
                y="120"
              >
                Run a check to start drawing the chart.
              </text>
            </>
          )}

          <text
            fill="#8b8b96"
            fontSize="12"
            x={padding.left}
            y={chartHeight - 12}
          >
            Oldest
          </text>
          <text
            fill="#8b8b96"
            fontSize="12"
            textAnchor="end"
            x={chartWidth - padding.right}
            y={chartHeight - 12}
          >
            Newest
          </text>
          <text fill="#8b8b96" fontSize="12" x="10" y={padding.top + 5}>
            {formatMilliseconds(maxResponseTime)}
          </text>
        </svg>
      </div>

      {points.length === 0 ? (
        <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
          The chart appears after this monitor has at least one check result.
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {successCount} successful
        </span>
        <span className="inline-flex items-center gap-2 font-medium text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          {failureCount} failed
        </span>
      </div>
    </section>
  );
}
