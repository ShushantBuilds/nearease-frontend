import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // 1. THE MAGIC TRICK: Intercept all native alerts globally!
    const originalAlert = window.alert;
    window.alert = (message) => {
      // We try to guess if it's an error based on the text
      const type = message?.toLowerCase().includes("fail") || message?.toLowerCase().includes("error") || message?.toLowerCase().includes("invalid") 
        ? "error" 
        : message?.toLowerCase().includes("success") ? "success" : "info";
      
      addToast(message, type);
    };

    // 2. Listen for custom advanced toasts (for future use)
    const handleCustomToast = (e) => addToast(e.detail.message, e.detail.type);
    window.addEventListener('show-toast', handleCustomToast);

    return () => {
      window.alert = originalAlert; // Cleanup
      window.removeEventListener('show-toast', handleCustomToast);
    };
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove the toast after 4 seconds
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Premium Styling Variants
  const variants = {
    success: { 
      bg: "bg-emerald-50 dark:bg-emerald-900/40", 
      border: "border-emerald-200 dark:border-emerald-800", 
      text: "text-emerald-800 dark:text-emerald-300", 
      icon: <CheckCircle className="text-emerald-500 shrink-0" size={22} /> 
    },
    error: { 
      bg: "bg-red-50 dark:bg-red-900/40", 
      border: "border-red-200 dark:border-red-800", 
      text: "text-red-800 dark:text-red-300", 
      icon: <AlertCircle className="text-red-500 shrink-0" size={22} /> 
    },
    info: { 
      bg: "bg-indigo-50 dark:bg-indigo-900/40", 
      border: "border-indigo-200 dark:border-indigo-800", 
      text: "text-indigo-800 dark:text-indigo-300", 
      icon: <Info className="text-indigo-500 shrink-0" size={22} /> 
    }
  };

  return (
    // Container sits fixed at the top right, pointer-events-none so it doesn't block clicks
    <div className="fixed top-24 right-4 sm:right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const v = variants[toast.type] || variants.info;
        
        return (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 ease-out animate-in slide-in-from-right-8 fade-in zoom-in-95 w-80 sm:w-96 ${v.bg} ${v.border}`}
          >
            {v.icon}
            <div className="flex-1">
              <p className={`text-sm font-semibold leading-snug ${v.text}`}>
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className={`shrink-0 p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity ${v.text}`}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}