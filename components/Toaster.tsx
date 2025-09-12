"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Toast = {
  id: number;
  type?: "success" | "error" | "info";
  message: string;
  duration?: number;
};

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let idCounter = 1;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Toast>;
      const toast: Toast = {
        id: idCounter++,
        type: ce.detail?.type || "info",
        message: ce.detail?.message || "",
        duration: ce.detail?.duration ?? 3000,
      };
      setToasts((prev) => [...prev, toast]);
      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration);
      return () => clearTimeout(timeout);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("app:toast", handler as EventListener);
      return () =>
        window.removeEventListener("app:toast", handler as EventListener);
    }
  }, []);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed top-3 right-3 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto min-w-[220px] max-w-[320px] rounded border px-3 py-2 shadow ${
            t.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
              : t.type === "error"
              ? "bg-red-500/15 border-red-500/40 text-red-200"
              : "bg-slate-800 border-slate-600 text-slate-100"
          }`}
        >
          <div className="text-sm">{t.message}</div>
        </div>
      ))}
    </div>,
    document.body
  );
}
