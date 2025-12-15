"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Toast, { ToastType } from "./Toast";

interface ToastConfig {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success", duration = 3000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const showSuccess = useCallback((message: string, duration = 3000) => {
    showToast(message, "success", duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration = 4000) => {
    showToast(message, "error", duration);
  }, [showToast]);

  const showInfo = useCallback((message: string, duration = 3000) => {
    showToast(message, "info", duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration = 3500) => {
    showToast(message, "warning", duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}
