import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  Gauge,
  Globe2,
  ShieldAlert,
} from "lucide-react";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";

const sections = [
  {
    title: "Create a monitor",
    icon: Activity,
    body: "A monitor is the API or website endpoint Pingbase checks repeatedly.",
    items: [
      "Use a full http or https URL.",
      "Choose the HTTP method and expected status code.",
      "Set the timeout and check interval.",
      "Use thresholds to avoid noisy one-off failures.",
    ],
    action: { label: "Go to monitors", to: "/app/monitors" },
  },
  {
    title: "Run checks",
    icon: Clock,
    body: "Checks can run automatically on an interval, or manually from a monitor detail page.",
    items: [
      "Manual checks are useful after creating or editing a monitor.",
      "Each check stores status, response code, response time, and error message.",
      "Paused monitors do not run scheduled or manual checks.",
    ],
  },
  {
    title: "Track incidents",
    icon: ShieldAlert,
    body: "Incidents open when a monitor crosses its failure threshold and becomes DOWN.",
    items: [
      "An incident stays open while the monitor remains down.",
      "It resolves automatically when the monitor recovers.",
      "Resolved incidents keep their duration and failure reason.",
    ],
    action: { label: "View incidents", to: "/app/incidents" },
  },
  {
    title: "Send webhooks",
    icon: Bell,
    body: "Webhook channels receive JSON alerts when incidents open or resolve.",
    items: [
      "Use Pipedream, Zapier, Make, Slack workflows, Discord, or your own endpoint.",
      "Only active webhook channels receive alerts.",
      "Delivery events show whether each webhook was sent or failed.",
    ],
    action: { label: "Set up alerts", to: "/app/alerts" },
  },
];

const statusDocs = [
  ["UNKNOWN", "The monitor has not produced enough useful check history yet."],
  ["UP", "The latest checks are passing as expected."],
  ["DEGRADED", "A failure happened, but the failure threshold has not been reached."],
  ["DOWN", "The monitor has reached its failure threshold."],
  ["PAUSED", "Scheduled checks are stopped until the monitor is resumed."],
];

export function DocsPage() {
  const isAppDocs = window.location.pathname.startsWith("/app");
  const primaryAction = isAppDocs
    ? { label: "Go to monitors", to: "/app/monitors" }
    : { label: "Start free", to: "/register" };
  const alertAction = isAppDocs
    ? { label: "Set up alerts", to: "/app/alerts" }
    : { label: "Create account", to: "/register" };

  return (
    <div className={isAppDocs ? "space-y-6" : "mx-auto max-w-6xl space-y-6 px-5 pb-16 pt-8"}>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-slate-500">
              Documentation
            </p>
            <h1 className="mt-2 text-3xl font-bold">Using Pingbase</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              A quick guide to monitors, checks, incidents, and alert channels.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {[
              ["Monitor", Globe2],
              ["Check", CheckCircle2],
              ["Incident", Gauge],
              ["Webhook", Bell],
            ].map(([label, Icon]) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                key={label}
              >
                <Icon size={16} className="text-slate-500" />
                <p className="mt-1 font-semibold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <section
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={section.title}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Icon size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {section.body}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {section.items.map((item) => (
                  <li className="flex gap-2 text-sm leading-6 text-slate-700" key={item}>
                    <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={15} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {section.action || section.title === "Create a monitor" ? (
                <Link
                  className="mt-5 inline-flex h-9 items-center rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  to={
                    section.title === "Create a monitor"
                      ? primaryAction.to
                      : section.title === "Send webhooks"
                        ? alertAction.to
                        : section.action.to
                  }
                >
                  {section.title === "Create a monitor"
                    ? primaryAction.label
                    : section.title === "Send webhooks"
                      ? alertAction.label
                      : section.action.label}
                </Link>
              ) : null}
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Monitor statuses</h2>
        <p className="mt-1 text-sm text-slate-600">
          These statuses appear across the dashboard, monitor list, and detail pages.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {statusDocs.map(([status, description]) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={status}>
              <StatusBadge status={status} />
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Recommended first setup</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {[
            ["1", "Create a monitor for your public API health endpoint."],
            ["2", "Run a manual check and confirm the expected status code."],
            ["3", "Add a webhook channel in Alerts."],
            ["4", "Let scheduled checks build your uptime history."],
          ].map(([step, text]) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={step}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                {step}
              </span>
              <p className="mt-3 text-sm leading-6 text-slate-700">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
