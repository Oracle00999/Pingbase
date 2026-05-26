import { ArrowRight, CheckCircle2, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";
import { PingBackground } from "../components/visual/PingBackground.jsx";

export function LandingPage() {
  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 overflow-hidden px-5 pb-16 pt-8 lg:grid-cols-[1fr_0.9fr]">
      <PingBackground />

      <div className="hero-enter relative z-10 max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
          <CheckCircle2 size={16} className="text-emerald-600" />
          API monitoring for fast-moving teams
        </div>

        <h1 className="max-w-xl text-5xl font-bold leading-[1.05] text-slate-950 md:text-7xl">
          Pingbase
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Track uptime, latency, incidents, and alerts from one calm dashboard.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register">
            <Button className="group">
              Start monitoring
              <ArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={16}
              />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Log in</Button>
          </Link>
        </div>
      </div>

      <div className="hero-enter hero-enter-delay-2 relative z-10 min-h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="absolute inset-x-4 top-4 flex items-center justify-between rounded-md border border-slate-200 bg-slate-950 px-4 py-3 text-white">
          <div>
            <p className="text-xs text-slate-300">Live status</p>
            <p className="text-sm font-semibold">All systems responsive</p>
          </div>
          <Gauge size={20} />
        </div>

        <div className="mt-20 grid gap-3">
          {[
            ["Auth API", "UP", "87ms", "bg-emerald-500", "shadow-emerald-200"],
            [
              "Billing webhook",
              "UP",
              "143ms",
              "bg-emerald-500",
              "shadow-emerald-200",
            ],
            [
              "Search service",
              "DEGRADED",
              "702ms",
              "bg-amber-500",
              "shadow-amber-200",
            ],
            [
              "Status page",
              "UP",
              "64ms",
              "bg-emerald-500",
              "shadow-emerald-200",
            ],
          ].map(([name, status, latency, color, shadow], index) => (
            <div
              className={`hero-enter grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 ${
                index === 0
                  ? "hero-enter-delay-1"
                  : index === 1
                    ? "hero-enter-delay-2"
                    : "hero-enter-delay-3"
              }`}
              key={name}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`status-breathe h-2.5 w-2.5 rounded-full shadow-[0_0_0_6px] ${color} ${shadow}`}
                  style={{ animationDelay: `${index * 220}ms` }}
                />
                <span className="text-sm font-semibold">{name}</span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {status}
              </span>
              <span
                className="latency-glow text-sm font-bold text-slate-950"
                style={{ animationDelay: `${index * 180}ms` }}
              >
                {latency}
              </span>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute left-4 right-4 top-[94px] h-px overflow-hidden bg-slate-200">
          <div className="pulse-scan h-px w-1/2 bg-gradient-to-r from-transparent via-slate-950 to-transparent" />
        </div>

        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-3">
          {[
            ["99.98%", "uptime"],
            ["18", "checks/min"],
            ["2", "open issues"],
          ].map(([value, label]) => (
            <div
              className="hero-enter hero-enter-delay-3 rounded-md border border-slate-200 bg-white p-3"
              key={label}
            >
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
