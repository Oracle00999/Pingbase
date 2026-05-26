import { env } from "../../config/env.js";

function GoogleMark() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
      G
    </span>
  );
}

function GitHubMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.5v-1.78c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.9c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.78-4.57 5.04.36.32.68.94.68 1.9v2.85c0 .28.18.6.69.5A10.24 10.24 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

const providers = [
  {
    id: "google",
    label: "Google",
    icon: GoogleMark,
  },
  {
    id: "github",
    label: "GitHub",
    icon: GitHubMark,
  },
];

export function OAuthButtons({ action = "Continue" }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-bold uppercase text-slate-500">
          or
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {providers.map((provider) => {
          const Icon = provider.icon;

          return (
            <a
              className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-center text-[13px] font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              href={`${env.apiBaseUrl}/auth/${provider.id}`}
              key={provider.id}
            >
              <Icon size={18} />
              <span className="min-w-0 whitespace-nowrap">
                {action} with {provider.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
