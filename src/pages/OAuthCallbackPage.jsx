import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { setAuthToken } from "../lib/auth-storage.js";

export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const provider = searchParams.get("provider");
  const oauthError = searchParams.get("oauth_error");

  useEffect(() => {
    if (!token || oauthError) {
      return;
    }

    setAuthToken(token);
    navigate("/app", { replace: true });
  }, [navigate, oauthError, token]);

  if (oauthError) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center px-5 py-12">
        <div className="w-full rounded-lg border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-500/10 text-red-500">
            <TriangleAlert size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Sign in did not finish
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {oauthError}
          </p>
          <Link className="mt-6 block" to="/login">
            <Button className="w-full">Back to login</Button>
          </Link>
        </div>
      </section>
    );
  }

  if (!token) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center px-5 py-12">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-white">
            <TriangleAlert size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Missing sign in token
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start again from the login page.
          </p>
          <Link className="mt-6 block" to="/login">
            <Button className="w-full">Back to login</Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center px-5 py-12">
      <div className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <LoaderCircle className="mx-auto animate-spin text-emerald-500" size={30} />
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          Signing you in
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Finishing {provider || "OAuth"} authentication.
        </p>
      </div>
    </section>
  );
}
