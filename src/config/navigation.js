import {
  Activity,
  Bell,
  BookOpen,
  Gauge,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export const appNavigation = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Monitors", href: "/app/monitors", icon: Activity },
  { label: "Incidents", href: "/app/incidents", icon: Gauge },
  { label: "Alerts", href: "/app/alerts", icon: Bell },
  { label: "Docs", href: "/app/docs", icon: BookOpen },
  { label: "Settings", href: "/app/settings", icon: Settings },
];
