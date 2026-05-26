import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastContext } from "./toast-context.js";

const toastStyles = {
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800",
  },
  info: {
    icon: Info,
    className: "border-slate-200 bg-white text-slate-800",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = "info" }) => {
      const toastId = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id: toastId,
          message,
          title,
          type,
        },
      ]);

      window.setTimeout(() => dismissToast(toastId), 4200);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      dismissToast,
      showToast,
    }),
    [dismissToast, showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const toastStyle = toastStyles[toast.type] || toastStyles.info;
          const Icon = toastStyle.icon;

          return (
            <div
              className={`rounded-lg border p-4 shadow-lg ${toastStyle.className}`}
              key={toast.id}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0" size={18} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{toast.title}</p>
                  {toast.message ? (
                    <p className="mt-1 text-sm leading-5 opacity-80">
                      {toast.message}
                    </p>
                  ) : null}
                </div>
                <button
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition hover:bg-black/5"
                  onClick={() => dismissToast(toast.id)}
                  type="button"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
