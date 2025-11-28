// ini buat notifnya
import React, { createContext, useContext, useCallback, useMemo, useState } from "react";
import "./toast.css";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const add = useCallback((toast) => {
    const id = ++idCounter;
    const t = { id, ...toast };
    setToasts(s => [...s, t]);

    // default auto dismiss: 4s for success/info, 6s for error
    const timeout = toast.duration ?? (toast.type === "error" ? 6000 : 4000);
    if (!toast.persistent) {
      setTimeout(() => remove(id), timeout);
    }
    return id;
  }, [remove]);

  const api = useMemo(() => ({
    show: (opts) => add({ ...opts }),
    success: (msg, opts = {}) => add({ type: "success", message: msg, ...opts }),
    error: (msg, opts = {}) => add({ type: "error", message: msg, ...opts }),
    info: (msg, opts = {}) => add({ type: "info", message: msg, ...opts }),
    remove,
  }), [add, remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

/* ToastContainer renders the stack */
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-root" aria-live="polite" aria-atomic="true">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type || "info"}`} role="status">
          <div className="toast-body">
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => onRemove(t.id)} aria-label="Close">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
