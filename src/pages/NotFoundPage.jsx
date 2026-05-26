import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f6] px-5 text-slate-950">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist.
        </p>
        <Link className="mt-6 inline-flex" to="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </main>
  );
}
