import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { OAuthButtons } from "../components/auth/OAuthButtons.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input } from "../components/ui/Input.jsx";
import { PingBackground } from "../components/visual/PingBackground.jsx";
import { getAuthToken, setAuthToken } from "../lib/auth-storage.js";
import { loginUser } from "../services/auth-api.js";

function AuthField({ icon: Icon, label, rightElement, ...props }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={17}
        />
        <Input className="pl-9 pr-11" {...props} />
        {rightElement}
      </span>
    </label>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const oauthError = searchParams.get("oauth_error");
  const displayError = error || oauthError;

  if (getAuthToken()) {
    return <Navigate to="/app" replace />;
  }

  const updateField = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await loginUser(formData);
      setAuthToken(result.data.token);
      navigate("/app", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 overflow-hidden px-5 pb-16 pt-8 lg:grid-cols-[0.95fr_1fr]">
      <PingBackground className="auth-ping-field" />

      <div className="relative z-10 hidden lg:block">
        <div className="max-w-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-white">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Welcome back to Pingbase.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Jump back into your uptime dashboard, check incidents, and keep your
            monitored services in view.
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">
            Sign in
          </p>
          <h1 className="mt-2 text-3xl font-bold">Continue monitoring</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use the email and password you created for this workspace.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {displayError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {displayError}
            </p>
          ) : null}

          <AuthField
            autoComplete="email"
            icon={Mail}
            label="Email address"
            name="email"
            onChange={updateField}
            placeholder="you@example.com"
            required
            type="email"
            value={formData.email}
          />
          <AuthField
            autoComplete="current-password"
            icon={LockKeyhole}
            label="Password"
            name="password"
            onChange={updateField}
            placeholder="Password"
            required
            rightElement={
              <button
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
            type={showPassword ? "text" : "password"}
            value={formData.password}
          />
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="mt-6">
          <OAuthButtons />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link className="font-bold text-slate-950" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
