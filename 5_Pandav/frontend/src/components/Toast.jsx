import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, description) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    
    // Auto-dismiss after 4s
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{
      success: (title, description) => addToast('success', title, description),
      error: (title, description) => addToast('error', title, description),
      warning: (title, description) => addToast('warning', title, description),
      info: (title, description) => addToast('info', title, description)
    }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    success: <CheckCircle2 className="toast-icon text-success" />,
    error: <AlertOctagon className="toast-icon text-destructive" />,
    warning: <AlertTriangle className="toast-icon text-warning" />,
    info: <Info className="toast-icon text-accent-light" />
  };

  return (
    <div className={`toast-card toast-${toast.type} glass`}>
      <div className="toast-icon-wrapper">
        {icons[toast.type]}
      </div>
      <div className="toast-content">
        <h4 className="toast-title">{toast.title}</h4>
        {toast.description && <p className="toast-desc">{toast.description}</p>}
      </div>
      <button onClick={onDismiss} className="toast-close">
        <X size={14} />
      </button>
      <div className="toast-progress" />
    </div>
  );
}
