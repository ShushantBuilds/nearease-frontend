import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function GlobalAlert() {
  const [alertData, setAlertData] = useState({ 
    isOpen: false, 
    message: '', 
    type: 'info' 
  });

  useEffect(() => {
    // Hijack the native window.alert
    const originalAlert = window.alert;
    window.alert = (message) => {
      const text = String(message).toLowerCase();
      // Smart detection to color-code the alert based on the text
      const type = text.includes("fail") || text.includes("error") || text.includes("invalid") || text.includes("match")
        ? "error" 
        : text.includes("success") || text.includes("verified") || text.includes("created") 
          ? "success" 
          : "info";
      
      setAlertData({ isOpen: true, message: String(message), type });
    };

    return () => { window.alert = originalAlert; };
  }, []);

  if (!alertData.isOpen) return null;

  const closeAlert = () => setAlertData({ ...alertData, isOpen: false });

  // Styling maps based on the type of alert
  const styles = {
    success: {
      glow: "bg-emerald-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30",
      icon: <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
    },
    error: {
      glow: "bg-rose-500",
      iconBg: "bg-rose-100 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30",
      icon: <AlertTriangle className="w-10 h-10" strokeWidth={2.5} />
    },
    info: {
      glow: "bg-indigo-500",
      iconBg: "bg-indigo-100 dark:bg-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      btn: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30",
      icon: <Info className="w-10 h-10" strokeWidth={2.5} />
    }
  };

  const current = styles[alertData.type] || styles.info;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-sm bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl rounded-[2rem] p-8 text-center overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Decorative Glowing Orb in the background corner */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${current.glow}`}></div>
        <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${current.glow}`}></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Icon Container */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner ${current.iconBg} ${current.iconColor}`}>
            {current.icon}
          </div>

          {/* Title & Message */}
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
            {alertData.type === 'success' ? 'Success!' : alertData.type === 'error' ? 'Oops!' : 'Notice'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-base font-medium mb-8 leading-relaxed">
            {alertData.message}
          </p>

          {/* Action Button */}
          <button 
            onClick={closeAlert}
            className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 cursor-pointer flex justify-center items-center ${current.btn}`}
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
}