import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AppShell } from "./layouts/AppShell.jsx";
import { AlertsPage } from "./pages/AlertsPage.jsx";
import { PublicLayout } from "./layouts/PublicLayout.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { DocsPage } from "./pages/DocsPage.jsx";
import { IncidentsPage } from "./pages/IncidentsPage.jsx";
import { LandingPage } from "./pages/LandingPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { MonitorDetailPage } from "./pages/MonitorDetailPage.jsx";
import { MonitorsPage } from "./pages/MonitorsPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import { getAuthToken } from "./lib/auth-storage.js";

function RequireAuth({ children }) {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route
        path="app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route index element={<DashboardPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="monitors" element={<MonitorsPage />} />
        <Route path="monitors/:monitorId" element={<MonitorDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
