import React from "react";
import { ArrowLeft } from "lucide-react";

export default function GoBackButton() {
  const handleGoBack = () => {
    // This shouts a custom event to the browser window
    window.dispatchEvent(new CustomEvent("navigate-home"));
  };

  return (
    <button 
      onClick={handleGoBack} 
      className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 font-medium mb-6 transition cursor-pointer group w-fit"
    >
      <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" /> 
      Go Back
    </button>
  );
}