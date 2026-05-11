import React from "react";
import { X } from "lucide-react";

// Import your new separate components
import LoginView from "./LoginView";
import SignupView from "./SignupView";

export default function AuthModal({ isOpen, view, onClose, onViewChange, onLoginSuccess }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-2xl text-gray-900 dark:text-white my-8">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-1.5 rounded-full">
          <X size={20} />
        </button>

        {/* Conditionally render the correct component based on the 'view' prop */}
        {view === "signup" && (
          <SignupView onViewChange={onViewChange} />
        )}

        {view === "login" && (
          <LoginView 
            onViewChange={onViewChange} 
            onLoginSuccess={onLoginSuccess} 
            onClose={onClose} 
          />
        )}

      </div>
    </div>
  );
}