"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CircleCheck, TriangleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const TONES = {
  success: {
    Icon: CircleCheck,
    cls: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  error: {
    Icon: TriangleAlert,
    cls: "border-red-200 bg-red-50 text-red-900",
  },
  info: {
    Icon: Info,
    cls: "border-slate-200 bg-white text-slate-900",
  },
};

// Safe to call anywhere: outside the provider it simply does nothing.
export function useToast() {
  const context = useContext(ToastContext);
  return context || { show: () => 0, dismiss: () => {} };
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message, options = {}) => {
      const id = nextId.current;
      nextId.current += 1;
      const tone = TONES[options.tone] ? options.tone : "success";
      const duration = options.duration ?? (tone === "error" ? 8000 : 4000);
      setToasts((list) => [...list.slice(-3), { id, message, tone }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-4"
      >
        {toasts.map(({ id, message, tone }) => {
          const { Icon, cls } = TONES[tone];
          return (
            <div
              key={id}
              role={tone === "error" ? "alert" : "status"}
              className={`anim-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-3 text-sm shadow-lg ${cls}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="flex-1">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss message"
                className="rounded p-1 hover:bg-black/5"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
