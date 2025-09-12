export type ToastPayload = {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
};

export function notify(payload: ToastPayload | string) {
  const detail: ToastPayload =
    typeof payload === "string" ? { message: payload } : payload;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app:toast", { detail }));
  }
}

export const notifySuccess = (message: string, duration?: number) =>
  notify({ message, type: "success", duration });
export const notifyError = (message: string, duration?: number) =>
  notify({ message, type: "error", duration });
export const notifyInfo = (message: string, duration?: number) =>
  notify({ message, type: "info", duration });
