import React from "react";
import { MapPin, ChevronRight, X } from "lucide-react";

export default function PreviewModal({ listing, onClose, onView }) {
  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden shadow-2xl text-gray-900 dark:text-white flex flex-col">
        
        <button onClick={onClose} className="absolute top-3 right-3 z-50 text-white bg-black/30 hover:bg-black/50 p-1.5 rounded-full shadow-md transition cursor-pointer">
          <X size={18} />
        </button>

        <div className="h-56 w-full">
          <img src={listing.images[0]} alt="Cover" className="w-full h-full object-cover" />
        </div>

        <div className="p-6 flex flex-col gap-2">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-xs">{listing.category}</span>
          <h3 className="text-2xl font-extrabold line-clamp-1">{listing.name}</h3>
          
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-medium mb-4">
            <MapPin size={16} className="text-red-400" /> {listing.location}
          </div>

          <button 
            onClick={onView}
            className="w-full bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 dark:hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg mt-2 cursor-pointer flex justify-center items-center gap-2"
          >
            Have a Look! <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}