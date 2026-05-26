export function formatNumber(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return new Intl.NumberFormat("en").format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${Number(value || 0).toFixed(1)}%`;
}

export function formatMilliseconds(value) {
  if (value === null || value === undefined) {
    return "--";
  }

  return `${formatNumber(Math.round(value))}ms`;
}

export function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
