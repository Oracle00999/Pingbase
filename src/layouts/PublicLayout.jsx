import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { PulseDotLogo } from "../components/brand/PulseDotLogo.jsx";
import { Button } from "../components/ui/Button.jsx";

export function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-slate-950">
      <header className="relative z-30 mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5">
        <Link className="flex items-center gap-2 text-sm font-bold" onClick={closeMenu} to="/">
          <PulseDotLogo />
          Pingbase
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          <Link to="/docs">
            <Button variant="ghost">Docs</Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button>Start free</Button>
          </Link>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 sm:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMenuOpen ? (
          <div className="absolute left-5 right-5 top-16 rounded-lg border border-slate-200 bg-white p-2 shadow-lg sm:hidden">
            <Link
              className="flex h-11 items-center rounded-md px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              onClick={closeMenu}
              to="/docs"
            >
              Docs
            </Link>
            <Link
              className="flex h-11 items-center rounded-md px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              onClick={closeMenu}
              to="/login"
            >
              Log in
            </Link>
            <Link className="mt-2 block" onClick={closeMenu} to="/register">
              <Button className="w-full">Start free</Button>
            </Link>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
